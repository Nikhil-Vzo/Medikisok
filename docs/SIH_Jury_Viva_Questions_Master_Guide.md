# 🎯 Smart India Hackathon (SIH 2026) — SIH26047: MediKiosk
## The Definitive Jury & Evaluator Viva Defense Master Guide
*Comprehensive Compendium of All Expected Questions Across Clinical, Technical, Usability, Legal, and Business Dimensions*

---

### 📌 Evaluator Panel Dynamics (Who is Sitting in Front of You?)
1. **Clinical Evaluators (AIIA / Ministry of Ayush Senior Doctors):** Focus on medical safety, clinical taxonomy, Pariksha depth, and guardrails (*"Don't replace the doctor"*).
2. **Technical Judges (AI/ML & Cloud Specialists):** Focus on latency, hallucination bounds, ASR acoustic models, FHIR R4 JSON validity, and real-time WebSockets.
3. **Usability & Public Health Judges:** Focus on rural adoption, illiteracy barriers, patient throughput, and queue bottlenecks.
4. **Governance & Legal Judges:** Focus on DPDP Act 2023 compliance, ABDM M1/M2/M3 alignment, and medical liability.

---

## 🩺 Category 1: Clinical & Medical Integrity Questions

### Q1.1: "Is your AI diagnosing the patient? What is the legal liability if it makes a mistake?"
* **The Killer Answer:**
  > *"No, Sir/Ma'am. Our foundational design principle is: **'The AI never diagnoses; it prepares.'** MediKiosk is strictly a pre-consultation clinical intake and documentation engine, not a diagnostic oracle. The clinical summary generated for the physician is an editable draft watermarked 'AI-Assisted Intake — Physician Review Required'. The attending doctor retains 100% statutory autonomy to accept, amend, or reject any finding. Legal liability remains solely with the licensed physician, exactly as it does when a human junior resident or triage nurse takes initial history."*
* **Supporting Code Moat:** `src/components/doctor/soap-summary-editor.tsx` (physician-in-the-loop sign-off before committing to HIS).

---

### Q1.2: "What if a patient has an acute myocardial infarction (heart attack) or stroke at the kiosk? Will they waste 5 minutes answering questions?"
* **The Killer Answer:**
  > *"Absolutely not. MediKiosk incorporates an autonomous, real-time **Emergency Red-Flag Interceptor**. The moment a patient mentions critical trigger phrases (e.g., crushing retrosternal pain radiating to the jaw, unilateral facial droop, acute severe dyspnea, or hemoptysis), the dialogue engine immediately freezes the interview, plays an urgent bilingual audio alert to seek immediate assistance, and dispatches a high-priority red alert via WebSockets to the triage nurse and OPD emergency desk with the kiosk's location. The patient is routed straight to the casualty resuscitation bay."*
* **Supporting Code Moat:** `src/lib/ontologies/red-flags.ts` and `src/components/doctor/suggestion-alerts.tsx`.

---

### Q1.3: "You claim Ayush integration. How exactly did you model Ayurvedic Pariksha in your software?"
* **The Killer Answer:**
  > *"Unlike teams that merely prompt an LLM with generic Ayurveda keywords, we codiﬁed classical Ayurvedic clinical methodology into structured TypeScript ontologies:
  > 1. **Trividha Pariksha:** Darshana (inspection), Sparshana (palpation), and Prashna (voice questioning).
  > 2. **Dashavidha Pariksha:** Capturing Prakriti (constitutional doshas), Vikriti (active morbid dosha), Sara (tissue excellence), Samhanana (compactness), Pramana (anthropometry), Satmya (adaptability), Sattva (mental strength), Ahara Shakti (digestive capacity via Agni & Koshtha), Vyayama Shakti (exercise tolerance), and Vaya (age).
  > When an Ayush OPD is selected, our dialogue engine switches from Allopathic SOCRATES to a dedicated Prashna Pariksha decision tree that directly maps into the doctor's Ayurvedic EMR."*
* **Supporting Code Moat:** `src/lib/ontologies/ayush-dashavidha.ts` (17+ KB of verified Ayurvedic ontologies).

---

### Q1.4: "What happens when a patient is taking Ayurvedic churnas and Allopathic blood thinners simultaneously?"
* **The Killer Answer:**
  > *"This is one of MediKiosk's strongest clinical safety moats: our **Ayush-Allopathy Cross-Interaction Matrix**. When our Vision OCR scans a prior Allopathic prescription (e.g., Warfarin or Aspirin) and the patient verbally mentions taking *Guggulu* or *Garlic/Lasuna extracts*, the system flags a severe potentiated bleeding risk on the doctor's suggestion panel with clinical citations, enabling the doctor to intervene before adverse events occur."*
* **Supporting Code Moat:** `src/lib/ontologies/ayush-interactions.ts`.

---

## 💻 Category 2: Technical, AI & Architecture Questions

### Q2.1: "How do you guarantee that your LLM does not hallucinate symptoms the patient never mentioned?"
* **The Killer Answer:**
  > *"We employ a 3-layer anti-hallucination defense:
  > 1. **Ontology-Constrained Slot Filling:** The LLM does not generate free-form unconstrained dialogue. It acts as an extractor that maps voice inputs strictly into predefined clinical schema slots (SOCRATES / Dashavidha).
  > 2. **Deterministic Extraction Fallback:** If confidence drops below 85%, the system reverts to deterministic multiple-choice touch confirmation on the screen.
  > 3. **Immutable ALCOA+ Audit Trail:** Every field in the generated summary maintains an exact pointer to the original raw audio transcript segment and OCR bounding box. The doctor can click any summary line to inspect the exact patient utterance."*

---

### Q2.2: "Hospital corridors are chaotic, echoing, and 85 dB loud. How will your voice recognition work?"
* **The Killer Answer:**
  > *"We addressed acoustic reality at both hardware and software levels:
  > - **Hardware:** High-directionality noise-canceling dual-microphone beamforming arrays (e.g., USB array with DSP background suppression) that isolate speech within a 45-degree cone directly in front of the kiosk.
  > - **Software:** Real-time WebRTC noise-gate filtering + fine-tuned Whisper / Bhashini Indic ASR pipelines with colloquial Indian hospital vocabulary priors.
  > - **Dual-Mode Fallback:** Every question is simultaneously rendered as large, pictorial tap-cards on the screen. If speech confidence drops due to transient noise, the patient can simply tap."*

---

### Q2.3: "Indian doctors' handwriting is notoriously illegible. How does your OCR read crumpled prescriptions?"
* **The Killer Answer:**
  > *"We do not rely on standard flat OCR engines (like Tesseract or basic cloud OCR) which fail on cursive handwriting. We utilize a multimodal vision-language pipeline (Grok-2 Vision / Gemini 1.5 Flash) trained on high-context medical document reasoning. The model doesn't just read isolated characters; it uses medical domain priors: if it reads 'Amoxi... 500mg TDS', it leverages pharmacology knowledge graphs to disambiguate 'Amoxicillin'. Furthermore, every extracted prescription is rendered in a side-by-side verification inspector where the doctor can see the original cropped image alongside the extracted entity."*
* **Supporting Code Moat:** `src/components/doctor/ocr-document-inspector.tsx`.

---

### Q2.4: "How does your system integrate with ABDM and existing Hospital Information Systems?"
* **The Killer Answer:**
  > *"MediKiosk is built strictly to **ABDM Milestone M1, M2, and M3 standards**:
  > - **ABHA Authentication (M1):** Patients link their record via ABHA QR Scan or ABHA Address.
  > - **Health Information Exchange (M2/M3):** Our backend converts voice history and OCR documents into 100% compliant **HL7 FHIR R4 Clinical Bundles** containing `Patient`, `Condition`, `Observation`, `MedicationStatement`, and `DiagnosticReport` resources.
  > - **HIS Push:** Pushes via standard FHIR RESTful endpoints and real-time WebSocket payloads directly to the doctor's OPD console."*
* **Supporting Code Moat:** `src/lib/abdm/fhir-builder.ts` (25 KB fully compliant FHIR R4 generator).

---

## 👥 Category 3: Usability, Accessibility & Patient Demographics

### Q3.1: "How can an illiterate 65-year-old grandmother from a remote village use this kiosk alone?"
* **The Killer Answer:**
  > *"She never touches a keyboard, reads English, or navigates menus. The moment she approaches:
  > 1. An automated proximity sensor or large bilingual audio prompt greets her in her regional tongue (*'Namaste Amma, aapko kya taqleef hai?'*).
  > 2. The screen displays large, high-contrast, universally understood anatomical illustrations (e.g., tapping a chest or knee).
  > 3. She speaks naturally in colloquial dialect, and our avatar guides her step-by-step. If she hesitates for more than 15 seconds, the kiosk plays encouraging voice assistance or summons the OPD Sahayak (volunteer) with a help chime."*

---

### Q3.2: "What if a chronic patient visits every 15 days? Do they have to re-answer the entire 10-minute history?"
* **The Killer Answer:**
  > *"No! That would cause catastrophic interview fatigue. We built **The Continuity Engine (Gap-Adaptive Protocol)**:
  > - When the patient authenticates via ABHA, the system calculates `gap_days = today - last_visit`.
  > - **If < 30 days:** It runs a **Delta Triage** (*'Are your previous knee pain medicines helping? Any new complaints?'*), taking under **60 seconds**.
  > - **If 30–90 days:** Delta review + targeted Review of Systems.
  > - **If > 90 days:** Comprehensive re-evaluation.
  > Returning chronic patients are never asked what the system already knows."*
* **Supporting Code Moat:** `src/lib/continuity-engine.ts`.

---

### Q3.3: "What if a patient leaves halfway through the interview? Does their confidential data stay on screen?"
* **The Killer Answer:**
  > *"We have a strict **Auto-Purge Inactivity Guardrail**:
  > If no voice or touch input is detected for 45 seconds, an audio warning plays: *'Are you still there?'* with a 15-second visual countdown. If no input is received, the session immediately terminates, memory buffers are purged from RAM, and the screen resets to the secure welcome idle state. Incomplete drafts are never exposed to subsequent queue members."*
* **Supporting Code Moat:** `src/components/kiosk/inactivity-timer.tsx`.

---

## 🔒 Category 4: Privacy, Data Protection & Legal Compliance

### Q4.1: "How do you comply with the Digital Personal Data Protection (DPDP) Act 2023?"
* **The Killer Answer:**
  > *"MediKiosk is built from the ground up on **DPDP Act 2023 principles**:
  > 1. **Notice & Lawful Purpose:** Before data collection, an audio-visual notice explains in the patient's language exactly what data is captured and why.
  > 2. **Informed Consent Artifact:** Low-literacy patients provide audio-guided consent with a digital touch signature, recorded with a cryptographic timestamp.
  > 3. **Right to Withdraw & Purpose Limitation:** Data is used strictly for the current clinical encounter.
  > 4. **Ephemeral Session Security:** Voice audio is processed and tokenized in transient memory; raw audio files are not permanently retained unless explicit research consent is opted into."*
* **Supporting Code Moat:** `src/components/kiosk/consent-pad.tsx`.

---

### Q4.2: "Can any doctor in the hospital open any patient's confidential kiosk summary?"
* **The Killer Answer:**
  > *"No. Access control is enforced at the database level using **PostgreSQL Row-Level Security (RLS)**. A doctor can only query and view a clinical summary if there exists an active, validated token mapping that specific patient's ABHA ID to that doctor's OPD room number for that day. Unauthorized staff queries are blocked at the engine level."*

---

## 📊 Category 5: Business Viability, Throughput & Deployment

### Q5.1: "What is the hardware unit economics? Can a government hospital afford this?"
* **The Killer Answer:**
  > *"MediKiosk is hardware-agnostic by design. It does not require proprietary $10,000 kiosk enclosures:
  > - **Tier 1 (Apex Kiosk):** Commercial rugged kiosk enclosure, 21.5-inch anti-glare touch display, document tray with 16MP overhead autofocus camera, beamforming mic array (~₹65,000–₹80,000 / $800–$950 one-time CapEx).
  > - **Tier 2 (Budget Tablet / PHC Mode):** A ₹18,000 Android/Windows tablet on a standing kiosk pole with an external document camera clip.
  > Across a 3-year amortization handling 200 patients/day, the intake cost works out to **less than ₹1.50 per patient**—saving 70% of doctor consultation time."*

---

### Q5.2: "What if the line at the kiosk becomes longer than the line for the doctor?"
* **The Killer Answer:**
  > *"Our intake pipeline is designed around **OPD Throughput Math**:
  > - Average doctor consult: 2–3 minutes.
  > - Average kiosk intake: 2–3 minutes (and <60 seconds for repeat visits).
  > - By placing **2 to 3 kiosks per 100 daily OPD footfall**, intake runs completely in parallel during the 45–60 minutes the patient spends waiting in the corridor after registration. Instead of waiting idly, their dead queue time is converted into productive clinical preparation."*

---

### Q5.3: "What happens if the hospital internet goes down?"
* **The Killer Answer:**
  > *"MediKiosk features an **Edge-Resilient Offline Buffer**:
  > The frontend utilizes client-side service workers, local IndexedDB caching, and can connect to a local hospital on-premise edge gateway. If WAN connectivity drops, voice recordings and OCR document captures are queued locally on the secure kiosk SSD and synchronized via the hospital's local intranet directly to the doctor's LAN IP address."*

---

## 🏁 Summary: The 3 Core Tenets to Memorize for the Finale
1. **"ABDM built the highway; MediKiosk is the on-ramp."**
2. **"The AI never diagnoses; it prepares."**
3. **"We don't compete with e-Hospital; we complete the first-mile."**
