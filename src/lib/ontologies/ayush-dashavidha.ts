export interface DashavidhaStep {
  id: string;
  dimension: string;
  dimensionHindi: string;
  question: {
    en: string;
    hi: string;
  };
  options: Array<{
    id: string;
    labelEn: string;
    labelHi: string;
    descriptionEn: string;
    descriptionHi: string;
    icon: string;
  }>;
}

export const DASHAVIDHA_PARIKSHA_STEPS: DashavidhaStep[] = [
  // 1. PRAKRITI (Body Constitution)
  {
    id: 'prakriti',
    dimension: '1. Prakriti (Body Constitution)',
    dimensionHindi: '१. प्रकृति (शारीरिक प्रकृति)',
    question: {
      en: 'What is your natural bodily tendency and climate sensitivity?',
      hi: 'आपकी स्वाभाविक शारीरिक प्रवृत्ति और मौसम की संवेदनशीलता कैसी है?'
    },
    options: [
      {
        id: 'vata',
        labelEn: 'Vata Dominant',
        labelHi: 'वात प्रधान',
        descriptionEn: 'Dry skin, light build, intolerant to cold, quick movements',
        descriptionHi: 'रूखी त्वचा, दुबला शरीर, ठंड सहन न होना, चंचल स्वभाव',
        icon: 'Wind'
      },
      {
        id: 'pitta',
        labelEn: 'Pitta Dominant',
        labelHi: 'पित्त प्रधान',
        descriptionEn: 'Warm body, sharp appetite/thirst, intolerant to heat, prone to acidity',
        descriptionHi: 'गर्म शरीर, तेज भूख-प्यास, गर्मी बर्दाश्त न होना, एसिडिटी',
        icon: 'Flame'
      },
      {
        id: 'kapha',
        labelEn: 'Kapha Dominant',
        labelHi: 'कफ प्रधान',
        descriptionEn: 'Heavy/sturdy build, calm mind, slow digestion, oily/smooth skin',
        descriptionHi: 'मजबूत शरीर, शांत स्वभाव, मंद पाचन, स्निग्ध त्वचा',
        icon: 'Droplets'
      }
    ]
  },
  // 2. VIKRITI (Current Imbalance)
  {
    id: 'vikriti',
    dimension: '2. Vikriti (Current Dosha Imbalance)',
    dimensionHindi: '२. विकृति (दोष असंतुलन)',
    question: {
      en: 'Which active imbalance or aggravated symptom are you currently experiencing?',
      hi: 'वर्तमान में आपको कौन सा मुख्य दोष असंतुलन या कष्ट महसूस हो रहा है?'
    },
    options: [
      {
        id: 'vata_vikriti',
        labelEn: 'Vata Aggravation (Joint pain, gas, dryness, anxiety)',
        labelHi: 'वात प्रकोप (जोड़ों में दर्द, गैस, अनिद्रा, सूखापन)',
        descriptionEn: 'Pain in joints, constipation, dry skin, restlessness',
        descriptionHi: 'शरीर में जकड़न, वायु विकार, बेचैनी',
        icon: 'Wind'
      },
      {
        id: 'pitta_vikriti',
        labelEn: 'Pitta Aggravation (Acidity, burning, inflammation, fever)',
        labelHi: 'पित्त प्रकोप (एसिडिटी, सीने में जलन, अत्यधिक गर्मी)',
        descriptionEn: 'Hyperacidity, heartburn, rash, angry outbursts',
        descriptionHi: 'खट्टी डकार, पेट में जलन, त्वचा पर लाल चकत्ते',
        icon: 'Flame'
      },
      {
        id: 'kapha_vikriti',
        labelEn: 'Kapha Aggravation (Congestion, heaviness, sluggishness)',
        labelHi: 'कफ प्रकोप (भारीपन, कफ/बलगम, सुस्ती, वजन बढ़ना)',
        descriptionEn: 'Chest congestion, sluggish metabolism, water retention',
        descriptionHi: 'छाती में जकड़न, मंद पाचन, आलस्य',
        icon: 'Droplets'
      }
    ]
  },
  // 3. SARA (Tissue Excellence)
  {
    id: 'sara',
    dimension: '3. Sara (Tissue Essence / Vitality)',
    dimensionHindi: '३. सार (धातु सारता व ओज)',
    question: {
      en: 'How is your general physical stamina, complexion, and bone strength?',
      hi: 'आपकी शारीरिक चमक, हड्डियों की मजबूती और धातुओं का बल कैसा है?'
    },
    options: [
      {
        id: 'pravara_sara',
        labelEn: 'Pravara Sara (Superior Vitality)',
        labelHi: 'प्रवर सार (उत्तम धातु बल)',
        descriptionEn: 'Lustrous skin, strong bones, high resistance to disease',
        descriptionHi: 'मजबूत अस्थियां, तेजस्विता, उच्च रोग प्रतिरोधक क्षमता',
        icon: 'ShieldCheck'
      },
      {
        id: 'madhyama_sara',
        labelEn: 'Madhyama Sara (Moderate Vitality)',
        labelHi: 'मध्यम सार (सामान्य बल)',
        descriptionEn: 'Average stamina and standard physical resistance',
        descriptionHi: 'सामान्य शारीरिक क्षमता व मध्यम ओज',
        icon: 'CheckCircle2'
      },
      {
        id: 'avara_sara',
        labelEn: 'Avara Sara (Low Vitality / Debility)',
        labelHi: 'अवर सार (कमजोर धातु बल)',
        descriptionEn: 'Easily fatigued, brittle nails/hair, prone to frequent illness',
        descriptionHi: 'जल्दी थकान, दुर्बलता, बार-बार बीमार पड़ना',
        icon: 'AlertCircle'
      }
    ]
  },
  // 4. SAMHANANA (Body Compactness)
  {
    id: 'samhanana',
    dimension: '4. Samhanana (Body Compactness / Build)',
    dimensionHindi: '४. संहनन (शारीरिक सुगठन)',
    question: {
      en: 'How is your skeletal and muscular body frame?',
      hi: 'आपका शारीरिक ढांचा और मांसपेशियों का गठन कैसा है?'
    },
    options: [
      {
        id: 'susamhata',
        labelEn: 'Su-samhata (Well-knit / Compact)',
        labelHi: 'सुसंहत (सुगठित शरीर)',
        descriptionEn: 'Symmetrical, compact muscles and well-aligned joints',
        descriptionHi: 'मजबूत मांसपेशियां व संतुलित जोड़',
        icon: 'Activity'
      },
      {
        id: 'madhyama_samhanana',
        labelEn: 'Madhyama (Medium Build)',
        labelHi: 'मध्यम संहनन (सामान्य ढांचा)',
        descriptionEn: 'Proportionate moderate physical build',
        descriptionHi: 'सामान्य शारीरिक आकार',
        icon: 'CheckCircle2'
      },
      {
        id: 'asusemhata',
        labelEn: 'Hina / Asamhata (Loose / Frail)',
        labelHi: 'हीन संहनन (शिथिल शरीर)',
        descriptionEn: 'Loose musculature, prominent veins, frail joints',
        descriptionHi: 'ढीली मांसपेशियां, कमजोर जोड़',
        icon: 'AlertCircle'
      }
    ]
  },
  // 5. PRAMANA (Anthropometric Proportions)
  {
    id: 'pramana',
    dimension: '5. Pramana (Proportions / BMI)',
    dimensionHindi: '५. प्रमाण (शारीरिक माप व अनुपात)',
    question: {
      en: 'How do you describe your height-to-weight proportion?',
      hi: 'आपकी लंबाई और वजन का अनुपात कैसा है?'
    },
    options: [
      {
        id: 'yatha_pramana',
        labelEn: 'Yatha Pramana (Ideal Proportion / Normal BMI)',
        labelHi: 'यथा प्रमाण (संतुलित माप)',
        descriptionEn: 'BMI 18.5 - 24.9 kg/m²',
        descriptionHi: 'संतुलित शारीरिक वजन व लंबाई',
        icon: 'CheckCircle2'
      },
      {
        id: 'ati_sthula',
        labelEn: 'Ati-Sthula (Overweight / Obese)',
        labelHi: 'अति स्थूल (अधिक वजन)',
        descriptionEn: 'BMI > 25 kg/m² with excess adipose tissue',
        descriptionHi: 'वजन अधिक होना, मेद वृद्धि',
        icon: 'AlertCircle'
      },
      {
        id: 'ati_krisha',
        labelEn: 'Ati-Krisha (Underweight / Emaciated)',
        labelHi: 'अति कृश (कम वजन)',
        descriptionEn: 'BMI < 18.5 kg/m² with reduced muscle mass',
        descriptionHi: 'दुबलापन, कमजोरी',
        icon: 'Wind'
      }
    ]
  },
  // 6. SATMYA (Habituation & Diet Adaptability)
  {
    id: 'satmya',
    dimension: '6. Satmya (Dietary Habituation & Allergies)',
    dimensionHindi: '६. सात्म्य (अनुकूलता व एलर्जी)',
    question: {
      en: 'What foods or tastes are naturally wholesome to your system?',
      hi: 'कौन से आहार रस आपके शरीर को अनुकूल (सूट) बैठते हैं?'
    },
    options: [
      {
        id: 'sarva_rasa_satmya',
        labelEn: 'Sarva Rasa Satmya (All 6 Tastes Wholesome)',
        labelHi: 'सर्वरस सात्म्य (सभी रस अनुकूल)',
        descriptionEn: 'Can digest sweet, sour, salty, bitter, pungent, astringent foods',
        descriptionHi: 'सभी प्रकार के भोजन बिना किसी एलर्जी के पचते हैं',
        icon: 'CheckCircle2'
      },
      {
        id: 'eka_rasa_satmya',
        labelEn: 'Limited Rasa Satmya (Specific Food Sensitivities)',
        labelHi: 'सीमित सात्म्य (विशेष खाद्य एलर्जी)',
        descriptionEn: 'Prone to allergic reactions with dairy, gluten, or spices',
        descriptionHi: 'दूध, खटाई या मिर्च-मसाले से तुरंत परेशानी होना',
        icon: 'AlertCircle'
      }
    ]
  },
  // 7. SATTVA (Mental Strength)
  {
    id: 'sattva',
    dimension: '7. Sattva (Mental Resilience)',
    dimensionHindi: '७. सत्त्व (मानसिक बल व तनाव सहनशक्ति)',
    question: {
      en: 'How do you cope with pain, mental stress, and anxiety?',
      hi: 'शारीरिक कष्ट, तनाव या घबराहट में आपका मनोबल कैसा रहता है?'
    },
    options: [
      {
        id: 'pravara_sattva',
        labelEn: 'Pravara (High Mental Strength)',
        labelHi: 'प्रवर सत्त्व (उच्च आत्मबल)',
        descriptionEn: 'Endures pain calmly, highly resilient under stress',
        descriptionHi: 'कष्ट व बीमारी में भी धैर्यवान, उच्च सहनशक्ति',
        icon: 'ShieldCheck'
      },
      {
        id: 'madhyama_sattva',
        labelEn: 'Madhyama (Moderate Resilience)',
        labelHi: 'मध्यम सत्त्व (सामान्य आत्मबल)',
        descriptionEn: 'Copes reasonably well with reassurance from others',
        descriptionHi: 'दूसरों के समझाने पर धैर्य रखना',
        icon: 'CheckCircle2'
      },
      {
        id: 'avara_sattva',
        labelEn: 'Avara (Low Resilience / High Anxiety)',
        labelHi: 'अवर सत्त्व (कमजोर मनोबल)',
        descriptionEn: 'Cannot tolerate even mild discomfort, high panic tendency',
        descriptionHi: 'थोड़े कष्ट में भी अत्यधिक घबराहट व बेचैनी',
        icon: 'AlertCircle'
      }
    ]
  },
  // 8. AHARA SHAKTI & AGNI (Digestive & Ingestion Capacity)
  {
    id: 'ahara_agni',
    dimension: '8. Ahara Shakti & Agni (Appetite & Digestion)',
    dimensionHindi: '८. आहार शक्ति व अग्नि (पाचन क्षमता)',
    question: {
      en: 'How is your appetite, food intake capacity, and digestion?',
      hi: 'आपकी भूख, खाने की मात्रा और पाचन शक्ति कैसी रहती है?'
    },
    options: [
      {
        id: 'sama_agni',
        labelEn: 'Sama Agni (Balanced Digestion)',
        labelHi: 'सम अग्नि (संतुलित पाचन)',
        descriptionEn: 'Healthy timely hunger, effortless digestion',
        descriptionHi: 'समय पर सही भूख व बिना तकलीफ के पाचन',
        icon: 'Activity'
      },
      {
        id: 'tikshna_agni',
        labelEn: 'Tikshna Agni (Hyperactive / Acidic)',
        labelHi: 'तीक्ष्ण अग्नि (अत्यधिक भूख/जलन)',
        descriptionEn: 'Intense hunger, burning reflux, rapid digestion',
        descriptionHi: 'तेज भूख, खट्टी डकार, सीने में जलन',
        icon: 'Flame'
      },
      {
        id: 'manda_agni',
        labelEn: 'Manda Agni (Sluggish / Heavy)',
        labelHi: 'मंद अग्नि (सुस्त पाचन)',
        descriptionEn: 'Poor appetite, heavy fullness after light meals',
        descriptionHi: 'भूख न लगना, पेट में भारीपन',
        icon: 'Clock'
      }
    ]
  },
  // 9. VYAYAMA SHAKTI (Physical Endurance)
  {
    id: 'vyayama_shakti',
    dimension: '9. Vyayama Shakti (Physical Endurance)',
    dimensionHindi: '९. व्यायाम शक्ति (शारीरिक कार्यक्षमता)',
    question: {
      en: 'How is your capacity for physical labor, walking, and exercise?',
      hi: 'पैदल चलने, सीढ़ियां चढ़ने और शारीरिक श्रम करने की क्षमता कैसी है?'
    },
    options: [
      {
        id: 'pravara_vyayama',
        labelEn: 'Pravara (High Endurance)',
        labelHi: 'प्रवर व्यायाम शक्ति (उत्तम क्षमता)',
        descriptionEn: 'Can perform heavy physical work without early dyspnoea',
        descriptionHi: 'बिना सांस फूले कठिन परिश्रम कर सकना',
        icon: 'Activity'
      },
      {
        id: 'madhyama_vyayama',
        labelEn: 'Madhyama (Moderate Endurance)',
        labelHi: 'मध्यम व्यायाम शक्ति (सामान्य)',
        descriptionEn: 'Tolerates moderate walking (1-2 km) normally',
        descriptionHi: 'सामान्य कामकाज व चलना आसानी से होना',
        icon: 'CheckCircle2'
      },
      {
        id: 'avara_vyayama',
        labelEn: 'Avara (Poor Endurance / Early Dyspnoea)',
        labelHi: 'अवर व्यायाम शक्ति (जल्दी सांस फूलना)',
        descriptionEn: 'Gets breathless or exhausted on climbing few stairs',
        descriptionHi: 'थोड़ा चलने या सीढ़ी चढ़ने पर ही अत्यधिक थकान व सांस फूलना',
        icon: 'AlertCircle'
      }
    ]
  },
  // 10. VAYA (Age & Stage of Life)
  {
    id: 'vaya',
    dimension: '10. Vaya (Chronological Stage of Life)',
    dimensionHindi: '१०. वय (आयु अवस्था)',
    question: {
      en: 'Which stage of life corresponds to your clinical age group?',
      hi: 'आप किस आयु वर्ग में आते हैं?'
    },
    options: [
      {
        id: 'bala_vaya',
        labelEn: 'Bala Vaya (Child / Adolescent < 16y)',
        labelHi: 'बाल्यावस्था (< १६ वर्ष)',
        descriptionEn: 'Kapha-predominant growth phase',
        descriptionHi: 'कफ प्रधान वृद्धि काल',
        icon: 'UserCheck'
      },
      {
        id: 'madhyama_vaya',
        labelEn: 'Madhyama Vaya (Adult 16 - 60y)',
        labelHi: 'युवा / मध्यमावस्था (१६ - ६० वर्ष)',
        descriptionEn: 'Pitta-predominant active productive phase',
        descriptionHi: 'पित्त प्रधान क्रियाशील आयु',
        icon: 'CheckCircle2'
      },
      {
        id: 'vriddha_vaya',
        labelEn: 'Vriddha Vaya (Elderly > 60y)',
        labelHi: 'वृद्धावस्था (> ६० वर्ष)',
        descriptionEn: 'Vata-predominant degenerative phase requiring rasayana support',
        descriptionHi: 'वात प्रधान रसायन पोषण योग्य आयु',
        icon: 'ShieldCheck'
      }
    ]
  }
];
