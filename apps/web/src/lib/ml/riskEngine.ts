export interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  pulse?: number;
  spO2?: number;
  bloodGlucose?: number;
  hemoglobin?: number;
  height?: number; // cm
  weight?: number; // kg
  age?: number;
}

export interface RiskScores {
  diabetes: number;
  hypertension: number;
  cvd: number;
  anemia: number;
}

export interface ClinicalAssessmentResult {
  scores: RiskScores;
  reasons: Record<keyof RiskScores, string[]>;
  overallRisk: {
    level: 'Low' | 'Medium' | 'High';
    color: string;
    source?: string;
  };
}

let onnxSession: any = null;

async function initONNXSession() {
  if (typeof window === 'undefined') return null;
  if (onnxSession) return onnxSession;

  try {
    const ort = await import('onnxruntime-web');
    onnxSession = await ort.InferenceSession.create('/models/risk_model.onnx');
    console.log('[ML Inference] ONNX Risk Model loaded successfully.');
    return onnxSession;
  } catch (err) {
    // ONNX file fallback to clinical decision engine
    return null;
  }
}

export async function calculateRisks(vitals: VitalsData): Promise<ClinicalAssessmentResult> {
  let diabetes = 0.1;
  let hypertension = 0.1;
  let cvd = 0.1;
  let anemia = 0.1;
  let modelSource = 'WHO/ICMR Clinical Decision Engine';

  const reasons: Record<keyof RiskScores, string[]> = {
    diabetes: [],
    hypertension: [],
    cvd: [],
    anemia: []
  };

  // Attempt ONNX Model Execution
  try {
    const session = await initONNXSession();
    if (session) {
      const ort = await import('onnxruntime-web');
      const inputVector = new Float32Array([
        vitals.systolicBP || 120,
        vitals.diastolicBP || 80,
        vitals.bloodGlucose || 100,
        vitals.hemoglobin || 13,
        vitals.weight && vitals.height ? vitals.weight / Math.pow(vitals.height / 100, 2) : 22,
        vitals.pulse || 72,
        vitals.spO2 || 98,
        vitals.age || 40
      ]);

      const tensor = new ort.Tensor('float32', inputVector, [1, 8]);
      const output = await session.run({ float_input: tensor });

      if (output && output.output_label) {
        const predictedClass = Number(output.output_label.data[0]);
        if (predictedClass === 2) {
          diabetes = 0.85;
          hypertension = 0.85;
        } else if (predictedClass === 1) {
          diabetes = 0.5;
          hypertension = 0.5;
        }
        modelSource = 'ONNX Random Forest Classifier (v1.0)';
      }
    }
  } catch (err) {
    console.warn('[ML Inference] ONNX execution fallback:', err);
  }

  // 1. Diabetes ML & WHO Safety Gates
  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose >= 200) {
      diabetes = 1.0; // Critical WHO safety gate
      reasons.diabetes.push(`Severe blood glucose spike (${vitals.bloodGlucose} mg/dL)`);
    } else if (vitals.bloodGlucose > 125) {
      diabetes = Math.max(diabetes, 0.85);
      reasons.diabetes.push(`High blood glucose (${vitals.bloodGlucose} mg/dL)`);
    } else if (vitals.bloodGlucose > 100) {
      diabetes = Math.max(diabetes, 0.45);
      reasons.diabetes.push(`Elevated blood glucose (${vitals.bloodGlucose} mg/dL)`);
    }
  }

  // 2. Hypertension ML & WHO Safety Gates
  if (vitals.systolicBP || vitals.diastolicBP) {
    const sys = vitals.systolicBP || 0;
    const dia = vitals.diastolicBP || 0;
    if (sys >= 140 || dia >= 90) {
      hypertension = 1.0; // Critical WHO safety gate
      reasons.hypertension.push(`Hypertensive stage BP (${sys}/${dia} mmHg)`);
    } else if (sys > 130 || dia > 85) {
      hypertension = Math.max(hypertension, 0.6);
      reasons.hypertension.push(`Elevated blood pressure (${sys}/${dia} mmHg)`);
    }
  }

  // 3. Anemia ML & WHO Safety Gates
  if (vitals.hemoglobin) {
    if (vitals.hemoglobin <= 7.0) {
      anemia = 1.0; // Severe anemia safety gate
      reasons.anemia.push(`Critical low hemoglobin (${vitals.hemoglobin} g/dL)`);
    } else if (vitals.hemoglobin < 11.0) {
      anemia = 0.9;
      reasons.anemia.push(`Low hemoglobin (${vitals.hemoglobin} g/dL)`);
    } else if (vitals.hemoglobin < 12.0) {
      anemia = 0.5;
      reasons.anemia.push(`Slightly low hemoglobin (${vitals.hemoglobin} g/dL)`);
    }
  }

  // 4. SpO2 Oxygen Saturation Gate
  if (vitals.spO2 && vitals.spO2 < 92) {
    cvd = Math.max(cvd, 0.9);
    reasons.cvd.push(`Critical low SpO2 saturation (${vitals.spO2}%)`);
  }

  // 5. BMI Calculation for CVD Risk
  if (vitals.weight && vitals.height) {
    const heightInMeters = vitals.height / 100;
    const bmi = vitals.weight / (heightInMeters * heightInMeters);
    if (bmi > 30) {
      cvd += 0.3;
      reasons.cvd.push(`High BMI (${bmi.toFixed(1)})`);
    }
  }
  if (vitals.systolicBP && vitals.systolicBP > 140) {
    cvd += 0.4;
    reasons.cvd.push(`High systolic BP (${vitals.systolicBP} mmHg)`);
  }

  const finalScores: RiskScores = {
    diabetes: Math.min(diabetes, 1.0),
    hypertension: Math.min(hypertension, 1.0),
    cvd: Math.min(cvd, 1.0),
    anemia: Math.min(anemia, 1.0),
  };

  const maxScore = Math.max(finalScores.diabetes, finalScores.hypertension, finalScores.cvd, finalScores.anemia);
  let overallLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let overallColor = 'text-emerald-400';

  if (maxScore > 0.7) {
    overallLevel = 'High';
    overallColor = 'text-rose-400';
  } else if (maxScore >= 0.3) {
    overallLevel = 'Medium';
    overallColor = 'text-amber-400';
  }

  return {
    scores: finalScores,
    reasons,
    overallRisk: {
      level: overallLevel,
      color: overallColor,
      source: modelSource
    }
  };
}
