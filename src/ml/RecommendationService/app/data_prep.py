"""
RecommendationService data preparation.
Loads Amazon India product catalog and generates a synthetic user-product
interaction matrix for SVD collaborative filtering.
"""

import os
import re
import numpy as np
import pandas as pd
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
CATALOG_PATH = os.path.join(DATA_DIR, 'amazon_products.csv')

MAX_PRODUCTS = 50_000
NUM_SYNTHETIC_USERS = 5_000
MAX_INTERACTIONS_PER_USER = 20
MIN_RATING = 1.0
MAX_RATING = 5.0


def _parse_price(val) -> float:
    if pd.isna(val):
        return 0.0
    s = str(val).replace(',', '').replace('₹', '').replace('$', '').strip()
    try:
        return float(s)
    except ValueError:
        return 0.0


def _parse_rating(val) -> float:
    if pd.isna(val):
        return 3.0
    try:
        return float(str(val).split()[0])
    except (ValueError, IndexError):
        return 3.0


def _parse_rating_count(val) -> int:
    if pd.isna(val):
        return 0
    s = re.sub(r'[^\d]', '', str(val))
    try:
        return int(s)
    except ValueError:
        return 0


def _extract_top_category(category_str) -> str:
    if pd.isna(category_str):
        return 'General'
    parts = str(category_str).split('|')
    return parts[0].strip() if parts else 'General'


def load_and_clean_products() -> pd.DataFrame:
    """Load Amazon India products CSV, normalize columns, drop bad rows."""
    if not os.path.exists(CATALOG_PATH):
        raise FileNotFoundError(f"Dataset not found: {CATALOG_PATH}")

    print(f"[DataPrep] Loading {CATALOG_PATH} ...", flush=True)
    df = pd.read_csv(CATALOG_PATH, encoding='utf-8', on_bad_lines='skip')
    print(f"[DataPrep] Raw rows: {len(df):,}", flush=True)

    # Normalize column names to lowercase with underscores
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # Map Amazon India dataset column variants (supports multiple known formats)
    col_map = {
        # Amazon IN dataset (asin, title, stars, reviews, price, listPrice, categoryName, imgUrl)
        'asin': 'product_id',
        'title': 'name',
        'stars': 'rating',
        'reviews': 'rating_count',
        'price': 'discounted_price',
        'listprice': 'actual_price',
        'categoryname': 'category',
        'imgurl': 'img_link',
        'producturl': 'product_link',
        # Alternative column names
        'product_name': 'name',
        'rating': 'rating',
        'rating_count': 'rating_count',
        'discounted_price': 'discounted_price',
        'actual_price': 'actual_price',
        'img_link': 'img_link',
    }

    # Rename only columns that exist and differ from target name
    existing = {k: v for k, v in col_map.items() if k in df.columns and k != v}
    df = df.rename(columns=existing)

    # Ensure product_id column (asin already renamed above if present)
    if 'product_id' not in df.columns:
        df['product_id'] = [f'P{i:06d}' for i in range(len(df))]
    df['product_id'] = df['product_id'].astype(str).str.strip()

    # Parse numeric columns
    df['discounted_price'] = df['discounted_price'].apply(_parse_price)
    df['actual_price'] = df['actual_price'].apply(_parse_price)
    df['rating'] = df['rating'].apply(_parse_rating)
    df['rating_count'] = df['rating_count'].apply(_parse_rating_count)

    # Drop rows with missing essentials
    required = ['product_id', 'name', 'discounted_price', 'rating']
    df = df.dropna(subset=[c for c in required if c in df.columns])
    df = df[df['discounted_price'] > 0]
    df = df[df['rating'].between(1.0, 5.0)]

    # Normalize category
    if 'category' in df.columns:
        df['category'] = df['category'].apply(_extract_top_category)
    else:
        df['category'] = 'General'

    # Fill optional columns
    if 'actual_price' not in df.columns:
        df['actual_price'] = df['discounted_price']
    df['actual_price'] = df['actual_price'].where(df['actual_price'] >= df['discounted_price'], df['discounted_price'])

    if 'img_link' not in df.columns:
        df['img_link'] = ''
    df['img_link'] = df['img_link'].fillna('')

    if 'name' not in df.columns and 'product_name' in df.columns:
        df['name'] = df['product_name']

    # Keep top N products by popularity
    df = df.sort_values('rating_count', ascending=False).head(MAX_PRODUCTS)
    df = df.drop_duplicates(subset=['product_id']).reset_index(drop=True)

    print(f"[DataPrep] Clean products: {len(df):,}", flush=True)
    return df


def generate_interaction_matrix(products: pd.DataFrame) -> pd.DataFrame:
    """
    Synthesize a user-product interaction matrix from product metadata.
    Each synthetic user gets affinity for 1-3 categories; ratings are
    drawn from a beta distribution anchored to the real product rating.
    """
    np.random.seed(42)
    product_ids = products['product_id'].tolist()
    categories = products['category'].unique().tolist()

    rows = []
    for user_idx in range(NUM_SYNTHETIC_USERS):
        user_id = f'U{user_idx:05d}'

        # Pick 1-3 preferred categories
        n_preferred = np.random.randint(1, min(4, len(categories) + 1))
        preferred_cats = np.random.choice(categories, size=n_preferred, replace=False)

        # Weight products: preferred category gets 5x more weight
        cat_mask = products['category'].isin(preferred_cats)
        weights = np.where(cat_mask, 5.0, 1.0)
        weights = weights / weights.sum()

        n_interactions = np.random.randint(5, MAX_INTERACTIONS_PER_USER + 1)
        chosen_indices = np.random.choice(len(products), size=min(n_interactions, len(products)), replace=False, p=weights)

        for idx in chosen_indices:
            prod = products.iloc[idx]
            true_rating = float(prod['rating'])
            # Noisy rating centered around the true product rating
            noise = np.random.normal(0, 0.5)
            synthetic_rating = np.clip(true_rating + noise, MIN_RATING, MAX_RATING)
            rows.append({
                'user_id': user_id,
                'product_id': prod['product_id'],
                'rating': round(synthetic_rating, 1)
            })

    interactions = pd.DataFrame(rows)
    interactions = interactions.drop_duplicates(subset=['user_id', 'product_id'])
    print(f"[DataPrep] Interactions generated: {len(interactions):,} "
          f"({NUM_SYNTHETIC_USERS:,} users x avg {len(interactions)//NUM_SYNTHETIC_USERS} products)", flush=True)
    return interactions
