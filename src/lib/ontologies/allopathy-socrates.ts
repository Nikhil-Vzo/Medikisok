export interface SocratesStep {
  dimension: 'site' | 'onset' | 'character' | 'radiation' | 'associated' | 'timing' | 'exacerbating' | 'severity';
  question: {
    en: string;
    hi: string;
  };
  options: Array<{
    id: string;
    labelEn: string;
    labelHi: string;
    icon: string;
    isRedFlag?: boolean;
  }>;
}

export const SOCRATES_CHEST_PAIN: SocratesStep[] = [
  {
    dimension: 'site',
    question: {
      en: 'Where exactly do you feel the pain in your chest?',
      hi: 'सीने में दर्द बिल्कुल किस जगह पर महसूस हो रहा है?'
    },
    options: [
      { id: 'substernal', labelEn: 'Center of Chest', labelHi: 'सीने के बीचों-बीच', icon: 'ShieldAlert' },
      { id: 'left_chest', labelEn: 'Left Side', labelHi: 'बाईं तरफ', icon: 'Heart' },
      { id: 'right_chest', labelEn: 'Right Side', labelHi: 'दाईं तरफ', icon: 'Activity' },
      { id: 'diffuse', labelEn: 'All Over Chest', labelHi: 'पूरे सीने में', icon: 'Zap' }
    ]
  },
  {
    dimension: 'onset',
    question: {
      en: 'When and how did the pain begin?',
      hi: 'यह दर्द कब और कैसे शुरू हुआ?'
    },
    options: [
      { id: 'sudden_acute', labelEn: 'Suddenly within minutes', labelHi: 'अचानक कुछ मिनटों में', icon: 'Clock', isRedFlag: true },
      { id: 'gradual_days', labelEn: 'Gradually over 2-3 days', labelHi: '2-3 दिनों से धीरे-धीरे', icon: 'Calendar' },
      { id: 'post_exertion', labelEn: 'After walking / lifting', labelHi: 'चलने या भारी काम के बाद', icon: 'TrendingUp' }
    ]
  },
  {
    dimension: 'character',
    question: {
      en: 'How would you describe the nature of this pain?',
      hi: 'दर्द का रूप कैसा है — दबाव, चुभन, या जलन?'
    },
    options: [
      { id: 'crushing_pressure', labelEn: 'Crushing / Heavy Pressure', labelHi: 'भारी दबाव या जकड़न', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'sharp_stabbing', labelEn: 'Sharp / Stabbing', labelHi: 'तेज चुभन जैसा', icon: 'Zap' },
      { id: 'burning', labelEn: 'Burning / Acidity sensation', labelHi: 'जलन या एसिडिटी जैसा', icon: 'Flame' },
      { id: 'dull_ache', labelEn: 'Dull continuous ache', labelHi: 'हल्का-हल्का लगातार दर्द', icon: 'Activity' }
    ]
  },
  {
    dimension: 'radiation',
    question: {
      en: 'Does the pain spread anywhere else?',
      hi: 'क्या यह दर्द कहीं और फैल रहा है?'
    },
    options: [
      { id: 'left_arm_jaw', labelEn: 'Left Arm / Neck / Jaw', labelHi: 'बाएं हाथ, गर्दन या जबड़े में', icon: 'AlertTriangle', isRedFlag: true },
      { id: 'back_scapula', labelEn: 'Back / Shoulder blades', labelHi: 'पीठ या कंधों के बीच', icon: 'ArrowUpRight' },
      { id: 'no_radiation', labelEn: 'No, stays in chest only', labelHi: 'नहीं, सिर्फ सीने में ही है', icon: 'CheckCircle2' }
    ]
  },
  {
    dimension: 'associated',
    question: {
      en: 'Are you experiencing any of these associated symptoms?',
      hi: 'क्या आपको साथ में इनमें से कोई परेशानी हो रही है?'
    },
    options: [
      { id: 'shortness_of_breath', labelEn: 'Breathlessness & Sweating', labelHi: 'सांस फूलना और पसीना आना', icon: 'Wind', isRedFlag: true },
      { id: 'dizziness_nausea', labelEn: 'Dizziness / Nausea', labelHi: 'चक्कर या उल्टी जैसा लगना', icon: 'HelpCircle', isRedFlag: true },
      { id: 'cough_fever', labelEn: 'Cough with Fever', labelHi: 'खांसी और बुखार', icon: 'Thermometer' },
      { id: 'none', labelEn: 'None of the above', labelHi: 'इनमें से कुछ नहीं', icon: 'CheckCircle2' }
    ]
  },
  {
    dimension: 'severity',
    question: {
      en: 'On a scale from 1 to 10, how severe is the pain right now?',
      hi: '1 से 10 के पैमाने पर दर्द कितना तेज है?'
    },
    options: [
      { id: 'mild_1_3', labelEn: 'Mild (1 - 3)', labelHi: 'हल्का (1 - 3)', icon: 'Smile' },
      { id: 'moderate_4_6', labelEn: 'Moderate (4 - 6)', labelHi: 'मध्यम (4 - 6)', icon: 'Meh' },
      { id: 'severe_7_10', labelEn: 'Severe Emergency (7 - 10)', labelHi: 'असहनीय / बहुत तेज (7 - 10)', icon: 'AlertOctagon', isRedFlag: true }
    ]
  }
];
