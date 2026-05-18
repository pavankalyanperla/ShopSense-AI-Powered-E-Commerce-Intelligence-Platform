"""
ShopSense FraudService — XGBoost Training Script
Trains on Kaggle fraudulent e-commerce transactions dataset.
Run once: python app/train.py
"""

import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

# ── Config ──────────────────────────────────────────────
DATA_PATH = 'data/fraud_transactions.csv'
MODEL_DIR = 'app/models'
FRAUD_THRESHOLD = 0.75
RANDOM_STATE = 42

# ── Feature columns ──────────────────────────────────────
CATEGORICAL_FEATURES = [
    'Payment_Method',
    'Product_Category',
    'Device_Used'
]

NUMERICAL_FEATURES = [
    'Transaction_Amount',
    'Quantity',
    'Customer_Age',
    'Account_Age_Days',
    'Transaction_Hour'
]

ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = 'Is_Fraudulent'


def load_and_clean_data(path: str) -> pd.DataFrame:
    print(f"\n{'='*60}")
    print("STEP 1: Loading dataset")
    print(f"{'='*60}")

    df = pd.read_csv(path)
    print(f"Raw shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    col_map = {
        'Transaction Amount': 'Transaction_Amount',
        'Payment Method': 'Payment_Method',
        'Product Category': 'Product_Category',
        'Customer Age': 'Customer_Age',
        'Device Used': 'Device_Used',
        'Is Fraudulent': 'Is_Fraudulent',
        'Account Age Days': 'Account_Age_Days',
        'Transaction Hour': 'Transaction_Hour',
        'transaction_amount': 'Transaction_Amount',
        'payment_method': 'Payment_Method',
        'product_category': 'Product_Category',
        'customer_age': 'Customer_Age',
        'device_used': 'Device_Used',
        'is_fraudulent': 'Is_Fraudulent',
        'account_age_days': 'Account_Age_Days',
        'transaction_hour': 'Transaction_Hour',
    }
    df.rename(columns=col_map, inplace=True)

    df = df.dropna(subset=[TARGET])
    df[TARGET] = df[TARGET].astype(int)

    for col in NUMERICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
        else:
            print(f"WARNING: Column {col} not found — filling with 0")
            df[col] = 0

    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0])
        else:
            print(f"WARNING: Column {col} not found — filling with 'Unknown'")
            df[col] = 'Unknown'

    if 'Transaction_Hour' not in df.columns:
        if 'Transaction Date' in df.columns:
            df['Transaction_Hour'] = pd.to_datetime(
                df['Transaction Date'], errors='coerce'
            ).dt.hour.fillna(12).astype(int)
        else:
            df['Transaction_Hour'] = 12

    print(f"Clean shape: {df.shape}")
    print(f"Fraud rate: {df[TARGET].mean():.2%}")
    print(f"Fraud count: {df[TARGET].sum():,}")
    print(f"Legit count: {(df[TARGET]==0).sum():,}")

    return df


def encode_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    print(f"\n{'='*60}")
    print("STEP 2: Encoding categorical features")
    print(f"{'='*60}")

    encoders = {}
    df_enc = df.copy()

    for col in CATEGORICAL_FEATURES:
        le = LabelEncoder()
        df_enc[col] = le.fit_transform(df_enc[col].astype(str))
        encoders[col] = le
        print(f"  {col}: {len(le.classes_)} classes → {list(le.classes_[:5])}...")

    return df_enc, encoders


def train_model(df: pd.DataFrame, encoders: dict) -> tuple:
    print(f"\n{'='*60}")
    print("STEP 3: Preparing features")
    print(f"{'='*60}")

    X = df[ALL_FEATURES].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train size: {len(X_train):,}")
    print(f"Test size : {len(X_test):,}")

    print(f"\n{'='*60}")
    print("STEP 4: Scaling features")
    print(f"{'='*60}")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    print(f"\n{'='*60}")
    print("STEP 5: Applying SMOTE oversampling")
    print(f"{'='*60}")
    fraud_rate = y_train.mean()
    print(f"Before SMOTE — fraud rate: {fraud_rate:.2%}")

    if fraud_rate < 0.3:
        try:
            smote = SMOTE(
                random_state=RANDOM_STATE,
                k_neighbors=min(5, int(y_train.sum()) - 1)
            )
            X_train, y_train = smote.fit_resample(X_train, y_train)
            print(f"After SMOTE — fraud rate: {y_train.mean():.2%}")
            print(f"New train size: {len(X_train):,}")
        except Exception as e:
            print(f"SMOTE skipped: {e}")

    print(f"\n{'='*60}")
    print("STEP 6: Training XGBoost model")
    print(f"{'='*60}")

    scale_pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
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
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=50
    )

    return model, scaler, X_test, y_test


def evaluate_model(model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    print(f"\n{'='*60}")
    print("STEP 7: Evaluating model")
    print(f"{'='*60}")

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= FRAUD_THRESHOLD).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print(f"\nModel Performance @ threshold={FRAUD_THRESHOLD}")
    print(f"  ROC-AUC Score : {auc:.4f}")
    print(f"  Precision     : {precision:.4f}")
    print(f"  Recall        : {recall:.4f}")
    print(f"  F1 Score      : {f1:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud']))
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  TN={cm[0,0]:,}  FP={cm[0,1]:,}")
    print(f"  FN={cm[1,0]:,}  TP={cm[1,1]:,}")

    feature_importance = dict(zip(ALL_FEATURES, model.feature_importances_))
    print(f"\nTop Feature Importances:")
    for feat, imp in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        bar = '█' * int(imp * 50)
        print(f"  {feat:<25} {imp:.4f} {bar}")

    return {
        'roc_auc': round(auc, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'threshold': FRAUD_THRESHOLD,
        'feature_importance': {k: round(float(v), 4) for k, v in feature_importance.items()}
    }


def save_artifacts(model, scaler, encoders: dict, metrics: dict) -> None:
    print(f"\n{'='*60}")
    print("STEP 8: Saving model artifacts")
    print(f"{'='*60}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    model_path = os.path.join(MODEL_DIR, 'fraud_model.pkl')
    joblib.dump(model, model_path)
    print(f"✅ Model saved      → {model_path}")

    scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"✅ Scaler saved     → {scaler_path}")

    encoders_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
    joblib.dump(encoders, encoders_path)
    print(f"✅ Encoders saved   → {encoders_path}")

    metadata = {
        'trained_at': datetime.now().isoformat(),
        'model_type': 'XGBoostClassifier',
        'framework': 'xgboost',
        'features': ALL_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES,
        'numerical_features': NUMERICAL_FEATURES,
        'fraud_threshold': FRAUD_THRESHOLD,
        'metrics': metrics
    }
    meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata saved   → {meta_path}")

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"ROC-AUC  : {metrics['roc_auc']}")
    print(f"F1 Score : {metrics['f1_score']}")
    print(f"Threshold: {FRAUD_THRESHOLD}")
    print(f"\nFraudService is ready to serve predictions!")


def main():
    print("ShopSense FraudService — XGBoost Training")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if not os.path.exists(DATA_PATH):
        print(f"\n❌ Dataset not found at: {DATA_PATH}")
        print("Creating synthetic dataset for testing...")
        from create_synthetic_data import create_synthetic_fraud_data
        create_synthetic_fraud_data(50000)

    df = load_and_clean_data(DATA_PATH)
    df_enc, encoders = encode_features(df)
    model, scaler, X_test, y_test = train_model(df_enc, encoders)
    metrics = evaluate_model(model, X_test, y_test)
    save_artifacts(model, scaler, encoders, metrics)


if __name__ == '__main__':
    main()
