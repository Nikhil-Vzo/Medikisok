export interface QuestionTranslation {
  title: string;
  subtitle: string;
  ttsAudioText: string;
  choices: Record<string, string>;
}

export interface KioskStepStrings {
  identifyTitle: string;
  identifySub: string;
  identifyTts: string;
  consentTitle: string;
  consentSub: string;
  consentTts: string;
  modeTitle: string;
  modeSub: string;
  modeTts: string;
  scanTitle: string;
  scanSub: string;
  scanTts: string;
  confirmTitle: string;
  confirmSub: string;
  confirmTts: string;
}

export const KIOSK_STEP_TRANSLATIONS: Record<string, KioskStepStrings> = {
  hi: {
    identifyTitle: "अपना आभा आईडी (ABHA ID) या पहचान दर्ज करें",
    identifySub: "14 अंकों का आयुष्मान भारत स्वास्थ्य खाता नंबर दर्ज करें या क्यूआर कोड स्कैन करें।",
    identifyTts: "कृपया अपना चौदह अंकों का आभा नंबर दर्ज करें या कार्ड स्कैन करें।",
    consentTitle: "डेटा सुरक्षा और डिजिटल सहमति (DPDP Act 2023)",
    consentSub: "आपकी स्वास्थ्य जानकारी और पुराने पर्चे सुरक्षित रूप से ओपीडी डॉक्टर को भेजे जाएंगे।",
    consentTts: "आपकी स्वास्थ्य जानकारी और पुराने पर्चों को डॉक्टर को दिखाने के लिए सहमति दें। यह जानकारी पूरी तरह सुरक्षित रहेगी।",
    modeTitle: "कृपया ओपीडी विभाग चुनें",
    modeSub: "अपनी जरूरत के अनुसार एलोपैथी या आयुर्वेदिक ओपीडी का चयन करें।",
    modeTts: "कृपया बताएं कि आप सामान्य एलोपैथी डॉक्टर के पास जा रहे हैं या आयुर्वेदिक ओपीडी विभाग में?",
    scanTitle: "पुराने पर्चे और लैब रिपोर्ट स्कैन करें",
    scanSub: "अपने पुराने मेडिकल पर्चे कैमरे के सामने रखें या फाइल अपलोड करें।",
    scanTts: "कृपया अपने पुराने दवाई के पर्चे या लैब रिपोर्ट कैमरे के सामने दिखाएं या अपलोड करें।",
    confirmTitle: "आपकी केस समरी तैयार है",
    confirmSub: "मरीज की पूरी जानकारी डिजिटल रूप से डॉक्टर के पास भेज दी गई है।",
    confirmTts: "आपकी केस समरी तैयार है और डॉक्टर के कंप्यूटर पर भेज दी गई है। कृपया ओपीडी रूम नंबर तीन में जाएं।"
  },
  en: {
    identifyTitle: "Enter your ABHA ID or Patient Identity",
    identifySub: "Enter your 14-digit Ayushman Bharat Health Account ID or scan your card QR.",
    identifyTts: "Please enter your 14-digit ABHA number or scan your card to proceed.",
    consentTitle: "Data Privacy & Digital Consent (DPDP Act 2023)",
    consentSub: "Your medical history and scanned prescriptions will be securely transmitted to your OPD physician.",
    consentTts: "Please grant consent to securely share your health records and intake history with your OPD doctor.",
    modeTitle: "Select Consultation Department",
    modeSub: "Choose between General Allopathy OPD or Ayurvedic Case-Taking.",
    modeTts: "Please choose whether you are visiting General Allopathy OPD or Ayurveda Department.",
    scanTitle: "Scan Prior Prescriptions & Lab Reports",
    scanSub: "Place your physical prescriptions in front of the scanner camera or upload files.",
    scanTts: "Please hold your physical prescription or lab report in front of the camera or upload it.",
    confirmTitle: "Your Case Summary is Ready",
    confirmSub: "Structured clinical package has been transmitted to the physician's desk.",
    confirmTts: "Your intake summary is ready and delivered to your doctor. Please proceed to OPD Room 3."
  },
  bn: {
    identifyTitle: "আপনার আভা আইডি (ABHA ID) বা পরিচয় প্রদান করুন",
    identifySub: "১৪ সংখ্যার আয়ুষ্মান ভারত স্বাস্থ্য অ্যাকাউন্ট নম্বর লিখুন বা কিউআর কোড স্ক্যান করুন।",
    identifyTts: "অনুগ্রহ করে আপনার চৌদ্দ সংখ্যার আভা নম্বর লিখুন অথবা কার্ড স্ক্যান করুন।",
    consentTitle: "তথ্য সুরক্ষা ও ডিজিটাল সম্মতি (DPDP Act 2023)",
    consentSub: "আপনার চিকিৎসার ইতিহাস নিরাপদে ওপিডি চিকিৎসকের কাছে পাঠানো হবে।",
    consentTts: "ডাক্তারকে আপনার স্বাস্থ্য তথ্য দেখানোর জন্য সম্মতি প্রদান করুন। এই তথ্য সম্পূর্ণ গোপনীয় থাকবে।",
    modeTitle: "ওপিডি বিভাগ নির্বাচন করুন",
    modeSub: "অ্যালোপ্যাথি বা আয়ুর্বেদিক ওপিডি বিভাগের মধ্যে বেছে নিন।",
    modeTts: "আপনি সাধারণ অ্যালোপ্যাথি নাকি আয়ুর্বেদিক ওপিডিতে যেতে চান তা বেছে নিন।",
    scanTitle: "পুরোনো প্রেসক্রিপশন ও রিপোর্ট স্ক্যান করুন",
    scanSub: "ক্যামেরার সামনে পুরোনো প্রেসক্রিপশন দেখান বা ফাইল আপলোড করুন।",
    scanTts: "অনুগ্রহ করে আপনার পুরোনো প্রেসক্রিপশন ক্যামেরার সামনে দেখান।",
    confirmTitle: "আপনার কেস সামারি প্রস্তুত",
    confirmSub: "আপনার সমস্ত তথ্য নিরাপদে চিকিৎসকের কম্পিউটারে পাঠানো হয়েছে।",
    confirmTts: "আপনার কেস সামারি প্রস্তুত। অনুগ্রহ করে ওপিডি রুম নম্বর তিনে যান।"
  },
  ta: {
    identifyTitle: "உங்கள் ஆபா ஐடி (ABHA ID) அல்லது அடையாளத்தை உள்ளிடவும்",
    identifySub: "14 இலக்க ஆயுஷ்மான் பாரத் சுகாதார கணக்கு எண்ணை உள்ளிடவும் அல்லது QR ஸ்கேன் செய்யவும்.",
    identifyTts: "தயவுசெய்து உங்கள் 14 இலக்க ஆபா எண்ணை உள்ளிடவும் அல்லது கார்டை ஸ்கேன் செய்யவும்.",
    consentTitle: "தரவு பாதுகாப்பு மற்றும் டிஜிட்டல் ஒப்புதல் (DPDP சட்டம் 2023)",
    consentSub: "உங்கள் மருத்துவ விவரங்கள் பாதுகாப்பாக மருத்துவருக்கு மாற்றப்படும்.",
    consentTts: "உங்கள் மருத்துவ விவரங்களை மருத்துவருக்கு காட்ட ஒப்புதல் அளிக்கவும்.",
    modeTitle: "OPD பிரிவைத் தேர்ந்தெடுக்கவும்",
    modeSub: "அலோபதி அல்லது ஆயுர்வேத பிரிவைத் தேர்ந்தெடுக்கவும்.",
    modeTts: "அலோபதி அல்லது ஆயுர்வேத மருத்துவப் பிரிவைத் தேர்ந்தெடுக்கவும்.",
    scanTitle: "பழைய மருந்துச் சீட்டுகளை ஸ்கேன் செய்யவும்",
    scanSub: "கேமராவின் முன் பழைய மருந்துச் சீட்டைக் காட்டவும்.",
    scanTts: "உங்கள் பழைய மருந்துச் சீட்டை கேமராவின் முன் காட்டவும்.",
    confirmTitle: "உங்கள் விவரங்கள் தயாராக உள்ளன",
    confirmSub: "மருத்துவருக்கு விவரங்கள் வெற்றிகரமாக அனுப்பப்பட்டன.",
    confirmTts: "உங்கள் விவரங்கள் மருத்துவருக்கு அனுப்பப்பட்டன. அறை எண் 3க்கு செல்லவும்."
  },
  te: {
    identifyTitle: "మీ ఆభా ఐడీ (ABHA ID) లేదా గుర్తింపును నమోదు చేయండి",
    identifySub: "14 అంకెల ఆయుష్మాన్ భారత్ హెల్త్ ఖాతా నంబర్‌ను నమోదు చేయండి లేదా స్కాన్ చేయండి.",
    identifyTts: "దయచేసి మీ 14 అంకెల ఆభా నంబర్‌ను నమోదు చేయండి లేదా కార్డును స్కాన్ చేయండి.",
    consentTitle: "డేటా భద్రత మరియు డిజిటల్ సమ్మతి (DPDP Act 2023)",
    consentSub: "మీ వైద్య వివరాలు సురక్షితంగా డాక్టర్‌కు చేరవేయబడతాయి.",
    consentTts: "మీ ఆరోగ్య వివరాలను డాక్టర్‌తో పంచుకోవడానికి సమ్మతి తెలపండి.",
    modeTitle: "దయచేసి OPD విభాగాన్ని ఎంచుకోండి",
    modeSub: "అలోపతి లేదా ఆయుర్వేద విభాగాన్ని ఎంచుకోండి.",
    modeTts: "మీరు అలోపతి లేదా ఆయుర్వేద వైద్యుడి వద్దకు వెళ్లాలనుకుంటున్నారా ఎంచుకోండి.",
    scanTitle: "పాత ప్రిస్క్రిప్షన్లు & ల్యాబ్ రిపోర్టులను స్కాన్ చేయండి",
    scanSub: "కెమెరా ముందు పాత ప్రిస్క్రిప్షన్‌ను ఉంచండి లేదా అప్‌లోడ్ చేయండి.",
    scanTts: "దయచేసి మీ పాత ప్రిస్క్రిప్షన్‌ను కెమెరా ముందు ఉంచండి.",
    confirmTitle: "మీ కేస్ సమ్మరీ సిద్ధమైంది",
    confirmSub: "మీ వివరాలు విజయవంతంగా డాక్టర్‌కు పంపబడ్డాయి.",
    confirmTts: "మీ వివరాలు డాక్టర్‌కు పంపబడ్డాయి. దయచేసి రూమ్ నంబర్ 3కి వెళ్లండి."
  },
  mr: {
    identifyTitle: "तुमचा आभा आयडी (ABHA ID) किंवा ओळख प्रविष्ट करा",
    identifySub: "14 अंकी आयुष्मान भारत आरोग्य खाते क्रमांक प्रविष्ट करा किंवा स्कॅन करा.",
    identifyTts: "कृपया तुमचा चौदा अंकी आभा क्रमांक प्रविष्ट करा किंवा कार्ड स्कॅन करा.",
    consentTitle: "माहिती सुरक्षा आणि डिजिटल संमती (DPDP Act 2023)",
    consentSub: "तुमची वैद्यकीय माहिती सुरक्षितपणे डॉक्टरांकडे पाठवली जाईल.",
    consentTts: "तुमची आरोग्य माहिती डॉक्टरांना दाखवण्यासाठी कृपया संमती द्या.",
    modeTitle: "कृपया ओपीडी विभाग निवडा",
    modeSub: "अ‍ॅलोपॅथी किंवा आयुर्वेदिक ओपीडी विभागाची निवड करा.",
    modeTts: "कृपया सांगा आपण अ‍ॅलोपॅथी की आयुर्वेदिक विभागात जात आहात?",
    scanTitle: "जुने प्रिस्क्रिप्शन व लॅब रिपोर्ट स्कॅन करा",
    scanSub: "कॅमेऱ्यासमोर जुने प्रिस्क्रिप्शन दाखवा किंवा फाईल अपलोड करा.",
    scanTts: "कृपया तुमचे जुने प्रिस्क्रिप्शन कॅमेऱ्यासमोर दाखवा.",
    confirmTitle: "तुमची केस समरी तयार आहे",
    confirmSub: "सर्व माहिती डॉक्टरांच्या संगणकावर पाठवली गेली आहे.",
    confirmTts: "तुमची माहिती डॉक्टरांकडे पाठवली आहे. कृपया ओपीडी रूम नंबर तीनमध्ये जा."
  },
  gu: {
    identifyTitle: "તમારો આભા આઈડી (ABHA ID) દાખલ કરો",
    identifySub: "૧૪ અંકનો આયુષ્માન ભારત હેલ્થ એકાઉન્ટ નંબર દાખલ કરો અથવા સ્કેન કરો.",
    identifyTts: "કૃપા કરીને તમારો ૧૪ અંકનો આભા નંબર દાખલ કરો અથવા કાર્ડ સ્કેન કરો.",
    consentTitle: "ડેટા સુરક્ષા અને સંમતિ (DPDP Act 2023)",
    consentSub: "તમારી મેડિકલ વિગતો ડૉક્ટરને સુરક્ષિત રીતે મોકલવામાં આવશે.",
    consentTts: "તમારી સ્વાસ્થ્ય વિગતો ડૉક્ટર સાથે શેર કરવા માટે સંમતિ આપો.",
    modeTitle: "કૃપા કરીને OPD વિભાગ પસંદ કરો",
    modeSub: "એલોપેથી અથવા આયુર્વેદિક વિભાગ પસંદ કરો.",
    modeTts: "કૃપા કરીને એલોપેથી અથવા આયુર્વેદિક વિભાગ પસંદ કરો.",
    scanTitle: "જૂના પ્રિસ્ક્રિપ્શન અને રિપોર્ટ સ્કેન કરો",
    scanSub: "કૅમેરા સામે જૂનું પ્રિસ્ક્રિપ્શન બતાવો અથવા અપલોડ કરો.",
    scanTts: "કૃપા કરીને તમારું જૂનું પ્રિસ્ક્રિપ્શન કૅમેરા સામે બતાવો.",
    confirmTitle: "તમારી કેસ સમરી તૈયાર છે",
    confirmSub: "તમામ વિગતો ડૉક્ટરના કમ્પ્યુટર પર મોકલી દેવામાં આવી છે.",
    confirmTts: "તમારી વિગતો ડૉક્ટરને મોકલી દેવામાં આવી છે. રૂમ નંબર ૩ માં જાઓ."
  },
  kn: {
    identifyTitle: "ನಿಮ್ಮ ಆಭಾ ಐಡಿ (ABHA ID) ನಮೂದಿಸಿ",
    identifySub: "14 ಅಂಕಿಯ ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಆರೋಗ್ಯ ಖಾತೆ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    identifyTts: "ದಯವಿಟ್ಟು ನಿಮ್ಮ 14 ಅಂಕಿಯ ಆಭಾ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಕಾರ್ಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    consentTitle: "ಡೇಟಾ ಸುರಕ್ಷತೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಸಮ್ಮತಿ (DPDP Act 2023)",
    consentSub: "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವಿವರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.",
    consentTts: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ವೈದ್ಯರಿಗೆ ತೋರಿಸಲು ಸಮ್ಮತಿ ನೀಡಿ.",
    modeTitle: "ದಯವಿಟ್ಟು OPD ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    modeSub: "ಅಲೋಪತಿ ಅಥವಾ ಆಯುರ್ವೇದ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    modeTts: "ದಯವಿಟ್ಟು ಅಲೋಪತಿ ಅಥವಾ ಆಯುರ್ವೇದ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    scanTitle: "ಹಳೆಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    scanSub: "ಕ್ಯಾಮೆರಾದ ಮುಂದೆ ಹಳೆಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಇರಿಸಿ.",
    scanTts: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಳೆಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅನ್ನು ಕ್ಯಾಮೆರಾದ ಮುಂದೆ ತೋರಿಸಿ.",
    confirmTitle: "ನಿಮ್ಮ ವಿವರಗಳು ಸಿದ್ಧವಾಗಿವೆ",
    confirmSub: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರ ಕಂಪ್ಯೂಟರ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    confirmTts: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೋಣೆ ಸಂಖ್ಯೆ 3ಕ್ಕೆ ಹೋಗಿ."
  }
};

export const KIOSK_TRANSLATIONS: Record<string, Record<string, QuestionTranslation>> = {
  hi: {
    site: {
      title: "दर्द या तकलीफ किस जगह पर हो रही है?",
      subtitle: "छाती के किस हिस्से में दर्द है? नीचे दिए गए विकल्पों में से चुनें या बोलकर बताएं।",
      ttsAudioText: "दर्द या तकलीफ किस जगह पर हो रही है? कृपया छाती का हिस्सा चुनें या बोलकर बताएं।",
      choices: {
        substernal: "छाती के ठीक बीच में (Center of Chest)",
        left_sided: "बाईं तरफ (Left side of chest)",
        epigastric: "पेट के ऊपरी हिस्से में (Upper abdomen / Epigastric)",
        diffuse: "पूरी छाती में फैला हुआ (Diffuse / Whole chest)",
      },
    },
    onset: {
      title: "यह दर्द कब और कैसे शुरू हुआ?",
      subtitle: "कितने समय से है और शुरुआत अचानक हुई या धीरे-धीरे?",
      ttsAudioText: "यह दर्द कब और कैसे शुरू हुआ? शुरुआत अचानक हुई या धीरे-धीरे?",
      choices: {
        acute_sudden: "अचानक से तेज शुरू हुआ (Sudden onset < 1 hour)",
        gradual_today: "आज धीरे-धीरे बढ़ा (Gradual onset today)",
        intermittent_days: "पिछले 2-3 दिनों से बार-बार हो रहा है (2-3 days)",
        chronic_weeks: "कई हफ्तों से चल रहा है (Chronic / Weeks)",
      },
    },
    character: {
      title: "दर्द किस तरह का महसूस हो रहा है?",
      subtitle: "दर्द की प्रकृति कैसी है?",
      ttsAudioText: "दर्द किस तरह का महसूस हो रहा है? भारी दबाव है या जलन?",
      choices: {
        crushing: "भारी दबाव या जकड़न (Heavy pressure / Crushing)",
        burning: "तेज जलन या खट्टी डकार (Burning / Acidity sensation)",
        sharp_stabbing: "तीखा चुभने जैसा दर्द (Sharp / Stabbing)",
        dull_ache: "हल्का मीठा दर्द (Dull continuous ache)",
      },
    },
    radiation: {
      title: "क्या दर्द शरीर के किसी और हिस्से में जा रहा है?",
      subtitle: "दर्द कहाँ-कहाँ फैल रहा है?",
      ttsAudioText: "क्या दर्द शरीर के किसी और हिस्से में फैल रहा है?",
      choices: {
        left_arm_jaw: "बाएं हाथ, गले और जबड़े में (Left arm, jaw, neck)",
        back_scapula: "पीठ या कंधों के बीच (Back / Shoulder blades)",
        both_arms: "दोनों हाथों में (Both arms)",
        no_radiation: "कहीं नहीं फैल रहा, सिर्फ एक जगह है (No radiation)",
      },
    },
    prakriti: {
      title: "आपकी शारीरिक प्रकृति और मौसम की संवेदनशीलता कैसी है?",
      subtitle: "आयुर्वेदिक दशविध परीक्षा - प्रकृति चयन",
      ttsAudioText: "आपकी स्वाभाविक शारीरिक प्रवृत्ति और मौसम की संवेदनशीलता कैसी है?",
      choices: {
        vata: "वात प्रधान (रूखी त्वचा, ठंड सहन न होना)",
        pitta: "पित्त प्रधान (गर्म शरीर, तेज भूख, एसिडिटी)",
        kapha: "कफ प्रधान (मजबूत शरीर, मंद पाचन, स्निग्ध त्वचा)",
        vata_pitta: "मिश्रित वात-पित्त लक्षण",
      },
    },
    agni: {
      title: "आपकी भूख और भोजन पचाने की क्षमता (अग्नि) कैसी है?",
      subtitle: "दशविध परीक्षा - जाठराग्नि मूल्यांकन",
      ttsAudioText: "आपकी भूख और भोजन पचाने की क्षमता कैसी रहती है?",
      choices: {
        sama_agni: "सम अग्नि (संतुलित पाचन, समय पर भूख)",
        tikshna_agni: "तीक्ष्ण अग्नि (अत्यधिक भूख, सीने में जलन)",
        manda_agni: "मंद अग्नि (कम भूख, भारीपन व सुस्ती)",
        visham_agni: "विषम अग्नि (अनियमित भूख व गैस)",
      },
    },
  },
  en: {
    site: {
      title: "Where exactly is the pain or discomfort located?",
      subtitle: "Select the primary area of discomfort or speak aloud.",
      ttsAudioText: "Where exactly is the pain or discomfort located? Please select an option or speak aloud.",
      choices: {
        substernal: "Center of the chest (Substernal / Retrosternal)",
        left_sided: "Left side of the chest (Precordial)",
        epigastric: "Upper abdomen / Below breastbone (Epigastric)",
        diffuse: "Diffuse across whole chest",
      },
    },
    onset: {
      title: "When and how did the pain begin?",
      subtitle: "Select the onset timing and progression.",
      ttsAudioText: "When and how did the pain begin? Was the onset sudden or gradual?",
      choices: {
        acute_sudden: "Sudden severe onset (< 1 hour ago)",
        gradual_today: "Gradual progression today",
        intermittent_days: "Intermittent episodes over last 2-3 days",
        chronic_weeks: "Chronic recurring over weeks",
      },
    },
    character: {
      title: "How would you describe the character of the pain?",
      subtitle: "Choose the sensation that best matches your discomfort.",
      ttsAudioText: "How would you describe the character of the pain? Is it crushing pressure or burning?",
      choices: {
        crushing: "Heavy crushing pressure / Tightness",
        burning: "Burning sensation / Acid reflux style",
        sharp_stabbing: "Sharp stabbing / Pleuritic pain",
        dull_ache: "Dull, continuous ache",
      },
    },
    radiation: {
      title: "Does the pain radiate or spread anywhere else?",
      subtitle: "Select areas where the discomfort spreads.",
      ttsAudioText: "Does the pain radiate to your left arm, neck, or back?",
      choices: {
        left_arm_jaw: "Radiating to left arm, neck, or jaw",
        back_scapula: "Radiating to back / Between shoulder blades",
        both_arms: "Radiating down both arms",
        no_radiation: "Localized only / No radiation",
      },
    },
    prakriti: {
      title: "What is your constitutional bodily tendency (Prakriti)?",
      subtitle: "Dashavidha Pariksha - Constitutional Assessment",
      ttsAudioText: "What is your constitutional bodily tendency and climate sensitivity?",
      choices: {
        vata: "Vata Dominant (Dry skin, sensitive to cold)",
        pitta: "Pitta Dominant (Warm body, sharp appetite, acid reflux)",
        kapha: "Kapha Dominant (Sturdy build, slow digestion, calm)",
        vata_pitta: "Mixed Vata-Pitta Constitution",
      },
    },
    agni: {
      title: "How is your digestive fire and appetite (Agni)?",
      subtitle: "Dashavidha Pariksha - Agni Assessment",
      ttsAudioText: "How is your appetite and digestion throughout the day?",
      choices: {
        sama_agni: "Sama Agni (Balanced, healthy digestion)",
        tikshna_agni: "Tikshna Agni (Hyperactive, burning sensation)",
        manda_agni: "Manda Agni (Sluggish, fullness after meals)",
        visham_agni: "Visham Agni (Irregular hunger and bloating)",
      },
    },
  },
  bn: {
    site: {
      title: "ব্যথা বা অস্বস্তি ঠিক কোন জায়গায় হচ্ছে?",
      subtitle: "বুকের কোন অংশে ব্যথা হচ্ছে? বিকল্প নির্বাচন করুন অথবা মুখে বলুন।",
      ttsAudioText: "ব্যথা বা অস্বস্তি ঠিক কোন জায়গায় হচ্ছে? অনুগ্রহ করে বুকের অংশ নির্বাচন করুন।",
      choices: {
        substernal: "বুকের ঠিক মাঝখানে (Center of Chest)",
        left_sided: "বাঁ দিকে (Left side of chest)",
        epigastric: "পেটের ওপরের অংশে (Upper abdomen)",
        diffuse: "পুরো বুকে ছড়ানো (Whole chest)",
      }
    },
    onset: {
      title: "এই ব্যথা কখন এবং কীভাবে শুরু হয়েছিল?",
      subtitle: "শুরুটা কি হঠাৎ হয়েছিল নাকি ধীরে ধীরে?",
      ttsAudioText: "এই ব্যথা কখন এবং কীভাবে শুরু হয়েছিল?",
      choices: {
        acute_sudden: "হঠাৎ তীব্র শুরু হয়েছিল (< ১ ঘণ্টা)",
        gradual_today: "আজ ধীরে ধীরে বেড়েছে",
        intermittent_days: "গত ২-৩ দিন ধরে মাঝে মাঝে হচ্ছে",
        chronic_weeks: "অনেক সপ্তাহ ধরে চলছে",
      }
    }
  },
  ta: {
    site: {
      title: "வலி அல்லது அசௌகரியம் எங்கு ஏற்படுகிறது?",
      subtitle: "மார்பின் எந்தப் பகுதியில் வலி உள்ளது? தேர்ந்தெடுக்கவும்.",
      ttsAudioText: "வலி அல்லது அசௌகரியம் எங்கு ஏற்படுகிறது? தயவுசெய்து தேர்ந்தெடுக்கவும்.",
      choices: {
        substernal: "மார்பின் நடுப்பகுதியில் (Center of Chest)",
        left_sided: "இடது பக்கத்தில் (Left side)",
        epigastric: "வயிற்றின் மேல் பகுதியில் (Upper abdomen)",
        diffuse: "முழு மார்பிலும் பரவியுள்ளது (Whole chest)",
      }
    }
  },
  te: {
    site: {
      title: "నొప్పి లేదా అసౌకర్యం ఎక్కడ ఉంది?",
      subtitle: "ఛాతీలో ఏ భాగంలో నొప్పి ఉంది? ఎంచుకోండి.",
      ttsAudioText: "నొప్పి లేదా అసౌకర్యం ఎక్కడ ఉంది? దయచేసి ఎంచుకోండి.",
      choices: {
        substernal: "ఛాతీ మధ్యలో (Center of Chest)",
        left_sided: "ఎడమ వైపున (Left side)",
        epigastric: "కడుపు ఎగువ భాగంలో (Upper abdomen)",
        diffuse: "ఛాతీ అంతటా వ్యాపించింది (Whole chest)",
      }
    }
  },
  mr: {
    site: {
      title: "वेदना किंवा त्रास नेमका कुठे होत आहे?",
      subtitle: "छातीच्या कोणत्या भागात दुखत आहे? पर्याय निवडा किंवा बोला.",
      ttsAudioText: "वेदना किंवा त्रास नेमका कुठे होत आहे? कृपया पर्याय निवडा.",
      choices: {
        substernal: "छातीच्या मध्यभागी (Center of Chest)",
        left_sided: "डाव्या बाजूला (Left side)",
        epigastric: "पोटाच्या वरच्या भागात (Upper abdomen)",
        diffuse: "पूर्ण छातीत पसरलेली (Whole chest)",
      }
    }
  },
  gu: {
    site: {
      title: "દુખાવો અથવા તકલીફ કઈ જગ્યાએ થાય છે?",
      subtitle: "છાતીના કયા ભાગમાં દુખાવો છે? વિકલ્પ પસંદ કરો.",
      ttsAudioText: "દુખાવો અથવા તકલીફ કઈ જગ્યાએ થાય છે? કૃપા કરીને પસંદ કરો.",
      choices: {
        substernal: "છાતીની બરાબર વચ્ચે (Center of Chest)",
        left_sided: "ડાબી બાજુ (Left side)",
        epigastric: "પેટના ઉપરના ભાગમાં (Upper abdomen)",
        diffuse: "આખી છાતીમાં ફેલાયેલ (Whole chest)",
      }
    }
  },
  kn: {
    site: {
      title: "ನೋವು ಅಥವಾ ಅಸ್ವಸ್ಥತೆ ಎಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತಿದೆ?",
      subtitle: "ಎದೆಯ ಯಾವ ಭಾಗದಲ್ಲಿ ನೋವಿದೆ? ಆಯ್ಕೆಮಾಡಿ.",
      ttsAudioText: "ನೋವು ಅಥವಾ ಅಸ್ವಸ್ಥತೆ ಎಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತಿದೆ? ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ.",
      choices: {
        substernal: "ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ (Center of Chest)",
        left_sided: "ಎಡಭಾಗದಲ್ಲಿ (Left side)",
        epigastric: "ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ (Upper abdomen)",
        diffuse: "ಸಂಪೂರ್ಣ ಎದೆಯಲ್ಲಿ ಹರಡಿದೆ (Whole chest)",
      }
    }
  }
};

export function getKioskStepStrings(lang: string = "hi"): KioskStepStrings {
  return KIOSK_STEP_TRANSLATIONS[lang] || KIOSK_STEP_TRANSLATIONS.hi;
}

export function getQuestionContent(
  lang: string = "hi",
  questionId: string
): QuestionTranslation {
  const langGroup = KIOSK_TRANSLATIONS[lang] || KIOSK_TRANSLATIONS.hi;
  if (langGroup[questionId]) {
    return langGroup[questionId];
  }
  // Fallback to Hindi or English
  return KIOSK_TRANSLATIONS.hi[questionId] || KIOSK_TRANSLATIONS.en[questionId] || {
    title: "Please select an option",
    subtitle: "Select the answer that applies to you",
    ttsAudioText: "Please select an option.",
    choices: {}
  };
}
