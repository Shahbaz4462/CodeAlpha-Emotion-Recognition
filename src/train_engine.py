"""
Speech Emotion Recognition (SER) - Production Pipeline Engine
Author: Elite ML Engineer
Description: End-to-end robust data extraction, preprocessing, and 
             high-performance ensemble training targeting 80%+ accuracy on the RAVDESS dataset.
"""

import os
import glob
import numpy as np
import warnings
import time
import joblib

import librosa
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.utils.class_weight import compute_class_weight

warnings.filterwarnings('ignore')

# -------------------------------------------------------------------
# Core Configuration
# -------------------------------------------------------------------
DATASET_PATH = r"C:\Users\Microsoft\Downloads\archive (4)"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "production_ser_ensemble.joblib")

# The exact 8 emotion classes found in RAVDESS
EMOTION_MAP = {
    '01': 'neutral',
    '02': 'calm',
    '03': 'happy',
    '04': 'sad',
    '05': 'angry',
    '06': 'fearful',
    '07': 'disgust',
    '08': 'surprised'
}

# -------------------------------------------------------------------
# Data Extraction Engine
# -------------------------------------------------------------------
def compute_statistical_bounds(feature_matrix):
    """
    Computes dense statistics (mean, std, max, min) for a given sequence of features.
    """
    return np.hstack([
        np.mean(feature_matrix.T, axis=0),
        np.std(feature_matrix.T, axis=0),
        np.max(feature_matrix.T, axis=0),
        np.min(feature_matrix.T, axis=0)
    ])

def extract_dense_features(file_path):
    """
    Extracts multi-dimensional feature bounds from raw audio.
    Captures temporal energy and deep spectral structure.
    """
    try:
        y, sr = librosa.load(file_path, sr=22050, res_type='kaiser_fast')
        
        # 1. Zero Crossing Rate & RMS Energy (Temporal boundaries)
        zcr = librosa.feature.zero_crossing_rate(y=y)
        rms = librosa.feature.rms(y=y)
        
        # 2. Advanced Spectral Representation
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        mel = librosa.feature.melspectrogram(y=y, sr=sr)
        
        # Stack all statistical bounds horizontally (Mean, Std, Max, Min per feature channel)
        vector = np.hstack([
            compute_statistical_bounds(zcr),
            compute_statistical_bounds(rms),
            compute_statistical_bounds(mfccs),
            compute_statistical_bounds(chroma),
            compute_statistical_bounds(mel)
        ])
        
        return vector
    except Exception as e:
        print(f"[!] Extraction failure on {file_path}: {e}")
        return None

def build_dataset_matrix(data_path):
    """
    Traverses the dataset directory, parsing files and labels into structured matrices.
    """
    print("[*] Initializing ultra-dense data parser across audio files...")
    start_time = time.time()
    
    X_features, y_labels = [], []
    file_pattern = os.path.join(data_path, 'Actor_*', '*.wav')
    audio_files = glob.glob(file_pattern)
    
    if not audio_files:
        raise FileNotFoundError(f"No WAV files found in structured path: {file_pattern}")
        
    for idx, file_path in enumerate(audio_files):
        # Extract label from standard naming convention
        basename = os.path.basename(file_path)
        emotion_id = basename.split('-')[2]
        
        features = extract_dense_features(file_path)
        if features is not None:
            X_features.append(features)
            y_labels.append(EMOTION_MAP[emotion_id])
            
        if (idx + 1) % 200 == 0:
            print(f"    -> Processed {idx + 1}/{len(audio_files)} files...")
            
    X_matrix = np.array(X_features)
    y_matrix = np.array(y_labels)
    
    print(f"[*] Dataset matrix built successfully in {time.time() - start_time:.2f}s")
    print(f"[*] Feature Dimension Shape: {X_matrix.shape}")
    
    return X_matrix, y_matrix

# -------------------------------------------------------------------
# Production Pipeline
# -------------------------------------------------------------------
def run_production_pipeline():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # 1. Data Processing Phase
    X_raw, y_raw = build_dataset_matrix(DATASET_PATH)
    
    # 2. Label Encoding & Validation
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y_raw)
    
    # 3. Exact Stratified Split (80/20)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"[*] Stratified partitioning complete. Train size: {X_train_raw.shape[0]}, Test size: {X_test_raw.shape[0]}")
    
    # 4. Strict Scaling mapped strictly from Training parameters
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_test = scaler.transform(X_test_raw)
    print("[*] Applied robust feature scaling.")
    
    # 5. Class Weight Calculation
    classes = np.unique(y_train)
    weights = compute_class_weight(class_weight='balanced', classes=classes, y=y_train)
    class_weight_dict = dict(zip(classes, weights))
    
    # 6. High-Performance Architectural Setup
    print("[*] Compiling State-of-the-Art Tree-Based Ensemble...")
    # Utilizing an ensemble approach that captures non-linear tabular relations exceptionally well
    rf_clf = RandomForestClassifier(n_estimators=300, max_depth=20, class_weight=class_weight_dict, random_state=42, n_jobs=-1)
    et_clf = ExtraTreesClassifier(n_estimators=300, max_depth=20, class_weight=class_weight_dict, random_state=42, n_jobs=-1)
    hgb_clf = HistGradientBoostingClassifier(max_iter=200, random_state=42)
    
    ensemble_model = VotingClassifier(
        estimators=[('rf', rf_clf), ('et', et_clf), ('hgb', hgb_clf)],
        voting='soft',
        n_jobs=-1
    )
    
    # 7. Model Fitting
    print("[*] Initiating robust parallel training. Please hold...")
    start_time = time.time()
    ensemble_model.fit(X_train, y_train)
    print(f"[*] Training stabilized in {time.time() - start_time:.2f}s")
    
    # 8. Complete Evaluation Matrix
    print("\n---------------------------------------------------------")
    print("                 MODEL EVALUATION REPORT                 ")
    print("---------------------------------------------------------")
    predictions = ensemble_model.predict(X_test)
    acc = accuracy_score(y_test, predictions)
    
    print(classification_report(y_test, predictions, target_names=label_encoder.classes_))
    print(f"FINAL OVERALL ACCURACY SCORE: {acc * 100:.2f}%\n")
    
    # 9. Artifact Export
    model_artifact = {
        'model': ensemble_model,
        'scaler': scaler,
        'label_encoder': label_encoder
    }
    joblib.dump(model_artifact, MODEL_PATH)
    print(f"[*] Engine pipeline serialized and stored locally at '{MODEL_PATH}'.")

if __name__ == "__main__":
    run_production_pipeline()
