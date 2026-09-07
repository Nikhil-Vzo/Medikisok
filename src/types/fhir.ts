export interface FhirIdentifier {
  system: string;
  value: string;
  type?: {
    coding?: Array<{ system: string; code: string; display?: string }>;
  };
}

export interface FhirHumanName {
  use?: string;
  text: string;
  family?: string;
  given?: string[];
}

export interface FhirCoding {
  system: string;
  code: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text: string;
}

export interface FhirReference {
  reference: string;
  display?: string;
}

export interface FhirExtension {
  url: string;
  valueString?: string;
  valueCodeableConcept?: FhirCodeableConcept;
  extension?: FhirExtension[];
}

export interface FhirPatientResource {
  resourceType: 'Patient';
  id: string;
  identifier: FhirIdentifier[];
  name: FhirHumanName[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  telecom?: Array<{ system: string; value: string }>;
  extension?: FhirExtension[];
}

export interface FhirConditionResource {
  resourceType: 'Condition';
  id: string;
  clinicalStatus: { coding: FhirCoding[] };
  verificationStatus: { coding: FhirCoding[] };
  code: FhirCodeableConcept;
  subject: FhirReference;
  onsetDateTime?: string;
}

export interface FhirMedicationStatementResource {
  resourceType: 'MedicationStatement';
  id: string;
  status: 'active' | 'completed' | 'stopped';
  medicationCodeableConcept: FhirCodeableConcept;
  subject: FhirReference;
  dosage?: Array<{ text: string }>;
}

export interface FhirObservationResource {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category?: Array<{ coding: FhirCoding[] }>;
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime?: string;
  valueString?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
  };
  interpretation?: Array<{ coding: FhirCoding[] }>;
  component?: Array<{
    code: FhirCodeableConcept;
    valueString?: string;
  }>;
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: any;
}

export interface FhirR4Bundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document' | 'collection' | 'transaction';
  timestamp: string;
  identifier?: FhirIdentifier;
  entry: FhirBundleEntry[];
}
