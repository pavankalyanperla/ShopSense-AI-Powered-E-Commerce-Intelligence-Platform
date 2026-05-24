"""
ShopSense ForecastingService -- Training Script
Holt-Winters Exponential Smoothing on Amazon India Sales data.
Multiplicative trend + weekly seasonality = same intuition as Prophet,
pure Python -- no C++ compiler required.
Run once: python -m app.train  (from ForecastingService directory)
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')

from datetime import datetime
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error, mean_squared_error

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'amazon_sales.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


def load_and_prepare_data(path: str) -> tuple:
    print(f"\n{'='*60}")
    print("STEP 1: Loading and preparing data")
    print(f"{'='*60}")

    df = pd.read_csv(path, encoding='latin-1', low_memory=False)
    df.columns = df.columns.str.strip()
    print(f"Raw shape: {df.shape}", flush=True)

    # Parse date — format is MM-DD-YY
    df['Date'] = pd.to_datetime(df['Date'], format='%m-%d-%y', errors='coerce')
    if df['Date'].isna().sum() > len(df) * 0.5:
        df['Date'] = pd.to_datetime(df['Date'], infer_datetime_format=True, errors='coerce')

    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
    df = df.dropna(subset=['Date', 'Amount'])
    df = df[df['Amount'] > 0]

    # Keep shipped/delivered orders only
    if 'Status' in df.columns:
        valid_statuses = [
            'Shipped', 'Shipped - Delivered to Buyer', 'Delivered',
            'Shipped - Picked Up', 'Shipped - Out for Delivery',
        ]
        df_valid = df[df['Status'].isin(valid_statuses)]
        if len(df_valid) > 1000:
            df = df_valid

    print(f"Valid rows: {len(df):,}", flush=True)
    print(f"Date range: {df['Date'].min().date()} to {df['Date'].max().date()}", flush=True)
    print(f"Total revenue: Rs.{df['Amount'].sum():,.0f}", flush=True)

    # Aggregate to daily revenue — fill any missing days with 0
    daily = (
        df.groupby('Date')
        .agg(y=('Amount', 'sum'), orders=('Amount', 'count'))
        .reset_index()
        .sort_values('Date')
    )

    # Fill missing dates so the series is contiguous
    date_range = pd.date_range(daily['Date'].min(), daily['Date'].max(), freq='D')
    daily = daily.set_index('Date').reindex(date_range, fill_value=0).reset_index()
    daily.columns = ['ds', 'y', 'orders']

    print(f"\nDaily time series: {len(daily):,} days", flush=True)
    print(f"Avg daily revenue: Rs.{daily['y'].mean():,.0f}", flush=True)
    print(f"Max daily revenue: Rs.{daily['y'].max():,.0f}", flush=True)

    return df, daily


def _fit_hw(series: pd.Series) -> object:
    """Fit best Holt-Winters model; fall back to simpler model on failure."""
    n = len(series)
    seasonal_periods = 7  # weekly seasonality

    if n < seasonal_periods * 2:
        # Not enough data for seasonal model — use simple exponential smoothing
        from statsmodels.tsa.holtwinters import SimpleExpSmoothing
        return SimpleExpSmoothing(series, initialization_method='estimated').fit(optimized=True)

    # Try multiplicative trend + multiplicative seasonal
    try:
        model = ExponentialSmoothing(
            series,
            trend='mul',
            seasonal='mul',
            seasonal_periods=seasonal_periods,
            initialization_method='estimated',
        ).fit(optimized=True, use_brute=True)
        return model
    except Exception:
        pass

    # Fall back to additive
    try:
        model = ExponentialSmoothing(
            series,
            trend='add',
            seasonal='add',
            seasonal_periods=seasonal_periods,
            initialization_method='estimated',
        ).fit(optimized=True)
        return model
    except Exception:
        pass

    # Last resort: trend only, no seasonality
    return ExponentialSmoothing(
        series, trend='add', initialization_method='estimated'
    ).fit(optimized=True)


def train_overall_model(daily: pd.DataFrame) -> tuple:
    print(f"\n{'='*60}")
    print("STEP 2: Training overall Holt-Winters model")
    print(f"{'='*60}")

    split_idx = int(len(daily) * 0.8)
    train_series = daily['y'].iloc[:split_idx]
    val_series = daily['y'].iloc[split_idx:]
    print(f"Training on {len(train_series)} days, validating on {len(val_series)} days", flush=True)

    # Validate
    val_model = _fit_hw(train_series)
    val_forecast = val_model.forecast(len(val_series))
    mae = float(mean_absolute_error(val_series, val_forecast))
    rmse = float(np.sqrt(mean_squared_error(val_series, val_forecast)))
    mape = float(np.mean(
        np.abs((val_series.values - val_forecast.values) / np.maximum(val_series.values, 1))
    ) * 100)
    print(f"Validation  MAE : Rs.{mae:,.0f}", flush=True)
    print(f"Validation  RMSE: Rs.{rmse:,.0f}", flush=True)
    print(f"Validation  MAPE: {mape:.1f}%", flush=True)

    # Fit on full series
    print("\nFitting on full dataset...", flush=True)
    full_model = _fit_hw(daily['y'])

    # Store residual std for prediction intervals
    resid_std = float(np.std(full_model.resid))
    print(f"Residual std: Rs.{resid_std:,.0f}", flush=True)
    print("Done.", flush=True)

    metrics = {'mae': round(mae, 2), 'rmse': round(rmse, 2), 'mape': round(mape, 2)}
    return full_model, resid_std, metrics


def train_category_models(df: pd.DataFrame) -> dict:
    print(f"\n{'='*60}")
    print("STEP 3: Training category models")
    print(f"{'='*60}")

    if 'Category' not in df.columns:
        print("No Category column -- skipping", flush=True)
        return {}

    top_cats = df.groupby('Category')['Amount'].sum().nlargest(5).index.tolist()
    print(f"Top categories: {top_cats}", flush=True)

    category_models = {}
    for cat in top_cats:
        cat_daily = (
            df[df['Category'] == cat]
            .groupby('Date')
            .agg(y=('Amount', 'sum'))
            .reset_index()
            .sort_values('Date')
        )

        if len(cat_daily) < 14:
            print(f"  {cat}: only {len(cat_daily)} days -- skipping", flush=True)
            continue

        # Fill contiguous
        date_range = pd.date_range(cat_daily['Date'].min(), cat_daily['Date'].max(), freq='D')
        cat_daily = cat_daily.set_index('Date').reindex(date_range, fill_value=0).reset_index()
        cat_daily.columns = ['ds', 'y']

        try:
            print(f"  Training {cat} ({len(cat_daily)} days)...", flush=True)
            cat_model = _fit_hw(cat_daily['y'])
            cat_resid_std = float(np.std(cat_model.resid))
            category_models[cat] = {
                'model': cat_model,
                'resid_std': cat_resid_std,
                'last_date': cat_daily['ds'].max(),
                'avg_daily': float(cat_daily['y'].mean()),
            }
            print(f"  Done: {cat}", flush=True)
        except Exception as e:
            print(f"  FAILED {cat}: {e}", flush=True)

    print(f"\nTrained {len(category_models)} category models", flush=True)
    return category_models


def build_sales_summary(df: pd.DataFrame, daily: pd.DataFrame) -> dict:
    print(f"\n{'='*60}")
    print("STEP 4: Building sales summary")
    print(f"{'='*60}")

    summary = {
        'total_revenue': float(df['Amount'].sum()),
        'total_orders': int(len(df)),
        'avg_order_value': float(df['Amount'].mean()),
        'avg_daily_revenue': float(daily['y'].mean()),
        'max_daily_revenue': float(daily['y'].max()),
        'min_daily_revenue': float(daily['y'].min()),
        'date_range': {
            'start': str(daily['ds'].min().date()),
            'end': str(daily['ds'].max().date()),
            'days': int(len(daily)),
        },
    }

    df_copy = df.copy()
    df_copy['month'] = df_copy['Date'].dt.to_period('M')
    monthly = df_copy.groupby('month')['Amount'].sum()
    summary['monthly_revenue'] = {str(k): float(v) for k, v in monthly.tail(12).items()}

    summary['top_states'] = {}
    if 'ship-state' in df.columns:
        state_rev = df.groupby('ship-state')['Amount'].sum().nlargest(10)
        summary['top_states'] = {k: float(v) for k, v in state_rev.items()}

    summary['category_revenue'] = {}
    if 'Category' in df.columns:
        cat_rev = df.groupby('Category')['Amount'].sum().nlargest(10)
        summary['category_revenue'] = {k: float(v) for k, v in cat_rev.items()}

    print(f"Total Revenue: Rs.{summary['total_revenue']:,.0f}", flush=True)
    print(f"Total Orders : {summary['total_orders']:,}", flush=True)
    print(f"Avg Order    : Rs.{summary['avg_order_value']:,.0f}", flush=True)
    return summary


def save_artifacts(model, resid_std: float, category_models: dict, summary: dict, metrics: dict, last_date) -> None:
    print(f"\n{'='*60}")
    print("STEP 5: Saving artifacts")
    print(f"{'='*60}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    # Save overall model + residual std
    model_path = os.path.join(MODEL_DIR, 'prophet_model.pkl')
    joblib.dump({'model': model, 'resid_std': resid_std}, model_path)
    print(f"Overall model --> {model_path}", flush=True)

    # Save category model metadata + individual pkl files
    cat_meta = {}
    for cat, data in category_models.items():
        cat_meta[cat] = {
            'last_date': str(data['last_date'].date()),
            'avg_daily': data['avg_daily'],
            'resid_std': data['resid_std'],
        }
        slug = cat.lower().replace(' ', '_').replace('/', '_')
        cat_pkl = os.path.join(MODEL_DIR, f'prophet_{slug}_model.pkl')
        joblib.dump(data['model'], cat_pkl)

    cat_meta_path = os.path.join(MODEL_DIR, 'category_models.pkl')
    joblib.dump(cat_meta, cat_meta_path)
    print(f"Category meta --> {cat_meta_path} ({len(category_models)} categories)", flush=True)

    summary_path = os.path.join(MODEL_DIR, 'sales_summary.pkl')
    joblib.dump(summary, summary_path)
    print(f"Sales summary --> {summary_path}", flush=True)

    metadata = {
        'trained_at': datetime.now().isoformat(),
        'model_type': 'Holt-Winters Exponential Smoothing',
        'dataset': 'Amazon India Sales (128K orders)',
        'last_training_date': str(last_date.date()),
        'categories_trained': list(category_models.keys()),
        'metrics': metrics,
    }
    meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata      --> {meta_path}", flush=True)

    print(f"\n{'='*60}", flush=True)
    print("TRAINING COMPLETE", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"MAE  : Rs.{metrics['mae']:,.0f}", flush=True)
    print(f"RMSE : Rs.{metrics['rmse']:,.0f}", flush=True)
    print(f"MAPE : {metrics['mape']:.1f}%", flush=True)
    print("ForecastingService is ready!", flush=True)


def main():
    print("ShopSense ForecastingService -- Training", flush=True)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    df, daily = load_and_prepare_data(DATA_PATH)
    model, resid_std, metrics = train_overall_model(daily)
    category_models = train_category_models(df)
    summary = build_sales_summary(df, daily)
    save_artifacts(model, resid_std, category_models, summary, metrics, daily['ds'].max())


if __name__ == '__main__':
    main()
