"""
ShopSense ChurnService — XGBoost Training Script
Trained on real e-commerce customer churn data
with India-specific CityTier analysis.
Run once: python app/train.py
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

DATA_PATH = 'data/E Commerce Dataset.xlsx'
SHEET_NAME = 'E Comm'
MODEL_DIR = 'app/models'
RANDOM_STATE = 42

CATEGORICAL_FEATURES = [
    'PreferredLoginDevice',
    'PreferredPaymentMode',
    'Gender',
    'PreferedOrderCat',
    'MaritalStatus'
]

NUMERICAL_FEATURES = [
    'Tenure',
    'CityTier',
    'WarehouseToHome',
    'HourSpendOnApp',
    'NumberOfDeviceRegistered',
    'SatisfactionScore',
    'NumberOfAddress',
    'Complain',
    'OrderAmountHikeFromlastYear',
    'CouponUsed',
    'OrderCount',
    'DaySinceLastOrder',
    'CashbackAmount'
]

ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = 'Churn'


def load_and_clean_data(path: str, sheet: str) -> pd.DataFrame:
    print(f"\n{'='*60}")
    print("STEP 1: Loading dataset")
    print(f"{'='*60}")

    df = pd.read_excel(path, sheet_name=sheet)
    print(f"Raw shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    print(f"\nChurn distribution:")
    print(df[TARGET].value_counts())
    print(f"Churn rate: {df[TARGET].mean():.1%}")

    if 'CustomerID' in df.columns:
        df = df.drop('CustomerID', axis=1)

    for col in NUMERICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0])

    print(f"\nCityTier distribution:")
    print(df['CityTier'].value_counts().sort_index())
    print(f"\nChurn rate by CityTier:")
    print(df.groupby('CityTier')[TARGET].mean().round(3))
    print(f"\nChurn rate by SatisfactionScore:")
    print(df.groupby('SatisfactionScore')[TARGET].mean().round(3))

    return df


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
            print(f"  {col}: {list(le.classes_)}")

    return df_enc, encoders


def train_model(df: pd.DataFrame, encoders: dict) -> tuple:
    print(f"\n{'='*60}")
    print("STEP 3: Training XGBoost model")
    print(f"{'='*60}")

    available = [f for f in ALL_FEATURES if f in df.columns]
    print(f"Features used: {len(available)}")
    print(f"Features: {available}")

    X = df[available].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    print(f"\nTrain: {len(X_train):,}")
    print(f"Test : {len(X_test):,}")
    print(f"Churn rate (train): {y_train.mean():.1%}")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"\nApplying SMOTE...")
    try:
        smote = SMOTE(
            random_state=RANDOM_STATE,
            k_neighbors=min(5, int(y_train.sum()) - 1)
        )
        X_train_sm, y_train_sm = smote.fit_resample(X_train_scaled, y_train)
        print(f"After SMOTE: {len(X_train_sm):,} samples, churn rate: {y_train_sm.mean():.1%}")
    except Exception as e:
        print(f"SMOTE skipped: {e}")
        X_train_sm = X_train_scaled
        y_train_sm = y_train

    scale_pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    model = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric='auc',
        random_state=RANDOM_STATE,
        n_jobs=-1,
        tree_method='hist'
    )

    model.fit(
        X_train_sm, y_train_sm,
        eval_set=[(X_test_scaled, y_test)],
        verbose=50
    )

    return model, scaler, X_test_scaled, y_test, available


def evaluate_model(model, X_test: np.ndarray, y_test: np.ndarray, feature_names: list) -> dict:
    print(f"\n{'='*60}")
    print("STEP 4: Evaluating model")
    print(f"{'='*60}")

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print(f"\nModel Performance:")
    print(f"  ROC-AUC  : {auc:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print(f"  F1 Score : {f1:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Stays', 'Churns']))

    importance = dict(zip(feature_names, model.feature_importances_))
    print(f"\nTop Feature Importances:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10]:
        bar = '#' * int(imp * 40)
        print(f"  {feat:<35} {imp:.4f} {bar}")

    return {
        'roc_auc': round(auc, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'feature_importance': {k: round(float(v), 4) for k, v in importance.items()}
    }


def build_citytier_analysis(df: pd.DataFrame) -> dict:
    print(f"\n{'='*60}")
    print("STEP 5: CityTier analysis")
    print(f"{'='*60}")

    city_labels = {
        1: 'Tier 1 (Metro — Mumbai, Delhi, Bangalore)',
        2: 'Tier 2 (Mid-size — Pune, Jaipur, Lucknow)',
        3: 'Tier 3 (Small — Smaller towns)'
    }

    analysis = {}
    for tier in [1, 2, 3]:
        tier_df = df[df['CityTier'] == tier]
        if len(tier_df) == 0:
            continue

        churn_rate = tier_df[TARGET].mean()
        avg_tenure = tier_df['Tenure'].mean()
        avg_satisfaction = tier_df['SatisfactionScore'].mean()
        avg_cashback = tier_df['CashbackAmount'].mean()
        avg_orders = tier_df['OrderCount'].mean()
        complain_rate = tier_df['Complain'].mean()

        analysis[str(tier)] = {
            'label': city_labels[tier],
            'customer_count': int(len(tier_df)),
            'churn_rate': round(churn_rate, 3),
            'avg_tenure_months': round(avg_tenure, 1),
            'avg_satisfaction': round(avg_satisfaction, 2),
            'avg_cashback': round(avg_cashback, 2),
            'avg_orders': round(avg_orders, 2),
            'complain_rate': round(complain_rate, 3),
            'risk_level': (
                'HIGH' if churn_rate > 0.25
                else 'MEDIUM' if churn_rate > 0.15
                else 'LOW'
            )
        }
        print(f"\nTier {tier} — {city_labels[tier]}:")
        print(f"  Customers  : {len(tier_df):,}")
        print(f"  Churn Rate : {churn_rate:.1%}")
        print(f"  Avg Tenure : {avg_tenure:.1f} months")
        print(f"  Satisfaction: {avg_satisfaction:.2f}/5")

    return analysis


def save_artifacts(model, scaler, encoders: dict, metrics: dict, citytier: dict, feature_names: list) -> None:
    print(f"\n{'='*60}")
    print("STEP 6: Saving artifacts")
    print(f"{'='*60}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    model_path = os.path.join(MODEL_DIR, 'churn_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved    -> {model_path}")

    scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved   -> {scaler_path}")

    enc_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
    joblib.dump(encoders, enc_path)
    print(f"Encoders saved -> {enc_path}")

    metadata = {
        'trained_at': datetime.now().isoformat(),
        'model_type': 'XGBoostClassifier',
        'dataset': 'E-Commerce Customer Churn',
        'total_samples': 5630,
        'churn_threshold': 0.5,
        'feature_names': feature_names,
        'categorical_features': CATEGORICAL_FEATURES,
        'numerical_features': NUMERICAL_FEATURES,
        'citytier_analysis': citytier,
        'metrics': metrics
    }
    meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved -> {meta_path}")

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"ROC-AUC : {metrics['roc_auc']}")
    print(f"F1 Score: {metrics['f1_score']}")
    print(f"\nCityTier Churn Rates:")
    for tier, data in citytier.items():
        print(f"  Tier {tier}: {data['churn_rate']:.1%} ({data['risk_level']})")
    print(f"\nChurnService is ready!")


def main():
    print("ShopSense ChurnService — XGBoost Training")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    df = load_and_clean_data(DATA_PATH, SHEET_NAME)
    df_enc, encoders = encode_features(df)
    model, scaler, X_test, y_test, features = train_model(df_enc, encoders)
    metrics = evaluate_model(model, X_test, y_test, features)
    citytier = build_citytier_analysis(df)
    save_artifacts(model, scaler, encoders, metrics, citytier, features)


if __name__ == '__main__':
    main()
