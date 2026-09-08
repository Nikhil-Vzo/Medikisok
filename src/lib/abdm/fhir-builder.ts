import { FhirR4Bundle, FhirPatientResource, FhirConditionResource, FhirMedicationStatementResource, FhirObservationResource, FhirIdentifier } from "@/types/fhir";
import { ClinicalSummaryDraft } from "@/types/clinical";
import { DpdpConsentArtefact } from "@/types/abdm";

// ---------------------------------------------------------------------------
// ABDM / ABHA Patient Extension
// Adds healthId, healthAddress, and care context links to a Patient resource.
// ---------------------------------------------------------------------------
export function withAbhaLinking(
  patient: FhirPatientResource,
  opts: {
    healthId?: string;        // ABHA ID e.g. ""
    healthAddress?: string;   // ABHA Address e.g. "patient@abdm"
    careContextReference?: string;
    careContextDisplay?: string;
    linkedOn?: string;        // ISO timestamp of ABHA linkage
  }
): FhirPatientResource {
  const ext: any[] = [
    {
      url: "https://nrces.in/abha/StructureDefinition/HealthID",
      valueString: opts.healthId
    },
    {
      url: "https://nrces.in/abha/StructureDefinition/HealthAddress",
      valueString: opts.healthAddress
    },
    {
      url: "https://nrces.in/abha/StructureDefinition/CareContextLink",
      extension: [
        { url: "reference", valueString: opts.careContextReference },
        { url: "display", valueString: opts.careContextDisplay }
      ]
    },
    {
      url: "https://nrces.in/abha/StructureDefinition/LinkedOn",
      valueDateTime: opts.linkedOn || new Date().toISOString()
    }
  ];

  return {
    ...patient,
    identifier: [
      ...patient.identifier,
      // ABHA Number identifier (alternate)
      {
        system: "https://abdm.gov.in/abha-api/abha-number",
        value: opts.healthId || "",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "AN",
              display: "ABHA Number"
            }
          ]
        }
      } as FhirIdentifier
    ],
    extension: [
      ...(patient.extension || []),
      ...ext.filter(e => e.valueString !== undefined || e.extension !== undefined)
    ]
  };
}

// ---------------------------------------------------------------------------
// ABDM Consent Resource
// Generates a FHIR Consent resource compliant with ABDM HIU/CM consent flow.
// ---------------------------------------------------------------------------
export function buildAbdmConsent(
  consent: DpdpConsentArtefact,
  patientRef: string,
  patientDisplay: string
): any {
  return {
    resourceType: "Consent",
    id: `consent-${consent.id || Date.now()}`,
    text: {
      status: "generated",
      div: `<div><p>Consent artefact for patient ${patientDisplay}</p><p>Purpose: ${consent.purpose}</p><p>Status: ${consent.status}</p></div>`
    },
    status: consent.status.toLowerCase() === "granted" ? "active" : "inactive",
    scope: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/consentscope",
          code: "patient-privacy",
          display: "Privacy Consent"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: "https://abdm.gov.in/codes/consent/category",
            code: "DIGNOSTICRECORD",
            display: "Diagnostic Records"
          }
        ]
      }
    ],
    subject: {
      reference: patientRef,
      display: patientDisplay
    },
    date: consent.grantedAt,
    grantor: {
      reference: `Patient/${patientRef}`,
      display: patientDisplay
    },
    period: {
      start: consent.grantedAt,
      end: consent.validUntil
    },
    purpose: consent.dataClasses.map(dc => ({
      coding: [
        {
          system: "https://abdm.gov.in/codes/purpose",
          code: "CARETREATMENT",
          display: dc
        }
      ]
    })),
    dataPeriod: {
      start: consent.grantedAt,
      end: consent.validUntil
    },
    actor: [
      {
        role: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              code: "IRCP",
              display: "Information Recipient"
            }
          ]
        },
        reference: {
          reference: `Organization/${consent.hiu.id}`,
          display: consent.hiu.name
        }
      },
      {
        role: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              code: "CST",
              display: "Consent Manager"
            }
          ]
        },
        reference: {
          reference: `ConsentManager/${consent.consentManager.id}`,
          display: "ABDM Consent Manager"
        }
      }
    ],
    verification: {
      verified: true,
      verificationDate: consent.grantedAt,
      who: {
        reference: `Patient/${patientRef}`,
        display: patientDisplay
      }
    },
    extension: [
      {
        url: "https://nrces.in/abha/StructureDefinition/ConsentAudio",
        extension: [
          { url: "recorded", valueBoolean: consent.audioVerificationRecorded },
          { url: "language", valueString: consent.audioLanguage }
        ]
      }
    ]
  };
}

// ---------------------------------------------------------------------------
// generateFhirBundle — full-featured entry point
// Accepts ClinicalSummaryDraft + patient details + optional consent artefact.
// Returns a fully-populated FHIR R4 Bundle ready for export.
// ---------------------------------------------------------------------------
export function generateFhirBundle(params: {
  summary: ClinicalSummaryDraft;
  patientDetails: {
    abhaId?: string;
    abhaAddress?: string;
    name?: string;
    gender?: string;
    age?: number;
    careContextRef?: string;
    careContextDisplay?: string;
    consent?: DpdpConsentArtefact;
  };
  vitals?: {
    bloodPressure?: string;
    pulseRate?: number;
    spO2?: number;
    temperature?: string;
    weight?: string;
  } | null;
}): FhirR4Bundle {
  const bundleId = `mk-bundle-${Date.now()}`;
  const patientRefId = `urn:uuid:patient-${params.summary.patientId || "pat-001"}`;
  const practitionerRefId = "urn:uuid:practitioner-aiia-003";
  const compositionRefId = `urn:uuid:composition-${Date.now()}`;

  // 1. Patient Resource with ABHA Linking
  let patientResource: FhirPatientResource = {
    resourceType: "Patient",
    id: params.summary.patientId || "pat-001",
    identifier: [
      {
        system: "https://healthid.abdm.gov.in",
        value: params.patientDetails.abhaId || "",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR",
              display: "ABHA Health Account Identifier"
            }
          ]
        }
      } as FhirIdentifier
    ],
    name: [
      {
        text: params.patientDetails.name || "Patient",
        family: params.patientDetails.name?.split(" ").slice(-1)[0] || "Patient",
        given: params.patientDetails.name?.split(" ").slice(0, -1) || ["Patient"]
      }
    ],
    gender: (params.patientDetails.gender?.toLowerCase() as any) || "female",
    birthDate: params.patientDetails.age
      ? `${new Date().getFullYear() - params.patientDetails.age}-01-01`
      : "1964-01-01"
  };

  // Apply ABHA linking extensions and additional identifiers
  patientResource = withAbhaLinking(patientResource, {
    healthId: params.patientDetails.abhaId,
    healthAddress: params.patientDetails.abhaAddress,
    careContextReference: params.patientDetails.careContextRef,
    careContextDisplay: params.patientDetails.careContextDisplay,
    linkedOn: new Date().toISOString()
  });

  // 2. Practitioner Resource
  const practitionerResource = {
    resourceType: "Practitioner",
    id: "practitioner-aiia-003",
    identifier: [
      {
        system: "https://doctor.abdm.gov.in",
        value: "AIIA-DOC-8921"
      }
    ],
    name: [{ text: "Dr. Sharma, MD (Ayurveda)" }]
  };

  // 3. Condition Resource
  const conditionResource: FhirConditionResource = {
    resourceType: "Condition",
    id: `condition-${Date.now()}`,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active"
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: "confirmed",
          display: "Confirmed"
        }
      ]
    },
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "29857009",
          display: "Chest pain"
        },
        {
          system: "https://namstp.ayush.gov.in",
          code: "AYU-AML-001",
          display: "Amlapitta (Hyperacidity Syndrome)"
        }
      ],
      text: params.summary.chiefComplaint || "Clinical Intake Assessment"
    },
    subject: {
      reference: patientRefId,
      display: params.patientDetails.name || "Patient"
    },
    onsetDateTime: new Date().toISOString()
  };

  // 4. Composition Resource
  const compositionResource = {
    resourceType: "Composition",
    id: `composition-${Date.now()}`,
    status: "final",
    type: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "371530004",
          display: "Clinical consultation report"
        }
      ],
      text: "OPD Clinical Case-Taking & AYUSH Assessment Summary"
    },
    subject: { reference: patientRefId, display: params.patientDetails.name || "Patient" },
    date: new Date().toISOString(),
    author: [{ reference: practitionerRefId, display: "Dr. Sharma, MD (AIIA)" }],
    title: "All India Institute of Ayurveda — OPD Intake Record",
    section: [
      {
        title: "Chief Complaint & History of Present Illness",
        code: {
          coding: [
            { system: "http://snomed.info/sct", code: "422843007", display: "Chief complaint section" }
          ]
        },
        text: {
          status: "generated",
          div: `<div><p>${params.summary.chiefComplaint}</p><p>${params.summary.historyOfPresentIllness}</p></div>`
        }
      },
      {
        title: "AYUSH Dashavidha Pariksha Evaluation",
        code: {
          coding: [
            { system: "https://namstp.ayush.gov.in", code: "AYU-DASH-001", display: "Dashavidha Pariksha" }
          ]
        },
        text: {
          status: "generated",
          div: `<div><p>Prakriti: ${params.summary.ayushAssessment?.prakriti || "Vata-Pitta"}</p><p>Agni: ${params.summary.ayushAssessment?.agni || "Tikshna"}</p></div>`
        }
      }
    ]
  };

  const entries: any[] = [
    { fullUrl: compositionRefId, resource: compositionResource },
    { fullUrl: patientRefId, resource: patientResource },
    { fullUrl: practitionerRefId, resource: practitionerResource },
    { fullUrl: `urn:uuid:condition-${Date.now()}`, resource: conditionResource }
  ];

  // 5. Medication Statements
  if (params.summary.currentMedications && params.summary.currentMedications.length > 0) {
    params.summary.currentMedications.forEach((med, idx) => {
      const medResource: FhirMedicationStatementResource = {
        resourceType: "MedicationStatement",
        id: `medication-${idx + 1}`,
        status: "active",
        medicationCodeableConcept: {
          coding: [
            {
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              code: "860975",
              display: med.name
            }
          ],
          text: `${med.name} ${med.dosage} (${med.frequency})`
        },
        subject: {
          reference: patientRefId,
          display: params.patientDetails.name || "Patient"
        },
        dosage: [{ text: `${med.dosage} ${med.frequency}` }]
      };
      entries.push({
        fullUrl: `urn:uuid:medication-${idx + 1}`,
        resource: medResource
      });
    });
  }

  // 6. Vital Signs Observations
  const vitalsObservations = params.vitals
    ? [
        {
          id: "obs-bp",
          code: "85354-9",
          display: "Blood pressure panel with all children optional",
          value: params.vitals.bloodPressure || "Not recorded"
        },
        {
          id: "obs-hr",
          code: "8867-4",
          display: "Heart rate",
          value: params.vitals.pulseRate ? `${params.vitals.pulseRate} /min` : "Not recorded"
        },
        {
          id: "obs-spo2",
          code: "2708-6",
          display: "Oxygen saturation in Arterial blood by Pulse oximetry",
          value: params.vitals.spO2 ? `${params.vitals.spO2} %` : "Not recorded"
        },
        {
          id: "obs-temp",
          code: "8310-5",
          display: "Body temperature",
          value: params.vitals.temperature || "Not recorded"
        },
        ...(params.vitals.weight
          ? [{ id: "obs-weight", code: "29463-7", display: "Body weight", value: params.vitals.weight }]
          : [])
      ]
    : [
        { id: "obs-bp", code: "85354-9", display: "Blood pressure panel with all children optional", value: "138/88 mmHg" },
        { id: "obs-hr", code: "8867-4", display: "Heart rate", value: "86 /min" },
        { id: "obs-spo2", code: "2708-6", display: "Oxygen saturation in Arterial blood by Pulse oximetry", value: "98 %" },
        { id: "obs-temp", code: "8310-5", display: "Body temperature", value: "98.6 °F" }
      ];

  vitalsObservations.forEach((v) => {
    const obsResource = {
      resourceType: "Observation",
      id: v.id,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }
          ]
        }
      ],
      code: { coding: [{ system: "http://loinc.org", code: v.code, display: v.display }] },
      subject: { reference: patientRefId, display: params.patientDetails.name || "Patient" },
      effectiveDateTime: new Date().toISOString(),
      valueString: v.value
    };
    entries.push({ fullUrl: `urn:uuid:${v.id}`, resource: obsResource });
  });

  // 7. AYUSH Dashavidha Pariksha Observation
  if (params.summary.ayushAssessment) {
    const ayushObservation: FhirObservationResource = {
      resourceType: "Observation",
      id: `obs-ayush-${Date.now()}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "exam",
              display: "Exam"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "https://namstp.ayush.gov.in",
            code: "AYU-OBS-DASH",
            display: "Dashavidha Pariksha Assessment"
          }
        ],
        text: "Ayurvedic Dashavidha Pariksha Clinical Evaluation"
      },
      subject: { reference: patientRefId, display: params.patientDetails.name || "Patient" },
      effectiveDateTime: new Date().toISOString(),
      component: Object.entries(params.summary.ayushAssessment).map(([key, val]) => ({
        code: { text: key },
        valueString: typeof val === "object" ? JSON.stringify(val) : String(val)
      }))
    };
    entries.push({ fullUrl: `urn:uuid:obs-ayush-${Date.now()}`, resource: ayushObservation });
  }

  // 8. ABDM Consent Resource (if provided)
  if (params.patientDetails.consent) {
    const consentResource = buildAbdmConsent(
      params.patientDetails.consent,
      patientRefId,
      params.patientDetails.name || "Patient"
    );
    entries.push({
      fullUrl: `urn:uuid:consent-${Date.now()}`,
      resource: consentResource
    });
  }

  return {
    resourceType: "Bundle",
    id: bundleId,
    type: "document",
    timestamp: new Date().toISOString(),
    identifier: {
      system: "https://medikiosk.aiia.gov.in/bundles",
      value: `MK-${Date.now()}`
    },
    entry: entries
  };
}

// ---------------------------------------------------------------------------
// exportToFhirJson — triggers browser download of a FHIR Bundle as .json
// ---------------------------------------------------------------------------
export function exportToFhirJson(bundle: FhirR4Bundle, filename?: string): void {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `FHIR-Bundle-${bundle.id || Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Legacy entry point — kept for backward compatibility with existing callers
// ---------------------------------------------------------------------------
export function buildFhirR4Bundle(summary: ClinicalSummaryDraft, patientDetails: {
  abhaId?: string;
  name?: string;
  gender?: string;
  age?: number;
}, vitals?: {
  bloodPressure?: string;
  pulseRate?: number;
  spO2?: number;
  temperature?: string;
  weight?: string;
} | null): FhirR4Bundle {
  const bundleId = `mk-bundle-${Date.now()}`;
  const patientRefId = `urn:uuid:patient-${summary.patientId || 'pat-001'}`;
  const practitionerRefId = `urn:uuid:practitioner-aiia-003`;
  const compositionRefId = `urn:uuid:composition-${Date.now()}`;
  
  // 1. Patient Resource
  const patientResource: FhirPatientResource = {
    resourceType: 'Patient',
    id: summary.patientId || 'pat-001',
    identifier: [
      {
        system: 'https://healthid.abdm.gov.in',
        value: patientDetails.abhaId || '',
        type: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'ABHA Health Account Identifier' }]
        }
      }
    ],
    name: [
      {
        text: patientDetails.name || 'Patient',
        family: patientDetails.name?.split(' ').slice(-1)[0] || 'Patient',
        given: patientDetails.name?.split(' ').slice(0, -1) || ['Patient']
      }
    ],
    gender: (patientDetails.gender?.toLowerCase() as any) || 'female',
    birthDate: patientDetails.age ? `${new Date().getFullYear() - patientDetails.age}-01-01` : '1964-01-01'
  };

  // 2. Practitioner Resource
  const practitionerResource = {
    resourceType: 'Practitioner',
    id: 'practitioner-aiia-003',
    identifier: [
      {
        system: 'https://doctor.abdm.gov.in',
        value: 'AIIA-DOC-8921'
      }
    ],
    name: [{ text: 'Dr. Sharma, MD (Ayurveda)' }]
  };

  // 3. Condition Resource (SNOMED-CT / NAMASTE)
  const conditionResource: FhirConditionResource = {
    resourceType: 'Condition',
    id: `condition-${Date.now()}`,
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }]
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }]
    },
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '29857009',
          display: 'Chest pain'
        },
        {
          system: 'https://namstp.ayush.gov.in',
          code: 'AYU-AML-001',
          display: 'Amlapitta (Hyperacidity Syndrome)'
        }
      ],
      text: summary.chiefComplaint || 'Clinical Intake Assessment'
    },
    subject: {
      reference: patientRefId,
      display: patientDetails.name || 'Patient'
    },
    onsetDateTime: new Date().toISOString()
  };

  // 4. Composition Resource (ABDM OPD Consultation Document Header)
  const compositionResource = {
    resourceType: 'Composition',
    id: `composition-${Date.now()}`,
    status: 'final',
    type: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '371530004',
          display: 'Clinical consultation report'
        }
      ],
      text: 'OPD Clinical Case-Taking & AYUSH Assessment Summary'
    },
    subject: { reference: patientRefId, display: patientDetails.name || 'Patient' },
    date: new Date().toISOString(),
    author: [{ reference: practitionerRefId, display: 'Dr. Sharma, MD (AIIA)' }],
    title: 'All India Institute of Ayurveda — OPD Intake Record',
    section: [
      {
        title: 'Chief Complaint & History of Present Illness',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '422843007', display: 'Chief complaint section' }] },
        text: { status: 'generated', div: `<div><p>${summary.chiefComplaint}</p><p>${summary.historyOfPresentIllness}</p></div>` }
      },
      {
        title: 'AYUSH Dashavidha Pariksha Evaluation',
        code: { coding: [{ system: 'https://namstp.ayush.gov.in', code: 'AYU-DASH-001', display: 'Dashavidha Pariksha' }] },
        text: { status: 'generated', div: `<div><p>Prakriti: ${summary.ayushAssessment?.prakriti || 'Vata-Pitta'}</p><p>Agni: ${summary.ayushAssessment?.agni || 'Tikshna'}</p></div>` }
      }
    ]
  };

  const entries: any[] = [
    { fullUrl: compositionRefId, resource: compositionResource },
    { fullUrl: patientRefId, resource: patientResource },
    { fullUrl: practitionerRefId, resource: practitionerResource },
    { fullUrl: `urn:uuid:condition-${Date.now()}`, resource: conditionResource }
  ];

  // 5. Medication Statements (RxNorm / SNOMED-CT)
  if (summary.currentMedications && summary.currentMedications.length > 0) {
    summary.currentMedications.forEach((med, idx) => {
      const medResource: FhirMedicationStatementResource = {
        resourceType: 'MedicationStatement',
        id: `medication-${idx + 1}`,
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '860975',
              display: med.name
            }
          ],
          text: `${med.name} ${med.dosage} (${med.frequency})`
        },
        subject: { reference: patientRefId, display: patientDetails.name || 'Patient' },
        dosage: [{ text: `${med.dosage} ${med.frequency}` }]
      };
      entries.push({ fullUrl: `urn:uuid:medication-${idx + 1}`, resource: medResource });
    });
  }

  // 6. Vital Signs Observations (LOINC Codes) — real kiosk readings when available
  const vitalsObservations = vitals ? [
    { id: 'obs-bp', code: '85354-9', display: 'Blood pressure panel with all children optional', value: vitals.bloodPressure || 'Not recorded' },
    { id: 'obs-hr', code: '8867-4', display: 'Heart rate', value: vitals.pulseRate ? `${vitals.pulseRate} /min` : 'Not recorded' },
    { id: 'obs-spo2', code: '2708-6', display: 'Oxygen saturation in Arterial blood by Pulse oximetry', value: vitals.spO2 ? `${vitals.spO2} %` : 'Not recorded' },
    { id: 'obs-temp', code: '8310-5', display: 'Body temperature', value: vitals.temperature || 'Not recorded' },
    ...(vitals.weight ? [{ id: 'obs-weight', code: '29463-7', display: 'Body weight', value: vitals.weight }] : [])
  ] : [
    { id: 'obs-bp', code: '85354-9', display: 'Blood pressure panel with all children optional', value: '138/88 mmHg' },
    { id: 'obs-hr', code: '8867-4', display: 'Heart rate', value: '86 /min' },
    { id: 'obs-spo2', code: '2708-6', display: 'Oxygen saturation in Arterial blood by Pulse oximetry', value: '98 %' },
    { id: 'obs-temp', code: '8310-5', display: 'Body temperature', value: '98.6 °F' }
  ];

  vitalsObservations.forEach((v) => {
    const obsResource = {
      resourceType: 'Observation',
      id: v.id,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: v.code, display: v.display }] },
      subject: { reference: patientRefId, display: patientDetails.name || 'Patient' },
      effectiveDateTime: new Date().toISOString(),
      valueString: v.value
    };
    entries.push({ fullUrl: `urn:uuid:${v.id}`, resource: obsResource });
  });

  // 7. Ayurvedic Dashavidha Pariksha Observations (NAMASTE / AYUSH)
  if (summary.ayushAssessment) {
    const ayushObservation: FhirObservationResource = {
      resourceType: 'Observation',
      id: `obs-ayush-${Date.now()}`,
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam', display: 'Exam' }]
        }
      ],
      code: {
        coding: [{ system: 'https://namstp.ayush.gov.in', code: 'AYU-OBS-DASH', display: 'Dashavidha Pariksha Assessment' }],
        text: 'Ayurvedic Dashavidha Pariksha Clinical Evaluation'
      },
      subject: { reference: patientRefId, display: patientDetails.name || 'Patient' },
      effectiveDateTime: new Date().toISOString(),
      component: Object.entries(summary.ayushAssessment).map(([key, val]) => ({
        code: { text: key },
        valueString: typeof val === 'object' ? JSON.stringify(val) : String(val)
      }))
    };
    entries.push({ fullUrl: `urn:uuid:obs-ayush-${Date.now()}`, resource: ayushObservation });
  }

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'document',
    timestamp: new Date().toISOString(),
    identifier: {
      system: 'https://medikiosk.aiia.gov.in/bundles',
      value: `MK-${Date.now()}`
    },
    entry: entries
  };
}
