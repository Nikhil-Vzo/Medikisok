export interface RedFlagRule {
  id: string;
  category: 'cardiovascular' | 'respiratory' | 'neurological' | 'ayush_emergency' | 'acute_abdomen' | 'sepsis';
  titleEn: string;
  titleHi: string;
  symptoms: string[];
  actionEn: string;
  actionHi: string;
  priorityLevel: 'CRITICAL_IMMEDIATE' | 'HIGH_URGENT';
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'acs_chest_pain',
    category: 'cardiovascular',
    titleEn: 'Acute Coronary Syndrome (Suspected Heart Attack)',
    titleHi: 'हार्ट अटैक की गंभीर आशंका (तीव्र हृदय लक्षण)',
    symptoms: ['substernal', 'crushing_pressure', 'radiation_to_arm', 'shortness_of_breath', 'severe_7_10'],
    actionEn: 'Immediate diversion to Emergency Resuscitation Bay. Notify ECG & Cardiology.',
    actionHi: 'तत्काल आपातकालीन वार्ड में भेजें। ईसीजी व कार्डियोलॉजिस्ट को सूचित करें।',
    priorityLevel: 'CRITICAL_IMMEDIATE'
  },
  {
    id: 'acute_respiratory_distress',
    category: 'respiratory',
    titleEn: 'Severe Respiratory Distress / Acute Dyspnoea',
    titleHi: 'तीव्र सांस संकट / ऑक्सीजन की कमी',
    symptoms: ['acute_dyspnoea', 'cyanosis', 'stridor', 'acute_gasping', 'cough_with_blood', 'breathless_at_rest'],
    actionEn: 'Immediate triage oxygenation and SpO2 monitoring.',
    actionHi: 'तत्काल ऑक्सीजन सपोर्ट व SpO2 की जांच करें।',
    priorityLevel: 'CRITICAL_IMMEDIATE'
  },
  {
    id: 'acute_abdomen',
    category: 'acute_abdomen',
    titleEn: 'Acute Surgical Abdomen / Internal Hemorrhage',
    titleHi: 'तीव्र उदर संकट / आंतरिक रक्तस्राव',
    symptoms: ['rigid_boardlike', 'blood_vomit_black_stool', 'sudden_severe_tear', 'radiates_to_back'],
    actionEn: 'Immediate surgical triage, urgent ultrasound/CT, stop oral intake.',
    actionHi: 'तत्काल सर्जिकल वार्ड रेफरल, अल्ट्रासाउंड व आईवी फ्लूइड्स शुरू करें।',
    priorityLevel: 'CRITICAL_IMMEDIATE'
  },
  {
    id: 'sepsis_meningitis',
    category: 'sepsis',
    titleEn: 'Severe Pyrexia with Sepsis / Meningitis Signs',
    titleHi: 'अति-तीव्र ज्वर / मस्तिष्क संक्रमण (मेनिन्जाइटिस)',
    symptoms: ['altered_sensorium_stiff_neck', 'with_rigors', 'severe_prostration'],
    actionEn: 'Immediate IV access, blood cultures, lumbar puncture protocol.',
    actionHi: 'तत्काल आपातकालीन वार्ड में आईवी एंटीबायोटिक व ब्लड टेस्ट शुरू करें।',
    priorityLevel: 'CRITICAL_IMMEDIATE'
  },
  {
    id: 'stroke_fast',
    category: 'neurological',
    titleEn: 'Acute Stroke Symptoms (FAST Protocol)',
    titleHi: 'तीव्र पक्षाघात / स्ट्रोक के लक्षण',
    symptoms: ['facial_droop', 'arm_weakness', 'slurred_speech'],
    actionEn: 'Activate Code Stroke Protocol. Immediate CT Brain referral.',
    actionHi: 'तत्काल स्ट्रोक प्रोटोकॉल चालू करें और सीटी स्कैन करवाएं।',
    priorityLevel: 'CRITICAL_IMMEDIATE'
  }
];

export function evaluateRedFlags(selectedOptionIds: string[]): { isEmergency: boolean; triggeredRule?: RedFlagRule } {
  for (const rule of RED_FLAG_RULES) {
    const matchCount = rule.symptoms.filter(sym => selectedOptionIds.includes(sym)).length;
    // Acute abdomen, stroke, and respiratory distress are triggered on 1 critical symptom or 2 standard
    const threshold = (rule.category === 'acute_abdomen' || rule.category === 'respiratory') ? 1 : 2;
    if (matchCount >= threshold) {
      return { isEmergency: true, triggeredRule: rule };
    }
  }
  return { isEmergency: false };
}

/**
 * Keyword map: each RedFlagRule.id → list of lowercase search terms
 * that commonly appear in free-text chief complaints.
 */
const RED_FLAG_TEXT_KEYWORDS: Record<string, string[]> = {
  acs_chest_pain: [
    "chest pain", "chest pressure", "substernal", "retrosternal",
    "heart attack", "crushing chest", "crushing pressure",
    "radiating to arm", "left arm pain", "arm radiation",
    "shortness of breath", "dyspnoea", "dyspnea",
    "sweating", "diaphoresis", "nausea", "vomiting"
  ],
  acute_respiratory_distress: [
    "acute dyspnoea", "acute dyspnea", "severe breathlessness",
    "cyanosis", "stridor", "wheezing", "respiratory distress",
    "can't breathe", "unable to breathe", "spO2", "low oxygen",
    "oxygen saturation", "blue lips", "blue fingers", "coughing blood"
  ],
  acute_abdomen: [
    "rigid abdomen", "board like", "vomiting blood", "black stool",
    "severe stomach pain", "tearing pain", "appendix burst", "peritonitis"
  ],
  sepsis_meningitis: [
    "stiff neck", "high fever with rigors", "unconscious with fever",
    "altered sensorium", "extreme confusion", "sepsis"
  ],
  stroke_fast: [
    "facial droop", "face drooping", "arm weakness", "arm drift",
    "slurred speech", "speech difficulty", "stroke", "FAST",
    "sudden weakness", "sudden numbness", "sudden confusion",
    "sudden severe headache", "one sided weakness"
  ]
};

/**
 * Evaluate red flags from free-text chief complaint string.
 */
export function evaluateRedFlagsFromText(
  chiefComplaint: string,
  extraContext: string = ""
): { isEmergency: boolean; triggeredRules: RedFlagRule[] } {
  const text = `${chiefComplaint} ${extraContext}`.toLowerCase();
  const triggeredRules: RedFlagRule[] = [];

  for (const rule of RED_FLAG_RULES) {
    const keywords = RED_FLAG_TEXT_KEYWORDS[rule.id] ?? [];
    const matchCount = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    const threshold = (rule.category === 'respiratory' || rule.category === 'acute_abdomen') ? 1 : 2;
    if (matchCount >= threshold) {
      triggeredRules.push(rule);
    }
  }

  return { isEmergency: triggeredRules.length > 0, triggeredRules };
}
