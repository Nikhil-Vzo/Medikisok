export type ClinicalMode = 'allopathy' | 'ayush' | 'integrated';

export interface SocratesData {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associated_symptoms?: string[];
  timing?: string;
  exacerbating_relieving?: string;
  severity?: number; // 1 to 10 scale
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  sourceDocId?: string;
  confidence: number;
}

export interface ExtractedLabValue {
  testName: string;
  observedValue: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  flagType?: 'high' | 'low' | 'critical';
  confidence: number;
}

export interface ScannedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  docType: 'prescription' | 'lab_report' | 'discharge_summary' | 'other';
  documentDate?: string;
  rawText?: string;
  medications: ExtractedMedication[];
  labValues: ExtractedLabValue[];
  diagnoses: string[];
  proceduresSurgeries?: string[];
}

export interface ClinicalSuggestion {
  id: string;
  type: 'redflag' | 'interaction' | 'abnormal_lab' | 'ayush_dosha_insight';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  citedSource?: string;
}

/**
 * Standard 8-Part Clinical History format specified by AIIA / ABDM
 * (Chief Complaint -> HPI -> Past Medical/Surgical -> Drug & Allergy -> Family -> Personal -> ROS -> Investigations)
 */
export interface ClassicalEightPartHistory {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalSurgical: string[];
  drugAndAllergies: {
    medications: ExtractedMedication[] | any[];
    allergies: string[];
  };
  familyHistory: string;
  personalHistory: {
    diet: string;
    sleep: string;
    appetite: string;
    bowelBladder: string;
    lifestyleHabits: string;
  };
  reviewOfSystems: {
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    neurological?: string;
    musculoskeletal?: string;
  };
  priorInvestigations: string;
}

export interface ClinicalSummaryDraft {
  visitId: string;
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  socratesData: SocratesData;
  ayushAssessment?: Record<string, any>;
  pastMedicalHistory: string[];
  currentMedications: ExtractedMedication[];
  allergies: string[];
  familyHistory?: string;
  personalHabits?: string;
  reviewOfSystems?: Record<string, string>;
  scannedDocumentsSummary: string;
  doctorNotes?: string;
  nurseNotes?: string;
  nurseVitals?: NurseVitals;
  assignedDoctor?: string;
  assignedRoom?: string;
  status: 'draft' | 'approved' | 'amended' | 'rejected';
  isEmergencyTriage: boolean;
  createdAt: string;
  classicalHistory?: ClassicalEightPartHistory;
}

export interface NurseVitals {
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  pulseRate?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  weightKg?: number;
  bloodSugarMgDl?: number;
  recordedAt?: string;
  nurseNotes?: string;
}

export interface DoctorAllotment {
  doctorId: string;
  doctorName: string;
  department: string;
  roomNumber: string;
  allottedAt: string;
}
