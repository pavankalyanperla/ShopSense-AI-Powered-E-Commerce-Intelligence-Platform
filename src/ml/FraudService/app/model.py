"""
FraudService model loader and prediction engine.
Loads trained XGBoost model on startup and serves predictions.
"""

import joblib
import json
import os
import numpy as np
from typing import Optional
from app.schemas import (
    FraudPredictionRequest,
    FraudPredictionResponse,
    RiskLevel,
    ModelInfoResponse
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

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
FRAUD_THRESHOLD = 0.75


class FraudDetectionModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = None
        self.metadata = None
        self.model_loaded = False
        self._load()

    def _load(self):
        model_path = os.path.join(MODEL_DIR, 'fraud_model.pkl')
        scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
        encoders_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if not os.path.exists(model_path):
            print(f"[FraudService] Model not found at {model_path}. Run: python app/train.py first.", flush=True)
            return

        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.encoders = joblib.load(encoders_path)

            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            trained = self.metadata.get('trained_at', 'unknown') if self.metadata else 'unknown'
            print(f"[FraudService] Model loaded OK — trained: {trained}", flush=True)
        except Exception as e:
            print(f"[FraudService] ERROR loading model: {e}", flush=True)

    def _encode_input(self, request: FraudPredictionRequest) -> np.ndarray:
        payment_map = {
            'COD': 'COD',
            'UPI': 'UPI',
            'DebitCard': 'Debit Card',
            'CreditCard': 'Credit Card',
            'NetBanking': 'Net Banking',
            'Wallet': 'Wallet',
            'Debit Card': 'Debit Card',
            'Credit Card': 'Credit Card',
            'Net Banking': 'Net Banking'
        }

        payment = payment_map.get(request.payment_method, request.payment_method)

        cat_values = []
        cat_inputs = {
            'Payment_Method': payment,
            'Product_Category': request.product_category,
            'Device_Used': request.device_used
        }

        for feat in CATEGORICAL_FEATURES:
            encoder = self.encoders.get(feat)
            val = cat_inputs[feat]
            if encoder:
                try:
                    encoded = encoder.transform([str(val)])[0]
                except ValueError:
                    encoded = 0
            else:
                encoded = 0
            cat_values.append(encoded)

        num_values = [
            float(request.transaction_amount),
            float(request.quantity),
            float(request.customer_age),
            float(request.account_age_days),
            float(request.transaction_hour)
        ]

        features = np.array(cat_values + num_values).reshape(1, -1)
        features = self.scaler.transform(features)
        return features

    def _get_risk_level(self, probability: float) -> RiskLevel:
        if probability >= 0.90:
            return RiskLevel.CRITICAL
        elif probability >= 0.75:
            return RiskLevel.HIGH
        elif probability >= 0.50:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW

    def _get_risk_factors(self, request: FraudPredictionRequest, probability: float) -> list[str]:
        factors = []

        if request.transaction_amount > 50000:
            factors.append(f"High transaction amount (Rs.{request.transaction_amount:,.0f})")
        if request.account_age_days < 30:
            factors.append(f"New account ({request.account_age_days} days old)")
        if request.transaction_hour in list(range(0, 5)) + [23]:
            factors.append(f"Unusual transaction time ({request.transaction_hour}:00)")
        if request.payment_method in ['Credit Card', 'CreditCard']:
            factors.append("Credit card payment (higher fraud risk)")
        if request.quantity > 10:
            factors.append(f"Bulk order quantity ({request.quantity} items)")
        if request.customer_age < 20 or request.customer_age > 65:
            factors.append(f"Atypical customer age ({request.customer_age})")

        if not factors:
            if probability > 0.5:
                factors.append("Combination of subtle risk signals detected by ML model")
            else:
                factors.append("Transaction patterns within normal range")

        return factors[:3]

    def predict(self, request: FraudPredictionRequest) -> FraudPredictionResponse:
        if not self.model_loaded:
            return self._rule_based_fallback(request)

        try:
            features = self._encode_input(request)
            probability = float(self.model.predict_proba(features)[0][1])

            is_fraud = probability >= FRAUD_THRESHOLD
            risk_level = self._get_risk_level(probability)
            risk_score = int(probability * 100)
            factors = self._get_risk_factors(request, probability)

            recommendation = (
                "BLOCK - High fraud probability. Place order on FraudHold."
                if is_fraud else
                "APPROVE - Transaction within acceptable risk parameters."
            )

            return FraudPredictionResponse(
                fraud_probability=round(probability, 4),
                is_fraud=is_fraud,
                risk_level=risk_level,
                risk_score=risk_score,
                threshold_used=FRAUD_THRESHOLD,
                top_risk_factors=factors,
                recommendation=recommendation
            )

        except Exception as e:
            print(f"Prediction error: {e}")
            return self._rule_based_fallback(request)

    def _rule_based_fallback(self, request: FraudPredictionRequest) -> FraudPredictionResponse:
        risk_score = 0

        if request.transaction_amount > 100000:
            risk_score += 40
        elif request.transaction_amount > 50000:
            risk_score += 20
        elif request.transaction_amount > 10000:
            risk_score += 10

        if request.account_age_days < 7:
            risk_score += 30
        elif request.account_age_days < 30:
            risk_score += 15

        if request.transaction_hour in range(0, 5):
            risk_score += 20
        elif request.transaction_hour in [22, 23]:
            risk_score += 10

        if request.quantity > 15:
            risk_score += 20
        elif request.quantity > 8:
            risk_score += 10

        probability = min(risk_score / 100, 0.99)
        is_fraud = probability >= FRAUD_THRESHOLD
        risk_level = self._get_risk_level(probability)
        factors = self._get_risk_factors(request, probability)

        return FraudPredictionResponse(
            fraud_probability=round(probability, 4),
            is_fraud=is_fraud,
            risk_level=risk_level,
            risk_score=risk_score,
            threshold_used=FRAUD_THRESHOLD,
            top_risk_factors=factors,
            recommendation=(
                "BLOCK - High fraud risk (rule-based)."
                if is_fraud else
                "APPROVE - Low fraud risk (rule-based)."
            ),
            model_version="0.0.0-rules"
        )

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            model_type=self.metadata.get('model_type', 'XGBoostClassifier') if self.metadata else 'XGBoostClassifier',
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            features=ALL_FEATURES,
            fraud_threshold=FRAUD_THRESHOLD,
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded
        )


# Singleton instance — loaded once at startup
fraud_model = FraudDetectionModel()
