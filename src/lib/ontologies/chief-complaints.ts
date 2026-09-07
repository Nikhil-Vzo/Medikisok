import { SOCRATES_CHEST_PAIN, SocratesStep } from "./allopathy-socrates";
import { SOCRATES_FEVER } from "./fever-socrates";
import { SOCRATES_ABDOMINAL } from "./abdominal-socrates";
import { SOCRATES_RESPIRATORY } from "./respiratory-socrates";
import { DASHAVIDHA_PARIKSHA_STEPS } from "./ayush-dashavidha";

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
    labelEn: "Fever & Chills (Pyrexia)",
    labelHi: "बुखार और कंपकंपी (ज्वर)",
    icon: "Thermometer",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_abdominal_pain",
    labelEn: "Abdominal Pain / Colic (Shoola)",
    labelHi: "पेट में तेज दर्द / मरोड़ (उदर शूल)",
    icon: "ShieldAlert",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_breathless",
    labelEn: "Cough & Breathing difficulty (Shwasa/Kasa)",
    labelHi: "खांसी और सांस लेने में तकलीफ (श्वास/कास)",
    icon: "Wind",
    suggestedMode: "allopathy"
  },
  {
    id: "cc_joint_pain",
    labelEn: "Joint pain or body weakness (Sandhivata)",
    labelHi: "जोड़ों का दर्द या शरीर में कमजोरी (संधिवात)",
    icon: "Activity",
    suggestedMode: "ayush"
  },
  {
    id: "cc_other",
    labelEn: "General Consultation / Routine Check",
    labelHi: "सामान्य परामर्श / नियमित जांच",
    icon: "HelpCircle",
    suggestedMode: "allopathy"
  }
];

/**
 * Dynamically branch and resolve clinical questions based on selected complaint & mode.
 */
export function getQuestionsForComplaint(complaintId: string | null, mode: "allopathy" | "ayush"): SocratesStep[] | any[] {
  if (mode === "ayush") {
    return DASHAVIDHA_PARIKSHA_STEPS;
  }

  switch (complaintId) {
    case "cc_fever_cough":
      return SOCRATES_FEVER;
    case "cc_abdominal_pain":
    case "cc_acidity":
      return SOCRATES_ABDOMINAL;
    case "cc_breathless":
      return SOCRATES_RESPIRATORY;
    case "cc_chest":
    default:
      return SOCRATES_CHEST_PAIN;
  }
}
