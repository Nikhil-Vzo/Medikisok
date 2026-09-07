// ============================================================================
// MEDIKIOSK — THE CONTINUITY ENGINE (Gap-Adaptive History)
// SIH26047 Key Innovation Hook #1:
//   gap_days < 30   → delta triage only (symptom evolution + med adherence)
//   30–90 days      → delta triage + review of systems
//   >90 days / new  → full clinical history
// Never subjects returning patients to redundant questioning.
// ============================================================================

export type InterviewDepth = "full" | "delta" | "triage_only";

export interface PatientHistoryContext {
  isReturning: boolean;
  lastVisitDate?: string; // ISO date
  lastChiefComplaint?: string;
  lastMedications?: string[]; // e.g. ["Tab Metformin 500mg BD"]
}

export interface ContinuityDecision {
  gapDays: number;
  interviewType: InterviewDepth;
  headlineHi: string;
  headlineEn: string;
  /** Extra delta questions appended for returning patients */
  deltaQuestions: DeltaQuestion[];
  /** Prior context surfaced to the doctor's summary */
  continuityNote: string;
}

export interface DeltaQuestion {
  id: string;
  dimension: string;
  question: { en: string; hi: string };
  options: Array<{
    id: string;
    labelEn: string;
    labelHi: string;
    icon: string;
    isRedFlag?: boolean;
  }>;
}

const MED_ADHERENCE_Q: DeltaQuestion = {
  id: "med_adherence",
  dimension: "medication_adherence",
  question: {
    en: "Are you still taking the medicines from your last visit?",
    hi: "क्या आप पिछली बार दी गई दवाइयां अभी भी ले रहे हैं?"
  },
  options: [
    { id: "adherent_all", labelEn: "Yes, taking all regularly", labelHi: "हां, सभी नियमित रूप से", icon: "CheckCircle2" },
    { id: "adherent_partial", labelEn: "Taking some of them", labelHi: "कुछ ही ले रहा/रही हूं", icon: "HelpCircle" },
    { id: "adherent_none", labelEn: "Stopped taking them", labelHi: "दवाइयां बंद कर दी हैं", icon: "AlertTriangle" }
  ]
};

const SYMPTOM_EVOLUTION_Q: DeltaQuestion = {
  id: "symptom_evolution",
  dimension: "symptom_evolution",
  question: {
    en: "Compared to your last visit, how do your symptoms feel now?",
    hi: "पिछली बार की तुलना में अब आपके लक्षण कैसे हैं?"
  },
  options: [
    { id: "evolved_better", labelEn: "Better than before", labelHi: "पहले से बेहतर", icon: "TrendingUp" },
    { id: "evolved_same", labelEn: "About the same", labelHi: "पहले जैसा ही", icon: "Activity" },
    { id: "evolved_worse", labelEn: "Worse than before", labelHi: "पहले से बदतर", icon: "AlertTriangle" },
    { id: "evolved_new", labelEn: "New symptoms appeared", labelHi: "नए लक्षण दिखे हैं", icon: "Zap", isRedFlag: false }
  ]
};

const REVIEW_OF_SYSTEMS_Q: DeltaQuestion = {
  id: "review_of_systems",
  dimension: "review_of_systems",
  question: {
    en: "Since your last visit, has anything NEW troubled you?",
    hi: "पिछली विज़िट के बाद कोई नई परेशानी हुई है?"
  },
  options: [
    { id: "ros_none", labelEn: "Nothing new", labelHi: "कुछ नया नहीं", icon: "CheckCircle2" },
    { id: "ros_digestive", labelEn: "Digestion / stomach issues", labelHi: "पाचन / पेट की समस्या", icon: "Flame" },
    { id: "ros_breath", labelEn: "Breathing or chest trouble", labelHi: "सांस या सीने की दिक्कत", icon: "Wind", isRedFlag: true },
    { id: "ros_joint_pain", labelEn: "Joint pain or weakness", labelHi: "जोड़ों का दर्द या कमजोरी", icon: "Activity" }
  ]
};

function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function computeContinuity(
  history: PatientHistoryContext,
  now: Date = new Date()
): ContinuityDecision {
  if (!history.isReturning || !history.lastVisitDate) {
    return {
      gapDays: -1,
      interviewType: "full",
      headlineHi: "नया मरीज़ — पूरा इतिहास लिया जाएगा",
      headlineEn: "New patient — full clinical history will be taken",
      deltaQuestions: [],
      continuityNote: "First recorded visit at MediKiosk. Full SOCRATES/Dashavidha intake performed."
    };
  }

  const gapDays = daysBetween(history.lastVisitDate, now.toISOString());

  if (gapDays < 30) {
    return {
      gapDays,
      interviewType: "triage_only",
      headlineHi: `${gapDays} दिन पहले आए थे — सिर्फ बदलाव पूछेंगे`,
      headlineEn: `Visited ${gapDays} days ago — asking only what changed`,
      deltaQuestions: [MED_ADHERENCE_Q, SYMPTOM_EVOLUTION_Q],
      continuityNote: `Returning patient (${gapDays}d interval). Delta-triage mode: symptom evolution & medication adherence only. Prior complaint: ${history.lastChiefComplaint || "not recorded"}.`
    };
  }

  if (gapDays <= 90) {
    return {
      gapDays,
      interviewType: "delta",
      headlineHi: `${gapDays} दिन पहले आए थे — बदलाव + समीक्षा होगी`,
      headlineEn: `Visited ${gapDays} days ago — delta review plus systems check`,
      deltaQuestions: [MED_ADHERENCE_Q, SYMPTOM_EVOLUTION_Q, REVIEW_OF_SYSTEMS_Q],
      continuityNote: `Returning patient (${gapDays}d interval). Delta mode with review of systems. Prior complaint: ${history.lastChiefComplaint || "not recorded"}.`
    };
  }

  return {
    gapDays,
    interviewType: "full",
    headlineHi: `${gapDays} दिन बाद आए — पूरा इतिहास फिर से लिया जाएगा`,
    headlineEn: `Visited ${gapDays} days ago — full history repeated`,
    deltaQuestions: [],
    continuityNote: `Lapsed patient (${gapDays}d interval). Full re-intake required. Prior complaint: ${history.lastChiefComplaint || "not recorded"}.`
  };
}
