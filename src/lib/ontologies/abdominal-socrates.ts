import { SocratesStep } from "./allopathy-socrates";

export const SOCRATES_ABDOMINAL: SocratesStep[] = [
  {
    dimension: 'site',
    question: {
      en: 'Where exactly in your abdomen is the pain located?',
      hi: 'पेट में दर्द बिल्कुल किस जगह पर महसूस हो रहा है?'
    },
    options: [
      { id: 'epigastric_upper', labelEn: 'Upper central abdomen (Stomach / Acid area)', labelHi: 'पेट के ऊपरी बीच वाले हिस्से में (छाती के नीचे)', icon: 'Flame' },
      { id: 'right_lower_appendix', labelEn: 'Right lower side (Appendix region)', labelHi: 'पेट के निचले दाहिने हिस्से में (अपेंडिक्स क्षेत्र)', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'right_upper_liver', labelEn: 'Right upper side (Liver / Gallbladder area)', labelHi: 'पेट के ऊपरी दाहिने हिस्से में (पसली के नीचे)', icon: 'Activity' },
      { id: 'periumbilical_all', labelEn: 'Around navel or spread all over', labelHi: 'नाभि के चारों तरफ या पूरे पेट में', icon: 'Zap' }
    ]
  },
  {
    dimension: 'onset',
    question: {
      en: 'When and how did the abdominal pain begin?',
      hi: 'यह पेट दर्द कब और कैसे शुरू हुआ?'
    },
    options: [
      { id: 'sudden_severe_tear', labelEn: 'Suddenly severe within minutes (Tearing)', labelHi: 'अचानक तेज असहनीय दर्द (कुछ ही मिनटों में)', icon: 'Clock', isRedFlag: true },
      { id: 'after_fatty_food', labelEn: 'After a heavy, spicy or oily meal', labelHi: 'भारी, तला-भुना या मसालेदार खाना खाने के बाद', icon: 'Flame' },
      { id: 'gradual_dull_days', labelEn: 'Slowly building over several days/weeks', labelHi: 'कई दिनों से धीरे-धीरे बना हुआ दर्द', icon: 'Calendar' }
    ]
  },
  {
    dimension: 'character',
    question: {
      en: 'How would you describe the nature of this stomach pain?',
      hi: 'दर्द किस तरह का है — मरोड़, जलन, या तेज चुभन?'
    },
    options: [
      { id: 'colicky_spasms', labelEn: 'Colicky spasms (Comes in sharp waves)', labelHi: 'मरोड़ उठना (लहरों की तरह बार-बार तेज होना)', icon: 'Zap' },
      { id: 'burning_gnawing', labelEn: 'Burning / Gnawing sensation (Acidic)', labelHi: 'तेज जलन या भूख जैसी खाली पेट की चुभन', icon: 'Flame' },
      { id: 'rigid_boardlike', labelEn: 'Severe constant pain with tight rigid belly', labelHi: 'पेट पत्थर जैसा सख्त और छूने पर बहुत तेज दर्द', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'dull_heavy', labelEn: 'Dull continuous heaviness / bloating', labelHi: 'हल्का लगातार भारीपन या पेट फूलना', icon: 'Activity' }
    ]
  },
  {
    dimension: 'radiation',
    question: {
      en: 'Does the pain spread to your back, shoulder, or groin?',
      hi: 'क्या यह दर्द पीठ, कंधे या कमर के निचले हिस्से में जाता है?'
    },
    options: [
      { id: 'radiates_to_back', labelEn: 'Spreads straight through to the back (Pancreas/Aorta)', labelHi: 'सीधे पीठ की तरफ पीछे जाता है', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'radiates_right_shoulder', labelEn: 'Spreads up to right shoulder blade', labelHi: 'दाहिने कंधे की तरफ ऊपर फैलता है', icon: 'TrendingUp' },
      { id: 'radiates_to_groin', labelEn: 'Shoots downwards into groin / urinary area (Stone)', labelHi: 'नीचे पेशाब के रास्ते की तरफ जाता है (पथरी)', icon: 'ArrowRight' },
      { id: 'localized_no_radiation', labelEn: 'Stays in one spot without spreading', labelHi: 'एक ही जगह रहता है, कहीं फैलता नहीं', icon: 'CheckCircle2' }
    ]
  },
  {
    dimension: 'associated',
    question: {
      en: 'Do you have vomiting, fever, or blood in stool?',
      hi: 'क्या उल्टी, बुखार, या दस्त/खून की शिकायत है?'
    },
    options: [
      { id: 'blood_vomit_black_stool', labelEn: 'Blood in vomit or dark black stool (Bleeding)', labelHi: 'उल्टी में खून या गहरा काला मल आना', icon: 'ShieldAlert', isRedFlag: true },
      { id: 'persistent_vomiting', labelEn: 'Frequent vomiting, cannot keep fluids down', labelHi: 'लगातार उल्टी, पानी भी नहीं रुक पा रहा', icon: 'AlertTriangle' },
      { id: 'constipation_gas_stopped', labelEn: 'No gas or stool passing for 24+ hours', labelHi: '24 घंटे से गैस या पेट साफ बिल्कुल बंद है', icon: 'Clock' },
      { id: 'mild_nausea_loose', labelEn: 'Mild nausea or loose stools only', labelHi: 'सिर्फ हल्का जी मिचलाना या हल्के दस्त', icon: 'Activity' }
    ]
  }
];
