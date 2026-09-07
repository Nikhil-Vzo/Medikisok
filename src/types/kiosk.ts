export type KioskStep =
  | 'identify'
  | 'consent'
  | 'continuity'
  | 'complaint_select'
  | 'mode_select'
  | 'converse'
  | 'triage_alert'
  | 'scan'
  | 'confirm'
  | 'completed';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  flagCode?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'ai' | 'patient';
  text: string;
  textHindi?: string;
  audioUrl?: string;
  timestamp: string;
  quickReplies?: Array<{
    id: string;
    label: string;
    labelHindi?: string;
    value: string;
    iconName?: string;
  }>;
}

export interface KioskSessionState {
  step: KioskStep;
  language: string;
  clinicalMode: 'allopathy' | 'ayush';
  patient: {
    abhaId?: string;
    name?: string;
    age?: number;
    gender?: string;
    isReturning?: boolean;
    lastVisitDate?: string;
    gapDays?: number;
  };
  consentGranted: boolean;
  chiefComplaint?: string;
  turns: DialogueTurn[];
  isRecording: boolean;
  isProcessing: boolean;
  isEmergency: boolean;
  scannedDocs: Array<{
    id: string;
    name: string;
    previewUrl: string;
    entities: {
      medications: Array<{ name: string; dosage: string; frequency: string }>;
      labValues: Array<{ test: string; value: string; range: string; abnormal: boolean }>;
      diagnoses: string[];
    };
  }>;
  summaryDraft?: any;
}
