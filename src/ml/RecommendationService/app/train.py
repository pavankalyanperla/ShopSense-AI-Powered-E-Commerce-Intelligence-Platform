"""
RecommendationService training script.
Trains SVD collaborative filtering via scipy.sparse.linalg.svds.
Run: python app/train.py
Expected: RMSE 0.70-1.20, training time 1-5 minutes.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
from sklearn.metrics import mean_squared_error

from app.data_prep import load_and_clean_products, generate_interaction_matrix

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

N_FACTORS = 50


def train():
    print("[Train] Loading and cleaning product catalog ...", flush=True)
    products = load_and_clean_products()

    print("[Train] Generating interaction matrix ...", flush=True)
    interactions = generate_interaction_matrix(products)
    print(f"[Train] Interaction matrix: {len(interactions):,} rows", flush=True)

    # Build user/item index mappings
    users = interactions['user_id'].unique().tolist()
    items = interactions['product_id'].unique().tolist()
    user2idx = {u: i for i, u in enumerate(users)}
    item2idx = {p: i for i, p in enumerate(items)}

    row_idx = interactions['user_id'].map(user2idx).values
    col_idx = interactions['product_id'].map(item2idx).values
    ratings = interactions['rating'].values.astype(np.float32)

    n_users = len(users)
    n_items = len(items)
    R = csr_matrix((ratings, (row_idx, col_idx)), shape=(n_users, n_items))

    print(f"[Train] Sparse matrix: {n_users} users x {n_items} items "
          f"(density={R.nnz / (n_users * n_items):.4%})", flush=True)

    # Mean-center ratings per user (only over rated items, not zeros)
    user_means = np.zeros(n_users, dtype=np.float64)
    for u in range(n_users):
        start, end = R.indptr[u], R.indptr[u + 1]
        if end > start:
            user_means[u] = float(R.data[start:end].mean())

    R_centered = R.copy().astype(np.float64)
    for u in range(n_users):
        start, end = R_centered.indptr[u], R_centered.indptr[u + 1]
        if end > start:
            R_centered.data[start:end] -= user_means[u]

    # SVD decomposition
    k = min(N_FACTORS, n_users - 1, n_items - 1)
    print(f"[Train] Running SVD (k={k}) ...", flush=True)
    U, sigma, Vt = svds(R_centered, k=k)

    # Sort by singular values descending
    sort_idx = np.argsort(-sigma)
    U = U[:, sort_idx]
    sigma = sigma[sort_idx]
    Vt = Vt[sort_idx, :]

    # Predict all known ratings and compute RMSE
    all_preds = (U * sigma) @ Vt
    known_mask = R.toarray() != 0
    y_true = R.toarray()[known_mask]
    y_pred = (all_preds + user_means[:, np.newaxis])[known_mask]
    y_pred = np.clip(y_pred, 1.0, 5.0)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(np.mean(np.abs(y_true - y_pred)))
    print(f"[Train] Training RMSE: {rmse:.4f} | MAE: {mae:.4f}", flush=True)

    # Save artifacts
    artifacts = {
        'U': U,
        'sigma': sigma,
        'Vt': Vt,
        'user_means': user_means,
        'users': users,
        'items': items,
        'user2idx': user2idx,
        'item2idx': item2idx,
    }
    model_path = os.path.join(MODEL_DIR, 'svd_model.pkl')
    catalog_path = os.path.join(MODEL_DIR, 'product_catalog.pkl')
    meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

    joblib.dump(artifacts, model_path)
    print(f"[Train] Model saved: {model_path}", flush=True)

    joblib.dump(products, catalog_path)
    print(f"[Train] Catalog saved: {catalog_path} ({len(products):,} products)", flush=True)

    metadata = {
        'model_type': 'SVD (scipy.sparse.linalg.svds)',
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'catalog_size': len(products),
        'n_users': n_users,
        'n_items': n_items,
        'interaction_count': len(interactions),
        'n_factors': k,
        'metrics': {
            'train_rmse': round(rmse, 4),
            'train_mae': round(mae, 4),
        }
    }
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"[Train] Metadata saved: {meta_path}", flush=True)
    print(f"\n[Train] Done. RMSE={rmse:.4f}  MAE={mae:.4f}", flush=True)
    return rmse


if __name__ == '__main__':
    train()
