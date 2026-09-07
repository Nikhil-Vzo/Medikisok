export interface AbhaAuthRequest {
  abhaNumber?: string;
  abhaAddress?: string;
  authMethod: 'mobile_otp' | 'aadhaar_otp' | 'demographics';
  otp?: string;
  mobile?: string;
  fullName?: string;
  gender?: string;
  yearOfBirth?: number;
}

export interface AbhaAuthResponse {
  success: boolean;
  abhaId: string;
  abhaAddress: string;
  fullName: string;
  gender: string;
  yearOfBirth: number;
  mobile: string;
  token?: string;
  error?: string;
}

export interface DpdpConsentArtefact {
  id: string;
  patientId: string;
  abhaId: string;
  purpose: string;
  dataClasses: string[];
  hiu: {
    id: string;
    name: string;
  };
  consentManager: {
    id: string;
  };
  status: 'GRANTED' | 'REVOKED' | 'EXPIRED';
  grantedAt: string;
  validUntil: string;
  audioVerificationRecorded: boolean;
  audioLanguage: string;
}
