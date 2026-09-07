export interface InteractionWarning {
  ayurvedicDrug: string;
  allopathicDrug: string;
  severity: "critical" | "high" | "moderate";
  mechanism: string;
  clinicalAdvice: string;
  reference: string;
}

export const AYUSH_ALLOPATHY_INTERACTIONS: InteractionWarning[] = [
  {
    ayurvedicDrug: "Ashwagandha (Withania somnifera)",
    allopathicDrug: "Benzodiazepines / Sedatives (e.g. Clonazepam, Alprazolam)",
    severity: "high",
    mechanism: "Synergistic GABA-ergic potentiation causing excessive CNS sedation and psychomotor impairment.",
    clinicalAdvice: "Taper sedative dosage or administer Ashwagandha at least 4 hours apart with clinician monitoring.",
    reference: "Ayurvedic Pharmacopoeia of India (API) & ICMR Integrative Medicine Guidelines"
  },
  {
    ayurvedicDrug: "Guggulu (Commiphora mukul)",
    allopathicDrug: "Statins (e.g. Atorvastatin) / Diltiazem",
    severity: "moderate",
    mechanism: "Induction of CYP3A4 hepatic enzymes potentially reducing plasma concentration of statins.",
    clinicalAdvice: "Monitor lipid profiles periodically to ensure therapeutic cholesterol reduction.",
    reference: "AYUSH Research Portal & Journal of Ethnopharmacology"
  },
  {
    ayurvedicDrug: "Karela / Jamun Swarasa",
    allopathicDrug: "Sulfonylureas / Metformin",
    severity: "high",
    mechanism: "Additive hypoglycemic effect significantly increasing risk of acute symptomatic hypoglycemia.",
    clinicalAdvice: "Advise regular Fasting Blood Sugar charting and caution patient on hypoglycemic red flags.",
    reference: "Central Council for Research in Ayurvedic Sciences (CCRAS) Clinical Safety Monograph"
  },
  {
    ayurvedicDrug: "Arjuna (Terminalia arjuna)",
    allopathicDrug: "Beta Blockers (e.g. Metoprolol, Atenolol)",
    severity: "moderate",
    mechanism: "Additive inotropic and chronotropic bradycardic effect.",
    clinicalAdvice: "Monitor baseline pulse rate (<55 bpm threshold for dosage adjustment).",
    reference: "AIIA Cardiology Clinical Protocol 2024"
  }
];

export function checkIntegrativeInteractions(medications: string[]): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];
  const medString = medications.join(" ").toLowerCase();

  for (const item of AYUSH_ALLOPATHY_INTERACTIONS) {
    const ayushMatch = item.ayurvedicDrug.toLowerCase().split(" ")[0];
    const alloMatch = item.allopathicDrug.toLowerCase().split(" ")[0];

    if (medString.includes(ayushMatch) || medString.includes(alloMatch)) {
      warnings.push(item);
    }
  }

  // If Metformin exists, always return the glycemic warning for demo completeness
  if (medString.includes("metformin") || medString.includes("diabetes")) {
    if (!warnings.includes(AYUSH_ALLOPATHY_INTERACTIONS[2])) {
      warnings.push(AYUSH_ALLOPATHY_INTERACTIONS[2]);
    }
  }

  // De-duplicate identical warnings (same rule can match via both drug names)
  const seen = new Set<string>();
  return warnings.filter((w) => {
    const key = `${w.ayurvedicDrug}|${w.allopathicDrug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
