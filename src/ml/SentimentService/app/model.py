"""
SentimentService model loader and predictor.
TF-IDF + Logistic Regression sentiment classifier.
"""

import joblib
import json
import os
import re
import numpy as np
from typing import Optional

try:
    import nltk
    nltk.download('stopwords', quiet=True)
    from nltk.corpus import stopwords
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    STOP_WORDS = set()

from app.schemas import (
    SentimentRequest,
    SentimentResponse,
    SentimentLabel,
    BatchSentimentResponse,
    ProductSentimentSummary,
    ModelInfoResponse,
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


class SentimentModel:

    def __init__(self):
        self.vectorizer = None
        self.clf = None
        self.metadata: Optional[dict] = None
        self.model_loaded = False
        self._load()

    def _load(self):
        vec_path = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
        model_path = os.path.join(MODEL_DIR, 'sentiment_model.pkl')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if not os.path.exists(model_path):
            print("[SentimentService] Model not found. Run: python -m app.train", flush=True)
            return

        try:
            self.vectorizer = joblib.load(vec_path)
            self.clf = joblib.load(model_path)

            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            vocab_size = len(self.vectorizer.vocabulary_)
            trained = (self.metadata.get('trained_at', '')[:19]
                       if self.metadata else '')
            print(f"[SentimentService] Model loaded OK -- vocab: {vocab_size:,}, trained: {trained}", flush=True)
        except Exception as e:
            print(f"[SentimentService] ERROR loading model: {e}", flush=True)

    def _clean_text(self, text: str) -> str:
        if not text or not isinstance(text, str):
            return ''
        text = text.lower()
        text = re.sub(r'http\S+|www\S+', '', text)
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        words = [w for w in text.split() if w not in STOP_WORDS and len(w) > 2]
        return ' '.join(words)

    def analyze(self, request: SentimentRequest) -> SentimentResponse:
        if not self.model_loaded:
            return self._rule_based_fallback(request.review_text)

        try:
            clean = self._clean_text(request.review_text)
            if not clean:
                clean = request.review_text.lower()

            features = self.vectorizer.transform([clean])
            probas = self.clf.predict_proba(features)[0]
            classes = self.clf.classes_

            scores = {cls: round(float(prob), 4) for cls, prob in zip(classes, probas)}
            predicted_class = classes[np.argmax(probas)]
            confidence = float(np.max(probas))

            return SentimentResponse(
                sentiment=SentimentLabel(predicted_class),
                confidence=round(confidence, 4),
                scores=scores,
                review_length=len(request.review_text),
            )
        except Exception as e:
            print(f"[SentimentService] Prediction error: {e}", flush=True)
            return self._rule_based_fallback(request.review_text)

    def analyze_batch(self, texts: list[SentimentRequest]) -> BatchSentimentResponse:
        results = [self.analyze(req) for req in texts]
        pos = sum(1 for r in results if r.sentiment == SentimentLabel.POSITIVE)
        neu = sum(1 for r in results if r.sentiment == SentimentLabel.NEUTRAL)
        neg = sum(1 for r in results if r.sentiment == SentimentLabel.NEGATIVE)
        avg_conf = float(np.mean([r.confidence for r in results]))
        return BatchSentimentResponse(
            results=results,
            total=len(results),
            positive_count=pos,
            neutral_count=neu,
            negative_count=neg,
            average_confidence=round(avg_conf, 4),
        )

    def get_product_summary(self, reviews: list[str], product_id: str) -> ProductSentimentSummary:
        requests = [SentimentRequest(review_text=r, product_id=product_id) for r in reviews]
        batch = self.analyze_batch(requests)
        total = batch.total

        if total == 0:
            return ProductSentimentSummary(
                product_id=product_id,
                total_reviews=0,
                positive_pct=0.0, neutral_pct=0.0, negative_pct=0.0,
                overall_sentiment=SentimentLabel.NEUTRAL,
                avg_confidence=0.0,
            )

        pos_pct = round(batch.positive_count / total * 100, 1)
        neu_pct = round(batch.neutral_count / total * 100, 1)
        neg_pct = round(batch.negative_count / total * 100, 1)

        if pos_pct >= 60:
            overall = SentimentLabel.POSITIVE
        elif neg_pct >= 40:
            overall = SentimentLabel.NEGATIVE
        else:
            overall = SentimentLabel.NEUTRAL

        return ProductSentimentSummary(
            product_id=product_id,
            total_reviews=total,
            positive_pct=pos_pct,
            neutral_pct=neu_pct,
            negative_pct=neg_pct,
            overall_sentiment=overall,
            avg_confidence=batch.average_confidence,
        )

    def _rule_based_fallback(self, text: str) -> SentimentResponse:
        text_lower = text.lower()
        positive_words = [
            'great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'good',
            'happy', 'satisfied', 'recommend', 'awesome', 'fantastic', 'wonderful', 'superb',
        ]
        negative_words = [
            'bad', 'terrible', 'awful', 'worst', 'horrible', 'disappointed', 'poor',
            'waste', 'defective', 'broken', 'fake', 'useless', 'pathetic', 'disgusting',
        ]
        pos_count = sum(1 for w in positive_words if w in text_lower)
        neg_count = sum(1 for w in negative_words if w in text_lower)

        if pos_count > neg_count:
            sentiment = SentimentLabel.POSITIVE
            confidence = min(0.5 + pos_count * 0.1, 0.85)
        elif neg_count > pos_count:
            sentiment = SentimentLabel.NEGATIVE
            confidence = min(0.5 + neg_count * 0.1, 0.85)
        else:
            sentiment = SentimentLabel.NEUTRAL
            confidence = 0.5

        scores = {
            'POSITIVE': round(confidence if sentiment == SentimentLabel.POSITIVE else 0.2, 4),
            'NEUTRAL':  round(confidence if sentiment == SentimentLabel.NEUTRAL  else 0.2, 4),
            'NEGATIVE': round(confidence if sentiment == SentimentLabel.NEGATIVE else 0.2, 4),
        }
        return SentimentResponse(
            sentiment=sentiment,
            confidence=round(confidence, 4),
            scores=scores,
            review_length=len(text),
            model_version="0.0.0-rules",
        )

    def get_info(self) -> ModelInfoResponse:
        vocab_size = len(self.vectorizer.vocabulary_) if self.vectorizer else 0
        return ModelInfoResponse(
            model_type=(self.metadata.get('model_type', 'TF-IDF + Logistic Regression')
                        if self.metadata else 'TF-IDF + Logistic Regression'),
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            dataset=(self.metadata.get('dataset', 'Flipkart Reviews')
                     if self.metadata else 'Flipkart Reviews'),
            classes=(self.metadata.get('classes', ['NEGATIVE', 'NEUTRAL', 'POSITIVE'])
                     if self.metadata else ['NEGATIVE', 'NEUTRAL', 'POSITIVE']),
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded,
            vocabulary_size=vocab_size,
        )


# Singleton
sentiment_model = SentimentModel()
