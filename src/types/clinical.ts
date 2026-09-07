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
  status: 'draft' | 'approved' | 'amended' | 'rejected';
  isEmergencyTriage: boolean;
  createdAt: string;
}
