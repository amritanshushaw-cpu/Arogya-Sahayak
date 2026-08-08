export interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  pulse?: number;
  spO2?: number;
  bloodGlucose?: number;
  hemoglobin?: number;
  height?: number; // cm
  weight?: number; // kg
}

export interface RiskScores {
  diabetes: number;
  hypertension: number;
  cvd: number;
  anemia: number;
}

export async function calculateRisks(vitals: VitalsData): Promise<RiskScores> {
  // TODO: Replace with actual onnxruntime-web InferenceSession loading and execution
  // Example: 
  // const session = await InferenceSession.create('/models/risk_model.onnx');
  // const tensor = new Tensor('float32', [...vitals_array], [1, 8]);
  // const results = await session.run({ input: tensor });

  // Mock ML Inference based on physiological rules
  let diabetes = 0.1;
  let hypertension = 0.1;
  let cvd = 0.1;
  let anemia = 0.1;

  // Simulate ML for Diabetes
  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose > 125) diabetes = 0.85;
    else if (vitals.bloodGlucose > 100) diabetes = 0.45;
  }

  // Simulate ML for Hypertension
  if (vitals.systolicBP && vitals.diastolicBP) {
    if (vitals.systolicBP > 130 || vitals.diastolicBP > 85) hypertension = 0.6;
  }

  // Simulate ML for Anemia
  if (vitals.hemoglobin) {
    if (vitals.hemoglobin < 11.0) anemia = 0.9;
    else if (vitals.hemoglobin < 12.0) anemia = 0.5;
  }

  // BMI Calculation for CVD Risk
  let bmi = 22;
  if (vitals.weight && vitals.height) {
    const heightInMeters = vitals.height / 100;
    bmi = vitals.weight / (heightInMeters * heightInMeters);
  }

  // Simulate ML for CVD
  if (bmi > 30) cvd += 0.3;
  if (vitals.systolicBP && vitals.systolicBP > 140) cvd += 0.4;
  
  // Apply WHO/ICMR Safety Gates (Overrides)
  if (vitals.systolicBP && vitals.diastolicBP) {
    if (vitals.systolicBP >= 140 || vitals.diastolicBP >= 90) {
      hypertension = 1.0; // Forced high risk
    }
  }

  if (vitals.bloodGlucose && vitals.bloodGlucose >= 200) {
    diabetes = 1.0; // Forced high risk
  }

  if (vitals.hemoglobin && vitals.hemoglobin <= 7.0) {
    anemia = 1.0; // Severe anemia gate
  }

  return {
    diabetes: Math.min(diabetes, 1.0),
    hypertension: Math.min(hypertension, 1.0),
    cvd: Math.min(cvd, 1.0),
    anemia: Math.min(anemia, 1.0),
  };
}
