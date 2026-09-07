export interface ChiefComplaintOption {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: string;
  /** Which clinical intake framework best fits this complaint */
  suggestedMode: "allopathy" | "ayush";
}

export const CHIEF_COMPLAINTS: ChiefComplaintOption[] = [
  {
    id: "cc_chest",
    labelEn: "Chest pain or discomfort",
    labelHi: "सीने में दर्द या परेशानी",
    icon: "HeartPulse",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_acidity",
    labelEn: "Acidity / stomach burning (Amlapitta)",
    labelHi: "एसिडिटी / पेट में जलन (अम्लपित्त)",
    icon: "Flame",
    suggestedMode: "ayush"
  },
  {
    id: "cc_fever_cough",
    labelEn: "Fever, cough or cold",
    labelHi: "बुखार, खांसी या सर्दी",
    icon: "Thermometer",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_joint_pain",
    labelEn: "Joint pain or body weakness",
    labelHi: "जोड़ों का दर्द या शरीर में कमजोरी",
    icon: "Activity",
    suggestedMode: "ayush"
  },
  {
    id: "cc_breathless",
    labelEn: "Breathing difficulty",
    labelHi: "सांस लेने में तकलीफ",
    icon: "Wind",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_other",
    labelEn: "Something else",
    labelHi: "कुछ और",
    icon: "HelpCircle",
    suggestedMode: "allopathy"
  }
];
