export interface ExtractedVitals {
  systolicBP?: string;
  diastolicBP?: string;
  pulse?: string;
  spO2?: string;
  bloodGlucose?: string;
  hemoglobin?: string;
  height?: string;
  weight?: string;
}

export function extractVitalsFromText(text: string): ExtractedVitals {
  const result: ExtractedVitals = {};
  const lowerText = text.toLowerCase();

  // BP (e.g., "bp 120/80", "blood pressure 140 by 90", "bp hai 120 over 80")
  const bpMatch = lowerText.match(/(?:bp|blood pressure).*?(\d{2,3})\s*(?:\/|by|over|bate|batte|baate)\s*(\d{2,3})/);
  if (bpMatch) {
    result.systolicBP = bpMatch[1];
    result.diastolicBP = bpMatch[2];
  }

  // Sugar / Glucose (e.g., "sugar 140", "glucose is 120", "sugar hai 180")
  const sugarMatch = lowerText.match(/(?:sugar|glucose|shugar).*?(\d{2,3}(?:\.\d)?)/);
  if (sugarMatch) {
    result.bloodGlucose = sugarMatch[1];
  }

  // Pulse (e.g., "pulse 72", "heart rate 80", "pulse hai 75")
  const pulseMatch = lowerText.match(/(?:pulse|heart rate|dharkan).*?(\d{2,3})/);
  if (pulseMatch) {
    result.pulse = pulseMatch[1];
  }

  // SpO2 (e.g., "spo2 98", "oxygen 99")
  const spo2Match = lowerText.match(/(?:spo2|oxygen|o2).*?(\d{2,3})/);
  if (spo2Match) {
    result.spO2 = spo2Match[1];
  }

  // Hemoglobin (e.g., "hemoglobin 12.5", "hb is 11")
  const hbMatch = lowerText.match(/(?:hemoglobin|hb|khoon|blood level).*?(\d{1,2}(?:\.\d)?)/);
  if (hbMatch) {
    result.hemoglobin = hbMatch[1];
  }

  // Height (e.g., "height 160", "l लंबाई 165")
  const heightMatch = lowerText.match(/(?:height|lambaai|lambai).*?(\d{2,3}(?:\.\d)?)/);
  if (heightMatch) {
    result.height = heightMatch[1];
  }

  // Weight (e.g., "weight 60", "vajan 65", "wajan 70")
  const weightMatch = lowerText.match(/(?:weight|wajan|vajan|wazan).*?(\d{2,3}(?:\.\d)?)/);
  if (weightMatch) {
    result.weight = weightMatch[1];
  }

  return result;
}
