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

export interface ClinicalAssessmentResult {
  scores: RiskScores;
  reasons: Record<keyof RiskScores, string[]>;
  overallRisk: {
    level: 'Low' | 'Medium' | 'High';
    color: string;
  };
}

export async function calculateRisks(vitals: VitalsData): Promise<ClinicalAssessmentResult> {
  let diabetes = 0.1;
  let hypertension = 0.1;
  let cvd = 0.1;
  let anemia = 0.1;

  const reasons: Record<keyof RiskScores, string[]> = {
    diabetes: [],
    hypertension: [],
    cvd: [],
    anemia: []
  };

  // Diabetes ML & Clinical Rules
  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose >= 200) {
      diabetes = 1.0; // Forced WHO safety gate
      reasons.diabetes.push(`Severe blood glucose spike (${vitals.bloodGlucose} mg/dL)`);
    } else if (vitals.bloodGlucose > 125) {
      diabetes = 0.85;
      reasons.diabetes.push(`High blood glucose (${vitals.bloodGlucose} mg/dL)`);
    } else if (vitals.bloodGlucose > 100) {
      diabetes = 0.45;
      reasons.diabetes.push(`Elevated blood glucose (${vitals.bloodGlucose} mg/dL)`);
    }
  }

  // Hypertension ML & Clinical Rules
  if (vitals.systolicBP || vitals.diastolicBP) {
    const sys = vitals.systolicBP || 0;
    const dia = vitals.diastolicBP || 0;
    if (sys >= 140 || dia >= 90) {
      hypertension = 1.0; // Forced WHO safety gate
      reasons.hypertension.push(`Hypertensive stage BP (${sys}/${dia} mmHg)`);
    } else if (sys > 130 || dia > 85) {
      hypertension = 0.6;
      reasons.hypertension.push(`Elevated blood pressure (${sys}/${dia} mmHg)`);
    }
  }

  // Anemia ML & Clinical Rules
  if (vitals.hemoglobin) {
    if (vitals.hemoglobin <= 7.0) {
      anemia = 1.0; // Severe anemia gate
      reasons.anemia.push(`Critical low hemoglobin (${vitals.hemoglobin} g/dL)`);
    } else if (vitals.hemoglobin < 11.0) {
      anemia = 0.9;
      reasons.anemia.push(`Low hemoglobin (${vitals.hemoglobin} g/dL)`);
    } else if (vitals.hemoglobin < 12.0) {
      anemia = 0.5;
      reasons.anemia.push(`Slightly low hemoglobin (${vitals.hemoglobin} g/dL)`);
    }
  }

  // BMI Calculation for CVD Risk
  let bmi = 22;
  if (vitals.weight && vitals.height) {
    const heightInMeters = vitals.height / 100;
    bmi = vitals.weight / (heightInMeters * heightInMeters);
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
      color: overallColor
    }
  };
}
