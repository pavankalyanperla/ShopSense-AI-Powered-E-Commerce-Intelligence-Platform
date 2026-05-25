"""
ChurnService model loader and predictor.
XGBoost churn prediction with CityTier analysis.
"""

import joblib
import json
import os
import numpy as np
from typing import Optional

from app.schemas import (
    ChurnPredictionRequest,
    ChurnPredictionResponse,
    RiskLevel,
    CityTierAnalysis,
    ModelInfoResponse
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

CITY_TIER_LABELS = {
    1: 'Tier 1 — Metro (Mumbai, Delhi, Bangalore)',
    2: 'Tier 2 — Mid-size (Pune, Jaipur, Lucknow)',
    3: 'Tier 3 — Small Town'
}

FEATURE_ORDER = [
    'PreferredLoginDevice',
    'PreferredPaymentMode',
    'Gender',
    'PreferedOrderCat',
    'MaritalStatus',
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


class ChurnModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders: dict = {}
        self.metadata: Optional[dict] = None
        self.model_loaded = False
        self._load()

    def _load(self):
        model_path = os.path.join(MODEL_DIR, 'churn_model.pkl')
        scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
        enc_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if not os.path.exists(model_path):
            print("Churn model not found. Run: python app/train.py")
            return

        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.encoders = joblib.load(enc_path)

            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            trained = self.metadata.get('trained_at', '')[:19] if self.metadata else ''
            print(f"ChurnModel loaded — trained: {trained}")
        except Exception as e:
            print(f"Failed to load model: {e}")

    def _encode_input(self, request: ChurnPredictionRequest) -> np.ndarray:
        payment_map = {
            'UPI': 'UPI',
            'COD': 'Cash on Delivery',
            'Cash on Delivery': 'Cash on Delivery',
            'Debit Card': 'Debit Card',
            'Credit Card': 'Credit Card',
            'E wallet': 'E wallet',
            'CC': 'Credit Card',
            'DC': 'Debit Card'
        }

        cat_inputs = {
            'PreferredLoginDevice': request.preferred_login_device,
            'PreferredPaymentMode': payment_map.get(
                request.preferred_payment_mode, request.preferred_payment_mode),
            'Gender': request.gender,
            'PreferedOrderCat': request.preferred_order_cat,
            'MaritalStatus': request.marital_status
        }

        num_inputs = {
            'Tenure': request.tenure,
            'CityTier': request.city_tier,
            'WarehouseToHome': request.warehouse_to_home,
            'HourSpendOnApp': request.hour_spend_on_app,
            'NumberOfDeviceRegistered': request.number_of_device_registered,
            'SatisfactionScore': request.satisfaction_score,
            'NumberOfAddress': request.number_of_address,
            'Complain': request.complain,
            'OrderAmountHikeFromlastYear': request.order_amount_hike,
            'CouponUsed': request.coupon_used,
            'OrderCount': request.order_count,
            'DaySinceLastOrder': request.day_since_last_order,
            'CashbackAmount': request.cashback_amount
        }

        feature_names = (
            self.metadata.get('feature_names', FEATURE_ORDER)
            if self.metadata else FEATURE_ORDER
        )

        values = []
        for feat in feature_names:
            if feat in cat_inputs:
                encoder = self.encoders.get(feat)
                val = cat_inputs[feat]
                if encoder:
                    try:
                        encoded = encoder.transform([str(val)])[0]
                    except ValueError:
                        encoded = 0
                else:
                    encoded = 0
                values.append(float(encoded))
            elif feat in num_inputs:
                values.append(float(num_inputs[feat]))
            else:
                values.append(0.0)

        features = np.array(values).reshape(1, -1)
        return self.scaler.transform(features)

    def _get_risk_level(self, probability: float) -> RiskLevel:
        if probability >= 0.80:
            return RiskLevel.CRITICAL
        elif probability >= 0.60:
            return RiskLevel.HIGH
        elif probability >= 0.40:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW

    def _get_risk_factors(self, request: ChurnPredictionRequest, probability: float) -> list[str]:
        factors = []

        if request.complain == 1:
            factors.append("Customer raised a complaint recently")
        if request.satisfaction_score <= 2:
            factors.append(f"Low satisfaction score ({request.satisfaction_score}/5)")
        if request.tenure < 3:
            factors.append(f"Very new customer ({request.tenure:.0f} months)")
        if request.day_since_last_order > 15:
            factors.append(f"No order in {request.day_since_last_order:.0f} days")
        if request.order_count <= 1:
            factors.append("Only placed 1 order — low engagement")
        if request.city_tier == 1:
            factors.append("Tier 1 city customer — higher competition from rivals")
        if request.cashback_amount < 100:
            factors.append("Low cashback engagement — not benefiting from loyalty program")

        if not factors:
            factors.append("Combination of behavioral signals detected by ML model")

        return factors[:4]

    def _get_retention_suggestions(self, request: ChurnPredictionRequest, probability: float) -> list[str]:
        suggestions = []

        if request.complain == 1:
            suggestions.append("Resolve complaint immediately and offer compensation coupon")
        if request.satisfaction_score <= 2:
            suggestions.append("Send personalised satisfaction survey + offer ₹200 cashback")
        if request.day_since_last_order > 15:
            suggestions.append("Send re-engagement email with exclusive 20% off next order")
        if request.cashback_amount < 100:
            suggestions.append("Enroll in ShopSense Cashback Plus — guaranteed ₹150 on next order")
        if request.city_tier == 1:
            suggestions.append("Offer same-day delivery upgrade for next 3 orders")
        if probability >= 0.7:
            suggestions.append("Assign dedicated customer success manager for high-risk account")

        if not suggestions:
            suggestions.append("Continue regular engagement — send monthly personalised deals")

        return suggestions[:3]

    def predict(self, request: ChurnPredictionRequest) -> ChurnPredictionResponse:
        if not self.model_loaded:
            return self._rule_based_fallback(request)

        try:
            features = self._encode_input(request)
            probability = float(self.model.predict_proba(features)[0][1])

            will_churn = probability >= 0.5
            risk_level = self._get_risk_level(probability)
            risk_score = int(probability * 100)
            factors = self._get_risk_factors(request, probability)
            suggestions = self._get_retention_suggestions(request, probability)

            return ChurnPredictionResponse(
                customer_id=request.customer_id,
                churn_probability=round(probability, 4),
                will_churn=will_churn,
                risk_level=risk_level,
                risk_score=risk_score,
                city_tier_label=CITY_TIER_LABELS.get(request.city_tier, 'Unknown'),
                top_risk_factors=factors,
                retention_suggestions=suggestions
            )

        except Exception as e:
            print(f"Prediction error: {e}")
            return self._rule_based_fallback(request)

    def _rule_based_fallback(self, request: ChurnPredictionRequest) -> ChurnPredictionResponse:
        risk_score = 0

        if request.complain == 1:
            risk_score += 30
        if request.satisfaction_score <= 2:
            risk_score += 25
        if request.tenure < 3:
            risk_score += 20
        if request.day_since_last_order > 15:
            risk_score += 15
        if request.order_count <= 1:
            risk_score += 10

        probability = min(risk_score / 100, 0.99)
        risk_level = self._get_risk_level(probability)
        factors = self._get_risk_factors(request, probability)
        suggestions = self._get_retention_suggestions(request, probability)

        return ChurnPredictionResponse(
            customer_id=request.customer_id,
            churn_probability=round(probability, 4),
            will_churn=probability >= 0.5,
            risk_level=risk_level,
            risk_score=risk_score,
            city_tier_label=CITY_TIER_LABELS.get(request.city_tier, 'Unknown'),
            top_risk_factors=factors,
            retention_suggestions=suggestions,
            model_version="0.0.0-rules"
        )

    def get_citytier_analysis(self) -> list[CityTierAnalysis]:
        if not self.metadata:
            return []

        citytier = self.metadata.get('citytier_analysis', {})
        results = []

        for tier_str, data in citytier.items():
            results.append(CityTierAnalysis(
                tier=int(tier_str),
                label=data['label'],
                customer_count=data['customer_count'],
                churn_rate=data['churn_rate'],
                avg_tenure_months=data['avg_tenure_months'],
                avg_satisfaction=data['avg_satisfaction'],
                avg_cashback=data['avg_cashback'],
                avg_orders=data['avg_orders'],
                complain_rate=data['complain_rate'],
                risk_level=data['risk_level']
            ))

        return sorted(results, key=lambda x: x.tier)

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            model_type=(
                self.metadata.get('model_type', 'XGBoostClassifier')
                if self.metadata else 'XGBoostClassifier'
            ),
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            dataset=(
                self.metadata.get('dataset', 'E-Commerce Customer Churn')
                if self.metadata else 'E-Commerce Customer Churn'
            ),
            total_samples=self.metadata.get('total_samples', 5630) if self.metadata else 5630,
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded,
            citytier_analysis=self.metadata.get('citytier_analysis') if self.metadata else None
        )


# Singleton
churn_model = ChurnModel()
