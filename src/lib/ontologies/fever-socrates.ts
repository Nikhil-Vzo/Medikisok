import { SocratesStep } from "./allopathy-socrates";

export const SOCRATES_FEVER: SocratesStep[] = [
  {
    dimension: 'onset',
    question: {
      en: 'How long have you had this fever and how did it start?',
      hi: 'यह बुखार कितने दिनों से है और कैसे शुरू हुआ?'
    },
    options: [
      { id: 'sudden_high', labelEn: 'Suddenly with severe chills (< 24 hrs)', labelHi: 'अचानक तेज ठंड लगकर (24 घंटे में)', icon: 'Zap', isRedFlag: true },
      { id: 'recent_2_3_days', labelEn: 'Past 2-3 days with bodyache', labelHi: 'पिछले 2-3 दिनों से बदन दर्द के साथ', icon: 'Calendar' },
      { id: 'prolonged_weeks', labelEn: 'Continuous for more than 1-2 weeks', labelHi: '1-2 हफ्ते से लगातार बना हुआ है', icon: 'Clock' }
    ]
  },
  {
    dimension: 'character',
    question: {
      en: 'What is the nature and pattern of the fever?',
      hi: 'बुखार किस तरह का है — क्या कंपकंपी या पसीना आता है?'
    },
    options: [
      { id: 'with_rigors', labelEn: 'High fever with shaking chills (Rigors)', labelHi: 'तेज कंपकंपी (कांपने) के साथ बुखार', icon: 'Wind', isRedFlag: true },
      { id: 'continuous_high', labelEn: 'Continuous high grade (no drop)', labelHi: 'लगातार तेज बुखार (बिना उतरे)', icon: 'Flame' },
      { id: 'evening_rise', labelEn: 'Low grade, rises in evening with sweating', labelHi: 'शाम को बढ़ने वाला हल्का बुखार + पसीना', icon: 'Thermometer' },
      { id: 'intermittent_comes_goes', labelEn: 'Comes and goes in spikes', labelHi: 'उतर-चढ़कर आता है', icon: 'Activity' }
    ]
  },
  {
    dimension: 'associated',
    question: {
      en: 'Do you have any other symptoms along with the fever?',
      hi: 'बुखार के साथ इनमें से क्या परेशानी महसूस हो रही है?'
    },
    options: [
      { id: 'altered_sensorium_stiff_neck', labelEn: 'Severe headache + neck stiffness / confusion', labelHi: 'गंभीर सिरदर्द + गर्दन में अकड़न / बेहोशी', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'cough_breathlessness', labelEn: 'Productive cough or chest discomfort', labelHi: 'खांसी, बलगम या सांस लेने में दिक्कत', icon: 'Wind' },
      { id: 'burning_urination', labelEn: 'Burning sensation or pain while urinating', labelHi: 'पेशाब में जलन या पेट के निचले हिस्से में दर्द', icon: 'Flame' },
      { id: 'bodyache_weakness', labelEn: 'Severe joint & muscle ache (like Dengue)', labelHi: 'हड्डियों और जोड़ों में तेज दर्द (डेंगू जैसा)', icon: 'Activity' }
    ]
  },
  {
    dimension: 'exacerbating',
    question: {
      en: 'Does the fever come down with medication?',
      hi: 'दवाई (जैसे पैरासिटामोल) लेने पर क्या बुखार उतरता है?'
    },
    options: [
      { id: 'unresponsive_meds', labelEn: 'Does NOT come down even with medicine', labelHi: 'दवाई लेने पर भी बुखार बिल्कुल नहीं उतरता', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'temporary_relief', labelEn: 'Comes down for 3-4 hours then returns', labelHi: 'दवाई से 3-4 घंटे उतरता है, फिर चढ़ जाता है', icon: 'Clock' },
      { id: 'mild_sweating', labelEn: 'Drops completely with sweating', labelHi: 'पसीना आकर बुखार पूरी तरह उतर जाता है', icon: 'CheckCircle2' }
    ]
  },
  {
    dimension: 'severity',
    question: {
      en: 'How would you rate the intensity and weakness?',
      hi: 'बुखार की तीव्रता और कमजोरी कितनी ज्यादा है?'
    },
    options: [
      { id: 'severe_prostration', labelEn: 'Extreme weakness, unable to stand or walk', labelHi: 'बहुत अधिक कमजोरी, बिस्तर से उठना भी मुश्किल', icon: 'AlertTriangle', isRedFlag: true },
      { id: 'moderate_fatigue', labelEn: 'Moderate weakness, able to walk slowly', labelHi: 'मध्यम कमजोरी, धीरे-धीरे चल पा रहे हैं', icon: 'Activity' },
      { id: 'mild_feverish', labelEn: 'Mild discomfort, doing normal chores', labelHi: 'हल्का बुखार, सामान्य काम कर पा रहे हैं', icon: 'CheckCircle2' }
    ]
  }
];
