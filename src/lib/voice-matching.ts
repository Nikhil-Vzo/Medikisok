// Voice transcript → option matching for the kiosk interview.
// Fuzzy-matches what the patient said (Hindi or English) against the
// option labels so voice answers actually select the spoken choice.

export interface MatchableOption {
  id: string;
  labelHi?: string;
  labelEn?: string;
  descriptionHi?: string;
  descriptionEn?: string;
}

export function normalizeTranscript(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[।,.!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick the best option for a spoken transcript.
 * Strategy:
 *  1. Exact / substring match of option label text in the transcript.
 *  2. Keyword scoring against a built-in Hindi/English synonym table per option id.
 *  3. Numeric answers ("do", "teen", "8") mapped to severity options when present.
 */
export function matchOptionFromTranscript(
  transcript: string,
  options: MatchableOption[]
): { matchedId: string | null; confidence: number } {
  const t = normalizeTranscript(transcript);
  if (!t || options.length === 0) return { matchedId: null, confidence: 0 };

  // 1. Direct label substring match (highest confidence)
  for (const opt of options) {
    for (const label of [opt.labelEn, opt.labelHi]) {
      if (!label) continue;
      const norm = normalizeTranscript(label);
      if (norm.length >= 4 && t.includes(norm)) {
        return { matchedId: opt.id, confidence: 0.95 };
      }
    }
  }

  // 2. Keyword scoring
  let best: { id: string; score: number } | null = null;
  for (const opt of options) {
    const keywords = buildKeywords(opt);
    let score = 0;
    for (const kw of keywords) {
      if (t.includes(kw)) score += kw.length > 6 ? 3 : 2;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { id: opt.id, score };
    }
  }
  if (best && best.score >= 2) {
    return { matchedId: best.id, confidence: Math.min(0.85, 0.5 + best.score * 0.08) };
  }

  // 3. Number words → severity-style numeric options ("mild_1_3", "severe_7_10")
  const numWords: Record<string, string> = {
    ek: "1", do: "2", teen: "3", char: "4", paanch: "5", chhah: "6",
    saat: "7", aath: "8", nau: "9", das: "10",
    one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
    seven: "7", eight: "8", nine: "9", ten: "10"
  };
  const digits = t.match(/\d+/);
  let digitStr = digits ? digits[0] : null;
  if (!digitStr) {
    for (const [word, d] of Object.entries(numWords)) {
      if (new RegExp(`\\b${word}\\b`).test(t)) { digitStr = d; break; }
    }
  }
  if (digitStr) {
    const numOpt = options.find((o) => o.id.includes(digitStr!));
    if (numOpt) return { matchedId: numOpt.id, confidence: 0.75 };
  }

  return { matchedId: null, confidence: 0 };
}

function buildKeywords(opt: MatchableOption): string[] {
  // Curated synonyms keyed by common option ids, plus salient words from labels.
  const curated: Record<string, string[]> = {
    substernal: ["बीचों", "beech", "center", "centre", "केंद्र"],
    left_chest: ["बाईं", "left", "bayen"],
    right_chest: ["दाईं", "right", "dayen"],
    diffuse: ["पूरे", "pure", "all over"],
    sudden_acute: ["अचानक", "achanak", "suddenly", "sudden"],
    gradual_days: ["धीरे", "dhere", "gradual", "2-3 दिन"],
    post_exertion: ["चलने", "chalne", "exertion", "walking"],
    crushing_pressure: ["दबाव", "dabav", "crushing", "pressure", "जकड़न", "jakdan"],
    sharp_stabbing: ["चुभन", "chubhan", "sharp", "stabbing"],
    burning: ["जलन", "jalan", "burning", "एसिडिटी", "acidity"],
    dull_ache: ["हल्का", "halka", "dull"],
    left_arm_jaw: ["बाएं हाथ", "bayen hath", "jab", "जबड़ा", "गर्दन", "gardan", "left arm", "jaw"],
    back_scapula: ["पीठ", "peeth", "back", "कंधा", "kandha"],
    no_radiation: ["नहीं", "nahin", "nahi", "no radiation", "सिर्फ सीने"],
    shortness_of_breath: ["सांस", "saans", "breath", "पसीना", "paseena", "sweat"],
    dizziness_nausea: ["चक्कर", "chakkar", "dizzy", "nausea", "उलटी", "ulti"],
    cough_fever: ["खांसी", "khansi", "cough", "बुखार", "bukhar", "fever"],
    none: ["कुछ नहीं", "kuch nahi", "none"]
  };

  const kws = [...(curated[opt.id] || [])];
  // Add distinctive words from labels as fallback keywords
  for (const label of [opt.labelEn, opt.labelHi]) {
    if (!label) continue;
    for (const w of normalizeTranscript(label).split(" ")) {
      if (w.length >= 5 && !w.includes("(") ) kws.push(w);
    }
  }
  return kws;
}
