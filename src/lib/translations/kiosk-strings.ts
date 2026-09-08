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
    identifyTts: "தயவுசெய்து உங்கள் பதினான்கு இலக்க ஆபா எண்ணை உள்ளிடவும் அல்லது கார்டை ஸ்கேன் செய்யவும்.",
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
    identifyTts: "దయచేసి మీ పద్నాలుగు అంకెల ఆభా నంబర్‌ను నమోదు చేయండి లేదా కార్డును స్కాన్ చేయండి.",
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
  mai: {
    identifyTitle: "अपन आभा आईडी (ABHA ID) या पहचान दर्ज करू",
    identifySub: "14 अंकक आयुष्मान भारत स्वास्थ्य खाता नंबर दर्ज करू अथवा कार्ड क्यूआर स्कैन करू।",
    identifyTts: "कृपा कऽ अपन चौदह अंकक आभा नंबर दर्ज करू अथवा कार्ड स्कैन करू।",
    consentTitle: "डेटा सुरक्षा आ डिजिटल सहमति (DPDP Act 2023)",
    consentSub: "अहाँक स्वास्थ्य जानकारी आ पुरान पुर्जा सुरक्षित रूप सँ ओपीडी डॉक्टर लग पठाओल जाएत।",
    consentTts: "अहाँक स्वास्थ्य जानकारी डॉक्टर लग पठेबाक लेल सहमति दिअ। ई जानकारी पूर्णतः सुरक्षित रहत।",
    modeTitle: "कृपा कऽ ओपीडी विभाग चुनू",
    modeSub: "अपन जरूरतक अनुसार एलोपैथी अथवा आयुर्वेदिक ओपीडीक चयन करू।",
    modeTts: "कृपा कऽ बताउ जे अहाँ एलोपैथी डॉक्टर लग जा रहल छी या आयुर्वेदिक ओपीडी विभागमे?",
    scanTitle: "पुरान पुर्जा आ लैब रिपोर्ट स्कैन करू",
    scanSub: "अपन पुरान डॉक्टरी पुर्जा कैमराक सोझाँ राखू अथवा फाइल अपलोड करू।",
    scanTts: "कृपा कऽ अपन दवाईक पुर्जा या लैब रिपोर्ट कैमराक सोझाँ देखाउ अथवा अपलोड करू।",
    confirmTitle: "अहाँक केस समरी तैयार अछि",
    confirmSub: "मरीजक सम्पूर्ण जानकारी डिजिटल रूप सँ डॉक्टरक लग पठा देल गेल अछि।",
    confirmTts: "अहाँक केस समरी तैयार अछि आ डॉक्टरक कंप्यूटर पर पठा देल गेल अछि। कृपा कऽ ओपीडी कमरा नंबर तीनमे जाउ।"
  },
  gu: {
    identifyTitle: "તમારો આભા આઈડી (ABHA ID) દાખલ કરો",
    identifySub: "૧૪ અંકનો આયુષ્માન ભારત હેલ્થ એકાઉન્ટ નંબર દાખલ કરો અથવા સ્કેન કરો.",
    identifyTts: "કૃપા કરીને તમારો ચૌદ અંકનો આભા નંબર દાખલ કરો અથવા કાર્ડ સ્કેન કરો.",
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
      ttsAudioText: "दर्द या तकलीफ किस जगह पर हो रही है?",
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
      ttsAudioText: "Where exactly is the pain or discomfort located?",
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
      ttsAudioText: "ব্যথা বা অস্বস্তি ঠিক কোন জায়গায় হচ্ছে?",
      choices: {
        substernal: "বুকের ঠিক মাঝখানে (Center of Chest)",
        left_sided: "বাঁ দিকে (Left side of chest)",
        left_chest: "বাঁ দিকে (Left side)",
        right_chest: "ডান দিকে (Right side)",
        epigastric: "পেটের ওপরের অংশে (Upper abdomen)",
        diffuse: "পুরো বুকে ছড়ানো (Whole chest)",
      }
    },
    onset: {
      title: "এই ব্যথা কখন এবং কীভাবে শুরু হয়েছিল?",
      subtitle: "শুরুটা কি হঠাৎ হয়েছিল নাকি ধীরে ধীরে?",
      ttsAudioText: "এই ব্যথা কখন এবং কীভাবে শুরু হয়েছিল? হঠাৎ নাকি ধীরে ধীরে?",
      choices: {
        acute_sudden: "হঠাৎ তীব্র শুরু হয়েছিল (< ১ ঘণ্টা)",
        sudden_acute: "হঠাৎ তীব্র শুরু হয়েছিল (< ১ ঘণ্টা)",
        gradual_today: "আজ ধীরে ধীরে বেড়েছে",
        gradual_days: "২-৩ দিন ধরে ধীরে ধীরে বেড়েছে",
        intermittent_days: "গত ২-৩ দিন ধরে মাঝে মাঝে হচ্ছে",
        post_exertion: "হাঁটাহাঁটি বা পরিশ্রমের পর",
        chronic_weeks: "অনেক সপ্তাহ ধরে চলছে",
      }
    },
    character: {
      title: "ব্যথাটি কেমন ধরনের অনুভূত হচ্ছে?",
      subtitle: "ভারী চাপ, সূঁচ ফোটার মতো তীব্র নাকি জ্বালা?",
      ttsAudioText: "ব্যথাটি কেমন ধরনের অনুভূত হচ্ছে? ভারী চাপ নাকি জ্বালা?",
      choices: {
        crushing: "ভারী চাপ বা আঁটসাঁট ভাব (Heavy pressure)",
        crushing_pressure: "ভারী চাপ বা আঁটসাঁট ভাব (Crushing pressure)",
        burning: "জ্বালা বা বুকজ্বালা (Burning sensation)",
        sharp_stabbing: "তীব্র ছুরির মতো খোঁচা (Sharp stabbing)",
        dull_ache: "হালকা একটানা ব্যথা (Dull continuous ache)",
      }
    },
    radiation: {
      title: "ব্যথা কি অন্য কোথাও ছড়িয়ে পড়ছে?",
      subtitle: "ব্যথা কোন কোন অংশে ছড়াচ্ছে?",
      ttsAudioText: "ব্যথা কি শরীরের অন্য কোনও অংশে ছড়িয়ে পড়ছে?",
      choices: {
        left_arm_jaw: "বাঁ হাত, গলা ও চোয়ালে (Left arm, jaw, neck)",
        back_scapula: "পিঠ বা দুই কাঁধের মাঝে (Back / Shoulder)",
        both_arms: "দুই হাতে (Both arms)",
        no_radiation: "কোথাও ছড়াচ্ছে না (No radiation)",
      }
    }
  },
  ta: {
    site: {
      title: "வலி அல்லது அசௌகரியம் எங்கு ஏற்படுகிறது?",
      subtitle: "மார்பின் எந்தப் பகுதியில் வலி உள்ளது? தேர்ந்தெடுக்கவும்.",
      ttsAudioText: "வலி அல்லது அசௌகரியம் எங்கு ஏற்படுகிறது?",
      choices: {
        substernal: "மார்பின் நடுப்பகுதியில் (Center of Chest)",
        left_sided: "இடது பக்கத்தில் (Left side)",
        left_chest: "இடது பக்கத்தில் (Left side)",
        right_chest: "வலது பக்கத்தில் (Right side)",
        epigastric: "வயிற்றின் மேல் பகுதியில் (Upper abdomen)",
        diffuse: "முழு மார்பிலும் பரவியுள்ளது (Whole chest)",
      }
    },
    onset: {
      title: "இந்த வலி எப்போது, எப்படி தொடங்கியது?",
      subtitle: "திடீரெனவா அல்லது படிப்படியாகவா?",
      ttsAudioText: "இந்த வலி எப்போது மற்றும் எவ்வாறு தொடங்கியது?",
      choices: {
        acute_sudden: "திடீரென கடுமையான வலி (< 1 மணிநேரம்)",
        sudden_acute: "திடீரென கடுமையான வலி (< 1 மணிநேரம்)",
        gradual_today: "இன்று படிப்படியாக அதிகரித்தது",
        gradual_days: "2-3 நாட்களாக படிப்படியாக அதிகரித்தது",
        intermittent_days: "கடந்த 2-3 நாட்களாக விட்டு விட்டு",
        post_exertion: "நடந்த பின் அல்லது உழைப்பிற்குப் பின்",
        chronic_weeks: "பல வாரங்களாக",
      }
    },
    character: {
      title: "வலி எவ்வாறு உணரப்படுகிறது?",
      subtitle: "கனமான அழுத்தம், குத்தல் அல்லது எரிச்சலா?",
      ttsAudioText: "வலி எவ்வாறு உணரப்படுகிறது? கடுமையான அழுத்தமா அல்லது எரிச்சலா?",
      choices: {
        crushing: "கனமான அழுத்தம் அல்லது இறுக்கம் (Heavy pressure)",
        crushing_pressure: "கனமான அழுத்தம் அல்லது இறுக்கம் (Crushing pressure)",
        burning: "நெஞ்செரிச்சல் போன்ற உணர்வு (Burning sensation)",
        sharp_stabbing: "கூர்மையான குத்தும் வலி (Sharp stabbing)",
        dull_ache: "லேசான தொடர் வலி (Dull continuous ache)",
      }
    },
    radiation: {
      title: "வலி வேறு எங்காவது பரவுகிறதா?",
      subtitle: "வலி எங்கு பரவுகிறது?",
      ttsAudioText: "வலி இடது கை, தாடை அல்லது முதுகுக்கு பரவுகிறதா?",
      choices: {
        left_arm_jaw: "இடது கை, கழுத்து மற்றும் தாடைக்கு (Left arm, jaw, neck)",
        back_scapula: "முதுகு அல்லது தோள்களுக்கு இடையே (Back / Shoulders)",
        both_arms: "இரு கைகளுக்கும் (Both arms)",
        no_radiation: "எங்கும் பரவவில்லை (No radiation)",
      }
    }
  },
  te: {
    site: {
      title: "నొప్పి లేదా అసౌకర్యం ఎక్కడ ఉంది?",
      subtitle: "ఛాతీలో ఏ భాగంలో నొప్పి ఉంది? ఎంచుకోండి.",
      ttsAudioText: "నొప్పి లేదా అసౌకర్యం ఎక్కడ ఉంది?",
      choices: {
        substernal: "ఛాతీ మధ్యలో (Center of Chest)",
        left_sided: "ఎడమ వైపున (Left side)",
        left_chest: "ఎడమ వైపున (Left side)",
        right_chest: "కుడి వైపున (Right side)",
        epigastric: "కడుపు ఎగువ భాగంలో (Upper abdomen)",
        diffuse: "ఛాతీ అంతటా వ్యాపించింది (Whole chest)",
      }
    },
    onset: {
      title: "ఈ నొప్పి ఎప్పుడు మరియు ఎలా మొదలైంది?",
      subtitle: "హఠాత్తుగానా లేదా క్రమంగానా?",
      ttsAudioText: "ఈ నొప్పి ఎప్పుడు మరియు ఎలా మొదలైంది?",
      choices: {
        acute_sudden: "అకస్మాత్తుగా తీవ్రమైన నొప్పి (< 1 గంట)",
        sudden_acute: "అకస్మాత్తుగా తీవ్రమైన నొప్పి (< 1 గంట)",
        gradual_today: "ఈ రోజు క్రమంగా పెరిగింది",
        gradual_days: "2-3 రోజులుగా క్రమంగా పెరిగింది",
        intermittent_days: "గత 2-3 రోజులుగా అప్పుడప్పుడు",
        post_exertion: "నడిచిన తర్వాత లేదా శ్రమ తర్వాత",
        chronic_weeks: "కొన్ని వారాలుగా",
      }
    },
    character: {
      title: "నొప్పి ఎలా అనిపిస్తోంది?",
      subtitle: "భారీ ఒత్తిడి, సూది గుచ్చినట్టా లేక మంటగా ఉందా?",
      ttsAudioText: "నొప్పి ఎలా అనిపిస్తోంది? భారీ ఒత్తిడా లేదా మంటగా ఉందా?",
      choices: {
        crushing: "భారీ ఒత్తిడి లేదా బిగుతుగా (Heavy pressure)",
        crushing_pressure: "భారీ ఒత్తిడి లేదా బిగుతుగా (Crushing pressure)",
        burning: "గుండెల్లో మంట లేదా ఎసిడిటీ (Burning sensation)",
        sharp_stabbing: "సూది గుచ్చినట్లుగా పదునైన నొప్పి (Sharp stabbing)",
        dull_ache: "తేలికపాటి నిరంతర నొప్పి (Dull ache)",
      }
    },
    radiation: {
      title: "నొప్పి వేరే ఎక్కడికైనా వ్యాపిస్తోందా?",
      subtitle: "నొప్పి ఎక్కడికి వ్యాపిస్తోంది?",
      ttsAudioText: "నొప్పి ఎడమ చేయి, దవడ లేదా వెనుక భాగానికి వ్యాపిస్తోందా?",
      choices: {
        left_arm_jaw: "ఎడమ చేయి, మెడ మరియు దవడకు (Left arm, jaw, neck)",
        back_scapula: "వీపు లేదా భుజాల మధ్యకు (Back / Shoulders)",
        both_arms: "రెండు చేతుల్లోకి (Both arms)",
        no_radiation: "ఎక్కడికీ వ్యాపించడం లేదు (No radiation)",
      }
    }
  },
  mr: {
    site: {
      title: "वेदना किंवा त्रास नेमका कुठे होत आहे?",
      subtitle: "छातीच्या कोणत्या भागात दुखत आहे? पर्याय निवडा किंवा बोला.",
      ttsAudioText: "वेदना किंवा त्रास नेमका कुठे होत आहे?",
      choices: {
        substernal: "छातीच्या मध्यभागी (Center of Chest)",
        left_sided: "डाव्या बाजूला (Left side)",
        left_chest: "डाव्या बाजूला (Left side)",
        right_chest: "उजव्या बाजूला (Right side)",
        epigastric: "पोटाच्या वरच्या भागात (Upper abdomen)",
        diffuse: "पूर्ण छातीत पसरलेली (Whole chest)",
      }
    },
    onset: {
      title: "ही वेदना कधी आणि कशी सुरू झाली?",
      subtitle: "सुरुवात अचानक झाली की हळूहळू?",
      ttsAudioText: "ही वेदना कधी आणि कशी सुरू झाली? अचानक की हळूहळू?",
      choices: {
        acute_sudden: "अचानक तीव्र सुरू झाली (< १ तास)",
        sudden_acute: "अचानक तीव्र सुरू झाली (< १ तास)",
        gradual_today: "आज हळूहळू वाढली",
        gradual_days: "२-३ दिवसांपासून हळूहळू वाढली",
        intermittent_days: "गेल्या २-३ दिवसांपासून वारंवार",
        post_exertion: "चालल्यानंतर किंवा जड कामांनंतर",
        chronic_weeks: "काही आठवड्यांपासून",
      }
    },
    character: {
      title: "वेदनांचे स्वरूप कसे आहे?",
      subtitle: "छातीत दाब, टोचल्यासारखे की जळजळ?",
      ttsAudioText: "वेदनांचे स्वरूप कसे आहे? जड दाब की जळजळ?",
      choices: {
        crushing: "जड दाब किंवा आवळल्यासारखे (Heavy pressure)",
        crushing_pressure: "जड दाब किंवा आवळल्यासारखे (Crushing pressure)",
        burning: "जळजळ किंवा ॲसिडिटीसारखे (Burning sensation)",
        sharp_stabbing: "तीक्ष्ण सुईसारखे टोचणे (Sharp stabbing)",
        dull_ache: "मंद सतत होणारी वेदना (Dull ache)",
      }
    },
    radiation: {
      title: "वेदना इतर कोठे पसरत आहे का?",
      subtitle: "वेदना कोणत्या भागात पसरते आहे?",
      ttsAudioText: "वेदना शरीराच्या इतर भागात पसरत आहे का?",
      choices: {
        left_arm_jaw: "डावा हात, मान आणि जबडा (Left arm, neck, jaw)",
        back_scapula: "पाठीत किंवा खांद्यांमध्ये (Back / Shoulders)",
        both_arms: "दोन्ही हातांमध्ये (Both arms)",
        no_radiation: "कुठेही नाही, फक्त एकाच जागी (No radiation)",
      }
    }
  },
  mai: {
    site: {
      title: "छातीमे दर्द बिल्कुल कोन् ठाँम भऽ रहल अछि?",
      subtitle: "छातीक कोन् भागमे कष्ट अछि? नीचाँ देल विकल्पमे सँ चुनू अथवा मुँह सँ बाजू।",
      ttsAudioText: "दर्द वा तकलीफ कोन् ठाँम भऽ रहल अछि?",
      choices: {
        substernal: "छातीक ठीक बीचमे (Center of Chest)",
        left_sided: "बामा कात (Left side of chest)",
        left_chest: "बामा कात (Left side)",
        right_chest: "दहिना कात (Right side)",
        epigastric: "पेटक ऊपरी भागमे (Upper abdomen)",
        diffuse: "सम्पूर्ण छातीमे फईलल (Whole chest)",
      }
    },
    onset: {
      title: "ई दर्द कहिया आ कोना शुरू भेल?",
      subtitle: "शुरुआत अचानक भेल वा धीरे-धीरे?",
      ttsAudioText: "ई दर्द कहिया आ कोना शुरू भेल? शुरुआत अचानक भेल वा धीरे-धीरे?",
      choices: {
        acute_sudden: "अचानक बहुत तेज शुरू भेल (< 1 घंटा)",
        sudden_acute: "अचानक बहुत तेज शुरू भेल (< 1 घंटा)",
        gradual_today: "आई धीरे-धीरे बढ़ल",
        gradual_days: "2-3 दिन सँ धीरे-धीरे बढ़ल",
        intermittent_days: "पिछला 2-3 दिन सँ बार-बार भऽ रहल अछि",
        post_exertion: "टहला वा भारी काजक बाद",
        chronic_weeks: "कतेको सप्ताह सँ चलि रहल अछि",
      }
    },
    character: {
      title: "दर्द कोन् तरहक महसूस भऽ रहल अछि?",
      subtitle: "दर्दक प्रकृति कोना अछि — भारी दबाव, चुभन, वा जलन?",
      ttsAudioText: "दर्द कोन् तरहक महसूस भऽ रहल अछि? भारी दबाव अछि वा जलन?",
      choices: {
        crushing: "भारी दबाव वा जकड़न (Heavy pressure)",
        crushing_pressure: "भारी दबाव वा जकड़न (Crushing pressure)",
        burning: "तेज जलन वा एसिडिटी (Burning sensation)",
        sharp_stabbing: "तीखे चुभन जकाँ दर्द (Sharp stabbing)",
        dull_ache: "हलुक लगातार दर्द (Dull ache)",
      }
    },
    radiation: {
      title: "की ई दर्द शरीरक कोनो आन अंगमे फइलि रहल अछि?",
      subtitle: "दर्द कतय-कतय फइलि रहल अछि?",
      ttsAudioText: "की दर्द शरीरक कोनो आन हिस्सा मे फइलि रहल अछि?",
      choices: {
        left_arm_jaw: "बामा हाथ, गर्दन आ गलगच्चामे (Left arm, jaw, neck)",
        back_scapula: "पीठ वा काँधमे (Back / Shoulders)",
        both_arms: "दुन्नू हाथमे (Both arms)",
        no_radiation: "कतहु नहि, मात्र छातीमे (No radiation)",
      }
    }
  },
  gu: {
    site: {
      title: "દુખાવો અથવા તકલીફ કઈ જગ્યાએ થાય છે?",
      subtitle: "છાતીના કયા ભાગમાં દુખાવો છે? વિકલ્પ પસંદ કરો.",
      ttsAudioText: "દુખાવો અથવા તકલીફ કઈ જગ્યાએ થાય છે?",
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
      ttsAudioText: "ನೋವು ಅಥವಾ ಅಸ್ವಸ್ಥತೆ ಎಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತಿದೆ?",
      choices: {
        substernal: "ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ (Center of Chest)",
        left_sided: "ಎಡಭಾಗದಲ್ಲಿ (Left side)",
        epigastric: "ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ (Upper abdomen)",
        diffuse: "ಸಂಪೂರ್ಣ ಎದೆಯಲ್ಲಿ ಹರಡಿದೆ (Whole chest)",
      }
    }
  }
};

export function getKioskStepStrings(lang: string = "en"): KioskStepStrings {
  return KIOSK_STEP_TRANSLATIONS[lang] || KIOSK_STEP_TRANSLATIONS.en || KIOSK_STEP_TRANSLATIONS.hi;
}

export function getQuestionContent(
  lang: string = "en",
  questionId: string
): QuestionTranslation {
  const langGroup = KIOSK_TRANSLATIONS[lang] || KIOSK_TRANSLATIONS.en || KIOSK_TRANSLATIONS.hi;
  if (langGroup && langGroup[questionId]) {
    return langGroup[questionId];
  }
  // Fallback to English or Hindi
  if (KIOSK_TRANSLATIONS.en?.[questionId]) {
    return KIOSK_TRANSLATIONS.en[questionId];
  }
  if (KIOSK_TRANSLATIONS.hi?.[questionId]) {
    return KIOSK_TRANSLATIONS.hi[questionId];
  }
  return {
    title: "",
    subtitle: "",
    ttsAudioText: "",
    choices: {}
  };
}
