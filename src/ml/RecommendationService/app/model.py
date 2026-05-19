"""
RecommendationService model loader and prediction engine.
SVD collaborative filtering (scipy) with Redis caching and cold-start fallback.
"""

import os
import json
import joblib
import redis
import numpy as np
import pandas as pd
from typing import Optional

from app.schemas import (
    RecommendedProduct, RecommendationResponse, SimilarProductsResponse,
    PopularProductsResponse, ModelInfoResponse
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
CACHE_TTL_SECONDS = 1800  # 30 minutes


def _redis_client() -> Optional[redis.Redis]:
    host = os.getenv('REDIS_HOST', 'redis')
    port = int(os.getenv('REDIS_PORT', '6379'))
    try:
        r = redis.Redis(host=host, port=port, decode_responses=True, socket_connect_timeout=2)
        r.ping()
        return r
    except Exception:
        return None


def _to_recommended_product(row: pd.Series, score: float, reason: str) -> RecommendedProduct:
    return RecommendedProduct(
        product_id=str(row['product_id']),
        name=str(row.get('name', 'Unknown')),
        category=str(row.get('category', 'General')),
        discounted_price=float(row.get('discounted_price', 0)),
        actual_price=float(row.get('actual_price', row.get('discounted_price', 0))),
        rating=float(row.get('rating', 3.0)),
        rating_count=int(row.get('rating_count', 0)),
        img_link=str(row.get('img_link', '')),
        score=round(float(score), 4),
        reason=reason,
    )


class RecommendationModel:

    def __init__(self):
        # SVD artifacts
        self._U: Optional[np.ndarray] = None
        self._sigma: Optional[np.ndarray] = None
        self._Vt: Optional[np.ndarray] = None
        self._user_means: Optional[np.ndarray] = None
        self._user2idx: dict = {}
        self._item2idx: dict = {}
        self._items: list = []

        self.catalog: Optional[pd.DataFrame] = None
        self.metadata: Optional[dict] = None
        self.model_loaded = False
        self._redis: Optional[redis.Redis] = None

        self._load()
        self._redis = _redis_client()
        status = "Redis connected." if self._redis else "Redis unavailable -- caching disabled."
        print(f"[RecommendationService] {status}", flush=True)

    def _load(self):
        svd_path = os.path.join(MODEL_DIR, 'svd_model.pkl')
        catalog_path = os.path.join(MODEL_DIR, 'product_catalog.pkl')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if not os.path.exists(svd_path):
            print(f"[RecommendationService] Model not found at {svd_path}. Run: python app/train.py", flush=True)
            return

        try:
            artifacts = joblib.load(svd_path)
            self._U = artifacts['U']
            self._sigma = artifacts['sigma']
            self._Vt = artifacts['Vt']
            self._user_means = artifacts['user_means']
            self._user2idx = artifacts['user2idx']
            self._item2idx = artifacts['item2idx']
            self._items = artifacts['items']

            self.catalog = joblib.load(catalog_path)

            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            size = len(self.catalog) if self.catalog is not None else 0
            trained = self.metadata.get('trained_at', 'unknown') if self.metadata else 'unknown'
            print(f"[RecommendationService] Model loaded OK -- {size:,} products, trained: {trained}", flush=True)
        except Exception as e:
            print(f"[RecommendationService] ERROR loading model: {e}", flush=True)

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def get_recommendations(
        self,
        user_id: str,
        limit: int = 10,
        category_filter: Optional[str] = None,
        exclude_product_ids: Optional[list[str]] = None,
    ) -> RecommendationResponse:

        cache_key = f"rec:{user_id}:{limit}:{category_filter or ''}"
        cached = self._get_cache(cache_key)
        if cached:
            resp = RecommendationResponse(**json.loads(cached))
            resp.cached = True
            return resp

        exclude = set(exclude_product_ids or [])

        if not self.model_loaded or self.catalog is None:
            recs = self._popular_fallback(limit, category_filter, exclude, "Popular (model not loaded)")
            return RecommendationResponse(
                user_id=user_id, recommendations=recs, total=len(recs),
                strategy="popular-fallback", model_version="0.0.0-cold"
            )

        if user_id not in self._user2idx:
            recs = self._popular_fallback(limit, category_filter, exclude, "Popular (new user)")
            resp = RecommendationResponse(
                user_id=user_id, recommendations=recs, total=len(recs),
                strategy="popular-cold-start"
            )
            self._set_cache(cache_key, resp.model_dump_json())
            return resp

        # SVD prediction for known user
        u_idx = self._user2idx[user_id]
        user_vec = (self._U[u_idx] * self._sigma) @ self._Vt  # shape: (n_items,)
        user_mean = self._user_means[u_idx]
        predicted_ratings = user_vec + user_mean
        predicted_ratings = np.clip(predicted_ratings, 1.0, 5.0)

        # Build candidate mask
        catalog = self.catalog
        if category_filter:
            catalog = catalog[catalog['category'].str.contains(category_filter, case=False, na=False)]
        catalog = catalog[~catalog['product_id'].isin(exclude)]

        results = []
        for _, row in catalog.iterrows():
            pid = str(row['product_id'])
            if pid in self._item2idx:
                score = float(predicted_ratings[self._item2idx[pid]])
            else:
                score = float(row.get('rating', 3.0))
            results.append((score, row))

        results.sort(key=lambda x: x[0], reverse=True)
        top = results[:limit]
        recs = [_to_recommended_product(row, score, "Recommended based on your taste") for score, row in top]

        resp = RecommendationResponse(
            user_id=user_id, recommendations=recs, total=len(recs),
            strategy="svd-collaborative-filtering"
        )
        self._set_cache(cache_key, resp.model_dump_json())
        return resp

    def get_similar_products(self, product_id: str, limit: int = 10) -> SimilarProductsResponse:
        if not self.model_loaded or self.catalog is None:
            return SimilarProductsResponse(product_id=product_id, similar_products=[], total=0)

        target_row = self.catalog[self.catalog['product_id'] == product_id]
        if target_row.empty:
            return SimilarProductsResponse(product_id=product_id, similar_products=[], total=0)

        target = target_row.iloc[0]
        target_cat = str(target['category'])
        target_price = float(target['discounted_price'])

        similar = self.catalog[
            (self.catalog['product_id'] != product_id) &
            (self.catalog['category'] == target_cat) &
            (self.catalog['discounted_price'] >= target_price * 0.5) &
            (self.catalog['discounted_price'] <= target_price * 2.0)
        ].copy()

        # If model is loaded, use item-factor cosine similarity
        if product_id in self._item2idx and self._Vt is not None:
            item_idx = self._item2idx[product_id]
            target_vec = self._Vt[:, item_idx]
            norm_target = np.linalg.norm(target_vec)

            scores = []
            for _, row in similar.iterrows():
                pid = str(row['product_id'])
                if pid in self._item2idx:
                    v = self._Vt[:, self._item2idx[pid]]
                    norm_v = np.linalg.norm(v)
                    cos = float(np.dot(target_vec, v) / (norm_target * norm_v + 1e-9))
                else:
                    cos = float(row.get('rating', 3.0)) / 5.0
                scores.append((cos, row))

            scores.sort(key=lambda x: x[0], reverse=True)
            recs = [_to_recommended_product(row, s, "Similar product (content + collaborative)")
                    for s, row in scores[:limit]]
        else:
            similar = similar.sort_values('rating_count', ascending=False).head(limit)
            recs = [_to_recommended_product(row, float(row['rating']), "Similar product in category")
                    for _, row in similar.iterrows()]

        return SimilarProductsResponse(product_id=product_id, similar_products=recs, total=len(recs))

    def get_popular(self, limit: int = 10, category: Optional[str] = None) -> PopularProductsResponse:
        recs = self._popular_fallback(limit, category, exclude=None, reason="Trending & highly rated")
        return PopularProductsResponse(products=recs, total=len(recs), category=category)

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            model_type=self.metadata.get('model_type', 'SVD') if self.metadata else 'SVD',
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            catalog_size=len(self.catalog) if self.catalog is not None else 0,
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded,
        )

    @property
    def catalog_size(self) -> int:
        return len(self.catalog) if self.catalog is not None else 0

    @property
    def redis_connected(self) -> bool:
        if self._redis is None:
            return False
        try:
            self._redis.ping()
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _popular_fallback(
        self,
        limit: int,
        category: Optional[str],
        exclude: Optional[set],
        reason: str,
    ) -> list[RecommendedProduct]:
        if self.catalog is None:
            return []
        df = self.catalog.copy()
        if category:
            df = df[df['category'].str.contains(category, case=False, na=False)]
        if exclude:
            df = df[~df['product_id'].isin(exclude)]
        df['_pop'] = df['rating'] * np.log1p(df['rating_count'])
        df = df.sort_values('_pop', ascending=False).head(limit)
        return [_to_recommended_product(row, float(row['rating']), reason)
                for _, row in df.iterrows()]

    def _get_cache(self, key: str) -> Optional[str]:
        if self._redis is None:
            return None
        try:
            return self._redis.get(key)
        except Exception:
            return None

    def _set_cache(self, key: str, value: str):
        if self._redis is None:
            return
        try:
            self._redis.setex(key, CACHE_TTL_SECONDS, value)
        except Exception:
            pass

    def invalidate_cache(self, user_id: str) -> int:
        if self._redis is None:
            return 0
        try:
            keys = self._redis.keys(f"rec:{user_id}:*")
            if keys:
                self._redis.delete(*keys)
            return len(keys)
        except Exception:
            return 0


# Singleton -- loaded once at startup
recommendation_model = RecommendationModel()
