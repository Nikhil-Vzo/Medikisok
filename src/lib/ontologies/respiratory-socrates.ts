import { SocratesStep } from "./allopathy-socrates";

export const SOCRATES_RESPIRATORY: SocratesStep[] = [
  {
    dimension: 'onset',
    question: {
      en: 'How long have you had this cough or shortness of breath?',
      hi: 'यह खांसी या सांस फूलने की समस्या कितने समय से है?'
    },
    options: [
      { id: 'acute_gasping', labelEn: 'Sudden acute gasp for air (< few hours)', labelHi: 'अचानक कुछ घंटों में सांस फूलने लगी', icon: 'Zap', isRedFlag: true },
      { id: 'subacute_1_2_weeks', labelEn: 'Started with cold/fever over 1-2 weeks', labelHi: '1-2 हफ्ते पहले सर्दी-जुकाम से शुरू हुआ', icon: 'Calendar' },
      { id: 'chronic_months', labelEn: 'Chronic cough for over 3-4 weeks (TB/Asthma)', labelHi: '3-4 हफ्तों से पुरानी खांसी (टीबी/अस्थमा)', icon: 'Clock' }
    ]
  },
  {
    dimension: 'character',
    question: {
      en: 'What is the nature of your cough or breathing sound?',
      hi: 'खांसी कैसी है — सूखी, बलगम वाली, या सीटी जैसी आवाज?'
    },
    options: [
      { id: 'cough_with_blood', labelEn: 'Coughing up blood or pink foam (Hemoptysis)', labelHi: 'खांसी में खून या गुलाबी झाग आना', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'wheezing_whistle', labelEn: 'Wheezing whistle sound while breathing out', labelHi: 'सांस छोड़ते समय सीटी जैसी आवाज (घरघराहट)', icon: 'Wind' },
      { id: 'thick_yellow_sputum', labelEn: 'Thick yellow or greenish sputum', labelHi: 'गाढ़ा पीला या हरा बलगम आना', icon: 'Activity' },
      { id: 'dry_hacking', labelEn: 'Persistent dry tickling throat cough', labelHi: 'गले में खराश वाली लगातार सूखी खांसी', icon: 'Thermometer' }
    ]
  },
  {
    dimension: 'severity',
    question: {
      en: 'At what point does the breathlessness occur?',
      hi: 'सांस किस समय सबसे ज्यादा फूलती है?'
    },
    options: [
      { id: 'breathless_at_rest', labelEn: 'Breathless even while sitting still at rest', labelHi: 'शांत बैठे रहने पर भी सांस फूल रही है', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'orthopnoea_lying_down', labelEn: 'Cannot sleep flat, need extra pillows to breathe', labelHi: 'सीधे लेटने पर दम घुटता है, तकिया लगाना पड़ता है', icon: 'AlertTriangle' },
      { id: 'on_walking_stairs', labelEn: 'Only on walking fast or climbing stairs', labelHi: 'तेज चलने या सीढ़ियां चढ़ने पर ही फूलती है', icon: 'TrendingUp' }
    ]
  },
  {
    dimension: 'associated',
    question: {
      en: 'Do you experience night sweats, chest tightness, or fever?',
      hi: 'क्या रात में पसीना, छाती में जकड़न या वजन कम हो रहा है?'
    },
    options: [
      { id: 'night_sweats_weight_loss', labelEn: 'Evening fever + night sweats + weight loss (TB Screen)', labelHi: 'शाम को बुखार + रात में पसीना + वजन घटना', icon: 'Thermometer' },
      { id: 'tight_chest_allergy', labelEn: 'Chest tightness with dust or cold air allergy', labelHi: 'धूल या ठंडी हवा से छाती में भारी जकड़न', icon: 'Wind' },
      { id: 'ankle_swelling', labelEn: 'Swelling on both feet and ankles (Cardio)', labelHi: 'दोनों पैरों और टखनों में सूजन आना', icon: 'Activity' },
      { id: 'runny_nose_sore_throat', labelEn: 'Mild runny nose and sore throat only', labelHi: 'केवल नाक बहना और गले में मामूली दर्द', icon: 'CheckCircle2' }
    ]
  }
];
