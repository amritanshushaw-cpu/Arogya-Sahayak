import os
import json
import numpy as np

def train_and_export():
    """
    Train a Random Forest classifier for clinical risk assessment 
    (Diabetes, Hypertension, CVD, Anemia risk scores) and export an ONNX model.
    """
    print("Initializing Arogya Sahayak ML Model Training Pipeline...")
    
    try:
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType
        
        # 1. Synthesize clinical dataset based on WHO & ICMR guidelines
        np.random.seed(42)
        n_samples = 2000
        
        # Features: [systolicBP, diastolicBP, bloodGlucose, hemoglobin, bmi, pulse, spO2, age]
        systolic = np.random.normal(120, 20, n_samples).clip(80, 220)
        diastolic = np.random.normal(80, 12, n_samples).clip(50, 140)
        glucose = np.random.normal(110, 35, n_samples).clip(60, 350)
        hb = np.random.normal(12.5, 2.5, n_samples).clip(4, 18)
        bmi = np.random.normal(23, 4.5, n_samples).clip(15, 45)
        pulse = np.random.normal(75, 10, n_samples).clip(40, 160)
        spo2 = np.random.normal(97, 2, n_samples).clip(70, 100)
        age = np.random.normal(45, 15, n_samples).clip(18, 90)
        
        X = np.column_stack([systolic, diastolic, glucose, hb, bmi, pulse, spo2, age])
        
        # Determine labels: 0=Low, 1=Medium, 2=High Risk
        y = []
        for s, d, g, h, b, p, o, a in X:
            score = 0
            if g >= 140 or g <= 70: score += 35
            if s >= 140 or d >= 90: score += 35
            if h < 11.0: score += 30
            if b >= 30: score += 20
            if o < 95: score += 40
            
            if score >= 50:
                y.append(2) # High (RED)
            elif score >= 20:
                y.append(1) # Medium (YELLOW)
            else:
                y.append(0) # Low (GREEN)
                
        y = np.array(y)
        
        print(f"Dataset generated: {n_samples} samples across 8 clinical features.")
        
        # 2. Train Random Forest model
        clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        clf.fit(X, y)
        print("Random Forest Classifier trained successfully.")
        
        # 3. Export to ONNX
        initial_type = [('float_input', FloatTensorType([None, 8]))]
        onnx_model = convert_sklearn(clf, initial_types=initial_type)
        
        output_dir = os.path.join(os.path.dirname(__file__), '../apps/web/public/models')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, 'risk_model.onnx')
        
        with open(output_path, "wb") as f:
            f.write(onnx_model.serializeToString())
            
        print(f"ONNX Model successfully exported to: {output_path}")
        
    except ImportError as e:
        print(f"Dependencies missing for ONNX export ({e}). Creating model configuration metadata...")        
        output_dir = os.path.join(os.path.dirname(__file__), '../apps/web/public/models')
        os.makedirs(output_dir, exist_ok=True)
        meta_path = os.path.join(output_dir, 'model_config.json')
        
        config = {
            "model_type": "ClinicalRandomForest",
            "features": ["systolicBP", "diastolicBP", "bloodGlucose", "hemoglobin", "bmi", "pulse", "spO2", "age"],
            "classes": ["GREEN", "YELLOW", "RED"],
            "thresholds": {
                "glucose_critical": 200,
                "glucose_high": 125,
                "sys_critical": 140,
                "dia_critical": 90,
                "hb_critical": 7.0,
                "hb_low": 11.0,
                "bmi_high": 30.0
            }
        }
        with open(meta_path, "w") as f:
            json.dump(config, f, indent=2)
        print(f"Saved model configuration to: {meta_path}")

if __name__ == "__main__":
    train_and_export()
