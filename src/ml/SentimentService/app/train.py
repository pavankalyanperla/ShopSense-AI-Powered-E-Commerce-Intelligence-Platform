"""
ShopSense SentimentService -- Training Script
TF-IDF + Logistic Regression on 363K Flipkart reviews.
Run once: python -m app.train  (from SentimentService directory)
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import re
import nltk
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    f1_score,
    confusion_matrix,
)
from sklearn.preprocessing import LabelEncoder

nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
from nltk.corpus import stopwords

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'flipkart_reviews.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
RANDOM_STATE = 42

STOP_WORDS = set(stopwords.words('english'))

LABEL_MAP = {
    1: 'NEGATIVE', 2: 'NEGATIVE',
    3: 'NEUTRAL',
    4: 'POSITIVE', 5: 'POSITIVE',
}


def clean_text(text: str) -> str:
    if pd.isna(text) or not isinstance(text, str):
        return ''
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    words = [w for w in text.split() if w not in STOP_WORDS and len(w) > 2]
    return ' '.join(words)


def load_and_prepare_data(path: str) -> pd.DataFrame:
    print(f"\n{'='*60}")
    print("STEP 1: Loading dataset")
    print(f"{'='*60}")

    df = pd.read_csv(path, encoding='latin-1', low_memory=False)
    print(f"Raw shape: {df.shape}", flush=True)
    print(f"Columns: {df.columns.tolist()}", flush=True)

    df.columns = df.columns.str.strip()
    df['Rate'] = pd.to_numeric(df['Rate'], errors='coerce')
    df = df.dropna(subset=['Rate', 'Review'])
    df['Rate'] = df['Rate'].astype(int)
    df = df[df['Rate'].between(1, 5)]

    df['text'] = (df['Review'].fillna('') + ' ' + df['Summary'].fillna('')).str.strip()
    df['sentiment'] = df['Rate'].map(LABEL_MAP)
    df = df[df['text'].str.len() > 10]

    print(f"Clean shape: {df.shape}", flush=True)
    print(f"\nLabel distribution:", flush=True)
    print(df['sentiment'].value_counts().to_string(), flush=True)
    print(f"\nRating distribution:", flush=True)
    print(df['Rate'].value_counts().sort_index().to_string(), flush=True)
    return df


def preprocess_texts(df: pd.DataFrame) -> pd.DataFrame:
    print(f"\n{'='*60}")
    print("STEP 2: Preprocessing text")
    print(f"{'='*60}")
    print("Cleaning text (this may take 1-2 minutes)...", flush=True)

    df = df.copy()
    df['clean_text'] = df['text'].apply(clean_text)
    df = df[df['clean_text'].str.len() > 5]

    print(f"After cleaning: {len(df):,} reviews", flush=True)
    print(f"Sample:")
    print(f"  Original : {df['text'].iloc[0][:80]}", flush=True)
    print(f"  Cleaned  : {df['clean_text'].iloc[0][:80]}", flush=True)
    return df


def train_model(df: pd.DataFrame):
    print(f"\n{'='*60}")
    print("STEP 3: Training TF-IDF + Logistic Regression")
    print(f"{'='*60}")

    X = df['clean_text'].values
    y = df['sentiment'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train: {len(X_train):,}  Test: {len(X_test):,}", flush=True)
    print(f"Classes: {np.unique(y_train).tolist()}", flush=True)

    print("\nFitting TF-IDF vectorizer...", flush=True)
    vectorizer = TfidfVectorizer(
        max_features=50000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    print(f"Vocabulary: {len(vectorizer.vocabulary_):,}  Matrix: {X_train_tfidf.shape}", flush=True)

    print("\nTraining Logistic Regression...", flush=True)
    clf = LogisticRegression(
        max_iter=1000,
        C=1.0,
        class_weight='balanced',
        random_state=RANDOM_STATE,
        n_jobs=-1,
        solver='lbfgs',
        multi_class='multinomial',
    )
    clf.fit(X_train_tfidf, y_train)
    print("Done.", flush=True)

    return vectorizer, clf, X_test_tfidf, y_test


def evaluate_model(vectorizer, clf, X_test_tfidf, y_test) -> dict:
    print(f"\n{'='*60}")
    print("STEP 4: Evaluating model")
    print(f"{'='*60}")

    y_pred = clf.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average='macro')
    f1_weighted = f1_score(y_test, y_pred, average='weighted')

    print(f"\nAccuracy     : {accuracy:.4f}", flush=True)
    print(f"F1 (macro)   : {f1_macro:.4f}", flush=True)
    print(f"F1 (weighted): {f1_weighted:.4f}", flush=True)
    print(f"\nClassification Report:", flush=True)
    print(classification_report(y_test, y_pred,
          target_names=['NEGATIVE', 'NEUTRAL', 'POSITIVE']), flush=True)

    cm = confusion_matrix(y_test, y_pred, labels=['NEGATIVE', 'NEUTRAL', 'POSITIVE'])
    print("Confusion Matrix (rows=actual, cols=predicted, NEG/NEU/POS):", flush=True)
    for i, lbl in enumerate(['NEG', 'NEU', 'POS']):
        print(f"  {lbl}: {cm[i].tolist()}", flush=True)

    print("\nTop 10 features per class:", flush=True)
    feature_names = vectorizer.get_feature_names_out()
    for i, cls in enumerate(clf.classes_):
        top = np.argsort(clf.coef_[i])[-10:][::-1]
        print(f"  {cls}: {', '.join(feature_names[j] for j in top)}", flush=True)

    return {
        'accuracy': round(accuracy, 4),
        'f1_macro': round(f1_macro, 4),
        'f1_weighted': round(f1_weighted, 4),
        'classes': clf.classes_.tolist(),
    }


def save_artifacts(vectorizer, clf, metrics: dict) -> None:
    print(f"\n{'='*60}")
    print("STEP 5: Saving artifacts")
    print(f"{'='*60}")

    os.makedirs(MODEL_DIR, exist_ok=True)

    vec_path = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
    joblib.dump(vectorizer, vec_path)
    print(f"Vectorizer --> {vec_path}", flush=True)

    model_path = os.path.join(MODEL_DIR, 'sentiment_model.pkl')
    joblib.dump(clf, model_path)
    print(f"Model      --> {model_path}", flush=True)

    metadata = {
        'trained_at': datetime.now().isoformat(),
        'model_type': 'TF-IDF + Logistic Regression',
        'dataset': 'Flipkart Reviews (363K)',
        'classes': ['NEGATIVE', 'NEUTRAL', 'POSITIVE'],
        'label_map': {
            '1': 'NEGATIVE', '2': 'NEGATIVE',
            '3': 'NEUTRAL',
            '4': 'POSITIVE', '5': 'POSITIVE',
        },
        'tfidf_features': 50000,
        'ngram_range': '(1,2)',
        'metrics': metrics,
    }
    meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata   --> {meta_path}", flush=True)

    print(f"\n{'='*60}", flush=True)
    print("TRAINING COMPLETE", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"Accuracy : {metrics['accuracy']}", flush=True)
    print(f"F1 Score : {metrics['f1_weighted']}", flush=True)
    print("SentimentService is ready!", flush=True)


def main():
    print("ShopSense SentimentService -- Training", flush=True)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = load_and_prepare_data(DATA_PATH)
    df = preprocess_texts(df)
    vectorizer, clf, X_test, y_test = train_model(df)
    metrics = evaluate_model(vectorizer, clf, X_test, y_test)
    save_artifacts(vectorizer, clf, metrics)


if __name__ == '__main__':
    main()
