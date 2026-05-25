"""
ShopSense PricingService -- Training Script
Gradient Boosting Regression for dynamic pricing.
Uses Amazon India Sales dataset from ForecastingService.
Run once: python app/train.py
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

DATA_PATH = '../ForecastingService/data/amazon_sales.csv'
MODEL_DIR = 'app/models'
RANDOM_STATE = 42

CATEGORICAL_FEATURES = [
    'Category',
    'ship-state'
]

NUMERICAL_FEATURES = [
    'Qty',
    'day_of_week',
    'month',
    'is_weekend',
    'is_month_end',
    'category_avg_price',
    'category_median_price',
    'state_avg_price'
]

ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = 'Amount'


def load_and_engineer_features(path: str) -> tuple[pd.DataFrame, dict]:
    print(f"\n{'='*60}")
    print("STEP 1: Loading and engineering features")
    print(f"{'='*60}")

    df = pd.read_csv(path, encoding='latin-1', low_memory=False)
    print(f"Raw shape: {df.shape}")

    df.columns = df.columns.str.strip()

    df['Date'] = pd.to_datetime(df['Date'], format='%m-%d-%y', errors='coerce')
    if df['Date'].isna().sum() > len(df) * 0.5:
        df['Date'] = pd.to_datetime(df['Date'], infer_datetime_format=True, errors='coerce')

    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
    df = df.dropna(subset=['Amount', 'Date'])
    df = df[df['Amount'] > 0]

    if 'Status' in df.columns:
        valid = ['Shipped', 'Shipped - Delivered to Buyer', 'Delivered']
        df_v = df[df['Status'].isin(valid)]
        if len(df_v) > 1000:
            df = df_v

    df['Category'] = df['Category'].fillna('Unknown')
    df['ship-state'] = df['ship-state'].fillna('Unknown').str.upper().str.strip()
    df['Qty'] = pd.to_numeric(df['Qty'], errors='coerce').fillna(1)

    df['day_of_week'] = df['Date'].dt.dayofweek
    df['month'] = df['Date'].dt.month
    df['is_weekend'] = (df['Date'].dt.dayofweek >= 5).astype(int)
    df['is_month_end'] = (df['Date'].dt.day >= 25).astype(int)

    print(f"\nEngineering category statistics...")

    cat_stats = df.groupby('Category')['Amount'].agg(
        ['mean', 'median', 'std', 'min', 'max', 'count']
    )
    cat_stats.columns = ['cat_mean', 'cat_median', 'cat_std', 'cat_min', 'cat_max', 'cat_count']

    df = df.merge(
        cat_stats.reset_index()[['Category', 'cat_mean', 'cat_median']],
        on='Category', how='left'
    )
    df['category_avg_price'] = df['cat_mean']
    df['category_median_price'] = df['cat_median']

    state_stats = df.groupby('ship-state')['Amount'].mean().reset_index()
    state_stats.columns = ['ship-state', 'state_mean']
    df = df.merge(state_stats, on='ship-state', how='left')
    df['state_avg_price'] = df['state_mean']

    print(f"Valid rows: {len(df):,}")
    print(f"Price range: Rs.{df['Amount'].min():.0f} - Rs.{df['Amount'].max():.0f}")
    print(f"Mean price: Rs.{df['Amount'].mean():.0f}")
    print(f"Median price: Rs.{df['Amount'].median():.0f}")

    cat_benchmarks = {}
    for cat, row in cat_stats.iterrows():
        cat_benchmarks[cat] = {
            'avg_price': round(float(row['cat_mean']), 2),
            'median_price': round(float(row['cat_median']), 2),
            'std_price': round(float(row['cat_std']), 2),
            'min_price': round(float(row['cat_min']), 2),
            'max_price': round(float(row['cat_max']), 2),
            'order_count': int(row['cat_count'])
        }

    print(f"\nTop categories by order count:")
    top_cats = sorted(
        cat_benchmarks.items(),
        key=lambda x: x[1]['order_count'],
        reverse=True
    )[:5]
    for cat, stats in top_cats:
        print(f"  {cat}: {stats['order_count']:,} orders, avg Rs.{stats['avg_price']:.0f}")

    return df, cat_benchmarks


def encode_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    print(f"\n{'='*60}")
    print("STEP 2: Encoding features")
    print(f"{'='*60}")

    encoders = {}
    df_enc = df.copy()

    for col in CATEGORICAL_FEATURES:
        if col in df_enc.columns:
            le = LabelEncoder()
            df_enc[col] = le.fit_transform(df_enc[col].astype(str))
            encoders[col] = le
            print(f"  {col}: {len(le.classes_)} classes")

    return df_enc, encoders


def train_model(df: pd.DataFrame) -> tuple:
    print(f"\n{'='*60}")
    print("STEP 3: Training Gradient Boosting model")
    print(f"{'='*60}")

    available = [f for f in ALL_FEATURES if f in df.columns]
    print(f"Features: {available}")

    X = df[available].values
    y = df[TARGET].values

    y_log = np.log1p(y)

    X_train, X_test, y_train, y_test, y_train_orig, y_test_orig = train_test_split(
        X, y_log, y, test_size=0.2, random_state=RANDOM_STATE
    )

    print(f"Train: {len(X_train):,}")
    print(f"Test : {len(X_test):,}")

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    print("\nTraining Gradient Boosting Regressor...")
    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        min_samples_leaf=20,
        random_state=RANDOM_STATE,
        verbose=0
    )
    model.fit(X_train_s, y_train)

    return model, scaler, X_test_s, y_test, y_test_orig, available


def evaluate_model(
    model,
    X_test: np.ndarray,
    y_test_log: np.ndarray,
    y_test_orig: np.ndarray,
    feature_names: list
) -> dict:
    print(f"\n{'='*60}")
    print("STEP 4: Evaluating model")
    print(f"{'='*60}")

    y_pred_log = model.predict(X_test)
    y_pred = np.expm1(y_pred_log)
    y_pred = np.maximum(y_pred, 0)

    mae = mean_absolute_error(y_test_orig, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))
    r2 = r2_score(y_test_orig, y_pred)
    mape = np.mean(
        np.abs((y_test_orig - y_pred) / np.maximum(y_test_orig, 1))
    ) * 100

    print(f"\nModel Performance:")
    print(f"  MAE  : Rs.{mae:,.0f}")
    print(f"  RMSE : Rs.{rmse:,.0f}")
    print(f"  R2   : {r2:.4f}")
    print(f"  MAPE : {mape:.1f}%")

    importance = dict(zip(feature_names, model.feature_importances_))
    print(f"\nFeature Importances:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        bar = '#' * int(imp * 50)
        print(f"  {feat:<30} {imp:.4f} {bar}")

    return {
        'mae': round(mae, 2),
        'rmse': round(rmse, 2),
        'r2': round(r2, 4),
        'mape': round(mape, 2),
        'feature_importance': {k: round(float(v), 4) for k, v in importance.items()}
    }


def save_artifacts(
    model, scaler, encoders: dict,
    cat_benchmarks: dict,
    metrics: dict,
    feature_names: list
) -> None:
    print(f"\n{'='*60}")
    print("STEP 5: Saving artifacts")
    print(f"{'='*60}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(model, os.path.join(MODEL_DIR, 'pricing_model.pkl'))
    print("pricing_model.pkl saved")

    joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))
    print("scaler.pkl saved")

    joblib.dump(encoders, os.path.join(MODEL_DIR, 'label_encoders.pkl'))
    print("label_encoders.pkl saved")

    joblib.dump(cat_benchmarks, os.path.join(MODEL_DIR, 'category_stats.pkl'))
    print(f"category_stats.pkl saved ({len(cat_benchmarks)} categories)")

    metadata = {
        'trained_at': datetime.now().isoformat(),
        'model_type': 'GradientBoostingRegressor',
        'dataset': 'Amazon India Sales (128K orders)',
        'target': 'Amount (INR)',
        'target_transform': 'log1p',
        'feature_names': feature_names,
        'categorical_features': CATEGORICAL_FEATURES,
        'numerical_features': NUMERICAL_FEATURES,
        'metrics': metrics,
        'categories_available': list(cat_benchmarks.keys())
    }
    with open(os.path.join(MODEL_DIR, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    print("model_metadata.json saved")

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"MAE  : Rs.{metrics['mae']:,.0f}")
    print(f"RMSE : Rs.{metrics['rmse']:,.0f}")
    print(f"R2   : {metrics['r2']}")
    print(f"MAPE : {metrics['mape']:.1f}%")
    print(f"\nPricingService is ready!")


def main():
    print("ShopSense PricingService -- Training")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    df, cat_benchmarks = load_and_engineer_features(DATA_PATH)
    df_enc, encoders = encode_features(df)
    model, scaler, X_test, y_test_log, y_test_orig, features = train_model(df_enc)
    metrics = evaluate_model(model, X_test, y_test_log, y_test_orig, features)
    save_artifacts(model, scaler, encoders, cat_benchmarks, metrics, features)


if __name__ == '__main__':
    main()
