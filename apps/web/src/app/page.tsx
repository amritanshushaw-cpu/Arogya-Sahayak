'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  Stethoscope,
  Mic,
  Video,
  LayoutDashboard,
  ShieldCheck,
  WifiOff,
  Zap,
  ArrowRight,
  HeartPulse,
  Users,
  BrainCircuit,
  Hospital,
  Globe,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'ur-IN', name: 'Urdu (اردو)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
];

const content = {
  en: {
    brandTitle: 'Arogya Sahayak',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['AI Screening', 'Dashboard', 'Teleconsult'],
    status: 'Offline PWA Ready',
    badge: 'Empowering ASHA & Rural Health Workers Across India',
    heroTitleLine1: 'Arogya Sahayak',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-Powered Early Disease Risk Prediction & Rural Health Access',
    heroDescription:
      'Delivering zero-latency, on-device AI diagnostic intelligence for frontline healthcare providers in remote and low-connectivity regions.',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    sectionTitle: 'Comprehensive Rural Health Intelligence',
    sectionDescription: 'Built for high impact, low connectivity, and effortless field adoption.',
    cards: [
      {
        title: 'AI Risk Screening',
        body: 'On-device neural network models predict cardiovascular, diabetes, & respiratory risk profiles instantly without internet.',
        linkText: 'Launch Screener →',
      },
      {
        title: 'Vernacular Voice Input',
        body: 'Speech-to-text symptom intake in regional dialects to streamline rapid patient registration during field visits.',
        linkText: 'Voice Assistant →',
      },
      {
        title: 'Teleconsultation',
        body: 'Connect rural field workers directly with district hospital doctors via low-bandwidth video & emergency messaging.',
        linkText: 'Connect Doctor →',
      },
      {
        title: 'Admin Dashboard',
        body: 'Real-time epidemiological heatmaps, village health statistics, risk distribution analytics, and field sync status.',
        linkText: 'View Analytics →',
      },
    ],
    highlights: [
      { value: '100% Offline', detail: 'ONNX Model + Dexie DB' },
      { value: '< 50ms', detail: 'Real-time AI Inference' },
      { value: 'HIPAA / ABDM', detail: 'Encrypted Local Storage' },
      { value: 'ASHA Ready', detail: 'Multi-lingual Interface' },
    ],
    footer: 'Arogya Sahayak — Rural Healthcare AI PWA Scaffold (IEMH4-HC-01)',
    footerLinks: ['Screening', 'Dashboard', 'Teleconsult'],
  },
  hi: {
    brandTitle: 'अरोग्य सहायक',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['एआई स्क्रीनिंग', 'डैशबोर्ड', 'टेलीकंसल्ट'],
    status: 'ऑफ़लाइन PWA तैयार',
    badge: 'भारत भर में ASHA और ग्रामीण स्वास्थ्य कार्यकर्ताओं को सशक्त बनाना',
    heroTitleLine1: 'अरोग्य सहायक',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'एआई-संचालित प्रारंभिक रोग जोखिम पूर्वानुमान और ग्रामीण स्वास्थ्य पहुँच',
    heroDescription:
      'दूरदराज और कम कनेक्टिविटी वाले क्षेत्रों में frontline स्वास्थ्य प्रदाताओं के लिए शून्य-विलंब, ऑन-डिवाइस एआई निदान बौद्धिकता प्रदान करना।',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    sectionTitle: 'सम्पूर्ण ग्रामीण स्वास्थ्य बौद्धिकता',
    sectionDescription: 'उच्च प्रभाव, कम कनेक्टिविटी और सहज क्षेत्र उपयोग के लिए निर्मित।',
    cards: [
      {
        title: 'एआई जोखिम स्क्रीनिंग',
        body: 'ऑन-डिवाइस न्यूरल नेटवर्क मॉडल हृदय, मधुमेह और श्वसन जोखिम प्रोफाइल को इंटरनेट के बिना तुरंत पूर्वानुमानित करते हैं।',
        linkText: 'स्क्रीनर लॉन्च →',
      },
      {
        title: 'मूल भाषा आवाज़ इनपुट',
        body: 'क्षेत्रीय बोलियों में लक्षणों का स्पीच-टू-टेक्स्ट इनपुट खेत-visit के दौरान rapid पंजीकरण को सरल बनाता है।',
        linkText: 'वॉयस असिस्टेंट →',
      },
      {
        title: 'टेलीकंसल्टेशन',
        body: 'ग्रामीण कार्यकर्ताओं को जिला अस्पताल के डॉक्टरों से कम-बैंडविड्थ वीडियो और आपात संदेशों के जरिए जोड़ता है।',
        linkText: 'डॉक्टर से जुड़ें →',
      },
      {
        title: 'एडमिन डैशबोर्ड',
        body: 'रीयल-टाइम एपिडेमियोलॉजिकल हीटमैप, गाँव स्वास्थ्य आँकड़े, जोखिम वितरण विश्लेषण और फ़ील्ड सिंक स्थिति।',
        linkText: 'विश्लेषण देखें →',
      },
    ],
    highlights: [
      { value: '100% ऑफ़लाइन', detail: 'ONNX मॉडल + Dexie DB' },
      { value: '< 50ms', detail: 'रीयल-टाइम एआई इंफरेंस' },
      { value: 'HIPAA / ABDM', detail: 'एन्क्रिप्टेड लोकल स्टोरेज' },
      { value: 'ASHA तैयार', detail: 'बहु-भाषी इंटरफ़ेस' },
    ],
    footer: 'अरोग्य सहायक — ग्रामीण स्वास्थ्य एआई PWA स्कैफोल्ड (IEMH4-HC-01)',
    footerLinks: ['स्क्रीनिंग', 'डैशबोर्ड', 'टेलीकंसल्ट'],
  },
  bn: {
    brandTitle: 'অরোগ্য সহায়ক',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['এআই স্ক্রিনিং', 'ড্যাশবোর্ড', 'টেলিকনসাল্ট'],
    status: 'অফলাইন PWA প্রস্তুত',
    badge: 'ভারতের ASHA এবং গ্রামীণ স্বাস্থ্যকর্মীদের ক্ষমতায়ন',
    heroTitleLine1: 'অরোগ্য সহায়ক',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'এআই-চালিত প্রাথমিক রোগ ঝুঁকি পূর্বাভাস ও গ্রামীণ স্বাস্থ্য অ্যাক্সেস',
    heroDescription:
      'দূরবর্তী ও নিম্ন-সংযোগিত অঞ্চলে ফ্রন্টলাইন স্বাস্থ্যকর্মীদের জন্য ডিভাইসে দ্রুত এআই নির্ণয় বুদ্ধিমত্তা সরবরাহ।',
    signIn: 'সাইন ইন',
    signUp: 'নিবন্ধন করুন',
    sectionTitle: 'ব্যাপক গ্রামীণ স্বাস্থ্য বুদ্ধিমত্তা',
    sectionDescription: 'উচ্চ প্রভাব, কম সংযোগ এবং সহজ মাঠ গ্রহণের জন্য নির্মিত।',
    cards: [
      {
        title: 'এআই ঝুঁকি স্ক্রিনিং',
        body: 'ডিভাইসে চলা ন্যুরাল নেটওয়ার্ক মডেলগুলি ইন্টারনেট ছাড়াই হৃদরোগ, ডায়াবেটিস এবং শ্বাসযন্ত্রের ঝুঁকি পূর্বাভাস দেয়।',
        linkText: 'স্ক্রিনার চালু করুন →',
      },
      {
        title: 'বর্ণভাষী ভয়েস ইনপুট',
        body: 'আঞ্চলিক ভাষায় আলাপন থেকে টেক্সটে রূপান্তর রোগী নিবন্ধনকে দ্রুত করে।',
        linkText: 'ভয়েস সহকারী →',
      },
      {
        title: 'টেলিকনসাল্টেশন',
        body: 'গ্রামীণ কর্মীদের জেলা হাসপাতালের ডাক্তারদের সাথে কম ব্যান্ডউইথ ভিডিও ও জরুরি বার্তার মাধ্যমে সংযুক্ত করে।',
        linkText: 'ডাক্তারের সাথে যুক্ত হন →',
      },
      {
        title: 'এডমিন ড্যাশবোর্ড',
        body: 'রিয়েল-টাইম তাপমাত্রা মানচিত্র, গ্রাম স্বাস্থ্য পরিসংখ্যান, ঝুঁকি বিশ্লেষণ এবং ক্ষেত্র সিঙ্ক স্থিতি।',
        linkText: 'বিশ্লেষণ দেখুন →',
      },
    ],
    highlights: [
      { value: '১০০% অফলাইন', detail: 'ONNX মডেল + Dexie DB' },
      { value: '< ৫০ms', detail: 'রিয়েল-টাইম AI ইনফারেন্স' },
      { value: 'HIPAA / ABDM', detail: 'এনক্রিপ্টেড লোকাল স্টোরেজ' },
      { value: 'ASHA প্রস্তুত', detail: 'বহুভাষী ইন্টারফেস' },
    ],
    footer: 'অরোগ্য সহায়ক — গ্রামীণ স্বাস্থ্য AI PWA স্ক্যাফোল্ড (IEMH4-HC-01)',
    footerLinks: ['স্ক্রীনিং', 'ড্যাশবোর্ড', 'টেলিকনসাল্ট'],
  },
  te: {
    brandTitle: 'ఆరోగ్య సహాయక',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['ఏఐ స్క్రీనింగ్', 'డాష్‌బోర్డ్', 'టెలీకాన్సల్ట్'],
    status: 'ఆఫ్‌లైన్ PWA సిద్ధంగా ఉంది',
    badge: 'భారతదేశంలోని ASHA మరియు గ్రామీణ ఆరోగ్య కార్యకర్తలకు శక్తివంతం చేస్తుంది',
    heroTitleLine1: 'ఆరోగ్య సహాయక',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-ఆధారిత ప్రారంభ వ్యాధి ప్రమాద అంచనా మరియు గ్రామీణ ఆరోగ్య యాక్సెస్',
    heroDescription:
      'దూర ప్రాంతాల్లో మరియు తక్కువ కనెక్టివిటీ అవసరమైన ప్రాంతాల్లో ముందు కాలంలో ఆరోగ్యప్రదాతలకు పరికరంలో నేరుగా AI డయాగ్నోస్టిక్ బుద్ధిమత్తను అందించడం.',
    signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్',
    sectionTitle: 'సమగ్ర గ్రామీణ ఆరోగ్య బుధ్ధిమత్త',
    sectionDescription: 'అధిక ప్రభావం, తక్కువ కనెక్టివిటీ, మరియు సులభమైన ఫీల్డ్ దాటి కోసం రూపొంది ఉంది.',
    cards: [
      {
        title: 'ఏఐ ప్రమాద స్క్రీనింగ్',
        body: 'పరికరంలో నడిచే న్యూరల్ నెట్‌వర్క్ మోడళ్లతో ఇంటర్నెట్ లేకుండానే వేగంగా రుగ్మతలు అంచనా వేయండి.',
        linkText: 'స్క్రీనర్ ప్రారంభించండి →',
      },
      {
        title: 'ప్రాంతీయ వాయిస్ ఇన్‌పుట్',
        body: 'స్థానిక భాషలలో లక్షణాలను స్పీచ్-టు-టెక్స్ట్ ద్వారా నమోదు చేయడం ఫీల్డ్ రిజిస్ట్రేషన్‌ను వేగవంతం చేస్తుంది.',
        linkText: 'వాయిస్ అసిస్టెంట్ →',
      },
      {
        title: 'టెలీకాన్సల్ట్',
        body: 'గ్రామీణ కార్యకర్తలను జిల్లా హాస్పిటల్ డాక్టర్లతో తక్కువ బాండ్‌విడ్త్ వీడియో మరియు అత్యవసర సందేశాల ద్వారా అనుసంధానిస్తుంది.',
        linkText: 'డాక్టర్‌కు కనెక్ట్ అవ్వండి →',
      },
      {
        title: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
        body: 'వాస్తవ-సమయంలో ఎపిడెమియోలాజికల్ హీట్‌మ్యాప్‌లు, గ్రామ ఆరోగ్యం గణాంకాలు, ప్రమాద విభజన విశ్లేషణ మరియు ఫీల్డ్ సింక్ స్థితి.',
        linkText: 'విశ్లేషణ చూడండి →',
      },
    ],
    highlights: [
      { value: '100% ఆఫ్‌లైన్', detail: 'ONNX మోడల్ + Dexie DB' },
      { value: '< 50ms', detail: 'వాస్తవ-సమయ AI ఇన్‌ఫరెన్స్' },
      { value: 'HIPAA / ABDM', detail: 'గోప్యమైన స్థానిక నిల్వ' },
      { value: 'ASHA సిద్ధంగా ఉంది', detail: 'బహుభాషా ఇంటర్ఫేస్' },
    ],
    footer: 'ఆరోగ్య సహాయక — గ్రామీణ ఆరోగ్య AI PWA స్కాఫోల్డ్ (IEMH4-HC-01)',
    footerLinks: ['స్క్రీనింగ్', 'డాష్‌బోర్డ్', 'టెలీకాన్సల్ట్'],
  },
  mr: {
    brandTitle: 'आरोग्य सहाय्यक',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['एआय स्क्रीनिंग', 'डॅशबोर्ड', 'टेलीकॉन्सल्ट'],
    status: 'ऑफलाइन PWA तयार आहे',
    badge: 'भारतातील ASHA आणि ग्रामीण आरोग्य कर्मचार्‍यांना सक्षमत करणे',
    heroTitleLine1: 'आरोग्य सहाय्यक',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'एआय-आधारित प्रारंभिक रोग धोक्याचा अंदाज आणि ग्रामीण आरोग्य प्रवेश',
    heroDescription:
      'दूरवर्ती आणि कमी कनेक्टिव्हिटी असलेल्या भागातील फ्रंटलाइन आरोग्य सेवा प्रदात्यांसाठी डिव्हाइसवर जलद AI निदान बुद्धिमत्ता प्रदान करण्यासाठी.',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    sectionTitle: 'समग्र ग्रामीण आरोग्य बुद्धिमत्ता',
    sectionDescription: 'उच्च प्रभाव, कमी कनेक्टिव्हिटी आणि सहज क्षेत्र स्वीकारासाठी बांधलेले.',
    cards: [
      {
        title: 'एआय जोखीम स्क्रीनिंग',
        body: 'डिव्हाइसवरील न्यूरल नेटवर्क मॉडेल इंटरनेटशिवाय हृदय रोग, मधुमेह आणि श्वसनजोखमीचा वेगाने अंदाज लावतात.',
        linkText: 'स्क्रीनर सुरू करा →',
      },
      {
        title: 'स्थानिक व्हॉइस इनपुट',
        body: 'क्षेत्रीय बोलींमध्ये लक्षणांचे स्पीच-टू-टेक्स्ट इनपुट फील्ड नोंदणी जलद करतो.',
        linkText: 'व्हॉइस असिस्टंट →',
      },
      {
        title: 'टेलीकॉन्सल्टेशन',
        body: 'ग्रामीण कर्मचारी जिला रुग्णालयातील डॉक्टरांशी कमी बॅंडविड्थ व्हिडिओ आणि आपत्कालीन संदेशाद्वारे जोडतात.',
        linkText: 'डॉक्टरशी जोडा →',
      },
      {
        title: 'अ‍ॅडमिन डॅशबोर्ड',
        body: 'रिअल-टाइम एपिडेमिओलॉजिकल हीटमॅप, गाव आरोग्य आकडेवारी, धोका वितरण विश्लेषण आणि फील्ड सिंक स्थिती.',
        linkText: 'विश्लेषण पहा →',
      },
    ],
    highlights: [
      { value: '100% ऑफलाइन', detail: 'ONNX मॉडेल + Dexie DB' },
      { value: '< 50ms', detail: 'रिअल-टाइम AI इन्फरन्स' },
      { value: 'HIPAA / ABDM', detail: 'एनक्रिप्टेड लोकल स्टोरेज' },
      { value: 'ASHA तयार', detail: 'बहुभाषी इंटरफेस' },
    ],
    footer: 'आरोग्य सहाय्यक — ग्रामीण आरोग्य AI PWA स्कॅफोल्ड (IEMH4-HC-01)',
    footerLinks: ['स्क्रीनिंग', 'डॅशबोर्ड', 'टेलीकॉन्सल्ट'],
  },
  ta: {
    brandTitle: 'ஆரோக்கிய உதவியாளர்',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['ஏஐ ஸ்கிரீனிங்', 'டாஷ்போர்டு', 'தொலை ஆலோசனை'],
    status: 'ஆஃப்லைன் PWA தயாராக உள்ளது',
    badge: 'இந்தியாவில் ASHA மற்றும் கிராமப்புற மருத்துவ பணியாளர்களுக்கு சக்தியை அளிக்கும்',
    heroTitleLine1: 'ஆரோக்கிய உதவியாளர்',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI இயக்கப்பட்ட ஆரம்ப நோய் அபாய கணிப்பு மற்றும் கிராமப்பூர்வ சுகாதார அணுகல்',
    heroDescription:
      'தூர நிலையிலும் குறைந்த இணைப்பு பகுதிகளிலும் முன் வரிசை சுகாதார வழங்குனர்களுக்கு சாதனத்தில் AI கண்டறிதல் நுண்ணறிவை வழங்குதல்.',
    signIn: 'உள்நுழைய',
    signUp: 'பதிவு செய்யவும்',
    sectionTitle: 'முழுமையான கிராமப்புற சுகாதார நுண்ணறிவு',
    sectionDescription: 'உயிரோட்டமான தாக்கம், குறைந்த இணைப்பு மற்றும் மலிவு பயன்பாடு களத்தில் உருவாக்கப்பட்டுள்ளது.',
    cards: [
      {
        title: 'ஏஐ அபாய ஸ்கிரீனிங்',
        body: 'சாதனத்தில் இயங்கும் நியூரல் நெட்வொர்க் மாதிரிகள் இணையதளமின்றி உடற்பயிற்சி, நீரிழிவு, மற்றும் மூச்சுத்திணறல் அபாயங்களை கணிக்கும்.',
        linkText: 'ஸ்கிரீனர் தொடங்கவும் →',
      },
      {
        title: 'உள்ளூர் குரல் உள்ளீடு',
        body: 'பிரதேச மொழிகளில் உடல்நிலை அறிகுறிகளை பேச்சில் இருந்து உரையாக மாற்றுவது தளம் பதிவு செயல்முறையை வேகமாக்குகிறது.',
        linkText: 'குரல் உதவியாளர் →',
      },
      {
        title: 'தொலை ஆலோசனை',
        body: 'கிராமப்புற பணியாளர்களை மாவட்ட மருத்துவமனை மருத்துவர்களுடன் குறைந்த போந்து வீடியோ மற்றும் அவசர செய்தித்தொடரில் இணைக்கிறது.',
        linkText: 'மருத்துவருடன் இணைக்கவும் →',
      },
      {
        title: 'நிர்வாக டாஷ்போர்டு',
        body: 'சரியான நேர தொற்று வரைபடங்கள், கிராம சுகாதார புள்ளிவிவரங்கள், அபாய பகிர்வு பகுப்பாய்வு மற்றும் புலம் ஒத்திசைவு நிலையை வழங்குகிறது.',
        linkText: 'பகுப்பாய்வை காண்பி →',
      },
    ],
    highlights: [
      { value: '100% ஆஃப்லைன்', detail: 'ONNX மாதிரி + Dexie DB' },
      { value: '< 50மி.செ', detail: 'உண்மை நேர AI கணிப்பு' },
      { value: 'HIPAA / ABDM', detail: 'குறியாக்கப்பட்ட உள்ளக சேமிப்பு' },
      { value: 'ASHA தயாராக உள்ளது', detail: 'பல மொழி இடைமுகம்' },
    ],
    footer: 'ஆரோக்கிய உதவியாளர் — கிராமப்புற சுகாதார AI PWA உருவமைப்பு (IEMH4-HC-01)',
    footerLinks: ['ஸ்கிரீனிங்', 'டாஷ்போர்ட்', 'தொலை ஆலோசனை'],
  },
  gu: {
    brandTitle: 'આરોગ્ય સહાયક',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['એઆઈ સ્ક્રીનિંગ', 'ડૅશબોર્ડ', 'ટેલીકન્સલ્ટ'],
    status: 'ઓફલાઇન PWA તૈયાર છે',
    badge: 'ભારતમાં ASHA અને ગ્રામ્ય આરોગ્ય કર્મચારીઓને સક્ષમ બનાવવું',
    heroTitleLine1: 'આરોગ્ય સહાયક',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-આધારિત પ્રારંભિક રોગ જોખમ આગાહી અને ગ્રામ્ય આરોગ્ય ઍક્સેસ',
    heroDescription:
      'દૂરસ્થ અને નીચી કનેક્ટિવિટીવાળા વિસ્તારોમાં ફ્રન્ટલાઇન આરોગ્ય પ્રદાતાઓ માટે ડિવાઇસ પર ઝડપી AI નિદાન બુદ્ધિ પૂરી પાડવી.',
    signIn: 'સાઇન ઇન',
    signUp: 'સાઇન અપ',
    sectionTitle: 'સંપૂર્ણ ગ્રામ્ય આરોગ્ય બુદ્ધિ',
    sectionDescription: 'ઉચ્ચ અસર, નીચી કનેક્ટિવિટી અને સરળ ક્ષેત્ર અપનાવવા માટે નિર્મિત.',
    cards: [
      {
        title: 'AI જોખમ સ્ક્રીનિંગ',
        body: 'ડિવાઇસ પર ચાલતી ન્યુરલ નેટવર્ક મોડેલ્સ ઇન્ટરનેટ વિના હૃદયરોક, ડાયાબિટીસ અને શ્વાસ સમસ્યાનો ઝડપથી અહેવાલ આપે છે.',
        linkText: 'સ્ક્રીનર લોન્ચ કરો →',
      },
      {
        title: 'પ્રાદેશિક વોઇસ ઇનપુટ',
        body: 'પ્રદેશીય બોલીઓમાં લક્ષણોને સ્પીચ-ટુ-ટેક્સ્ટથી નોંધવી ફીલ્ડ નોંધણીને ઝડપ આપે છે.',
        linkText: 'વોઇસ સહાયક →',
      },
      {
        title: 'ટેલીકન્સલ્ટેશન',
        body: 'ગ્રામ્ય કર્મચારીઓને જિલ્લા હિતેલ્ડોક્ટરો સાથે ઓછા બેન્ડવિથ વિડિયો અનેતાકી સંદેશા દ્વારા જોડે છે.',
        linkText: 'ડોક્ટરના જોડાઓ →',
      },
      {
        title: 'એડમિન ડૅશબોર્ડ',
        body: 'રીલ ટાઈમ એપીડીમીયોલોજિકલ હીટમેપ, ગામ આરોગ્ય આંકડા, જોખમ વિતરણ વિશ્લેષણ અને ફીલ્ડ સિંક સ્થિતિ.',
        linkText: 'વિશ્લેષણ જુઓ →',
      },
    ],
    highlights: [
      { value: '100% ઓફલાઇન', detail: 'ONNX મોડેલ + Dexie DB' },
      { value: '< 50ms', detail: 'વાસ્તવિક સમય AI ઇન્ફરન્સ' },
      { value: 'HIPAA / ABDM', detail: 'એન્ક્રિપ્ટેડ લોકલ સ્ટોરેજ' },
      { value: 'ASHA તૈયાર', detail: 'બહુભાષી ઇન્ટરફેસ' },
    ],
    footer: 'આરોગ્ય સહાયક — ગ્રામ્ય આરોગ્ય AI PWA સ્કાફોલ્ડ (IEMH4-HC-01)',
    footerLinks: ['સ્ક્રીનિંગ', 'ડૅશબોર્ડ', 'ટેલીકન્સલ્ટ'],
  },
  ur: {
    brandTitle: 'اروجیہ معاون',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['اے آئی اسکریننگ', 'ڈیش بورڈ', 'ٹیلی کنسلٹ'],
    status: 'آف لائن PWA تیار ہے',
    badge: 'بھارت میں ASHA اور دیہی طبی عملے کو بااختیار بنانا',
    heroTitleLine1: 'اروجیہ معاون',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI سے چلنے والی ابتدائی بیماری خطرہ پیش گوئی اور دیہی صحت تک رسائی',
    heroDescription:
      'دور دراز اور کم کنیکٹیویٹی والے علاقوں میں فرنٹ لائن طبی فراہم کنندگان کو ڈیوائس پر تیز AI تشخیصی ذہانت فراہم کرنا۔',
    signIn: 'سائن ان',
    signUp: 'سائن اپ',
    sectionTitle: 'مکمل دیہی صحت کی ذہانت',
    sectionDescription: 'اعلی اثر، کم کنیکٹیویٹی، اور آسان فیلڈ اپنانے کے لئے بنایا گیا۔',
    cards: [
      {
        title: 'AI خطرہ اسکریننگ',
        body: 'ڈیوائس پر چلنے والی نیورل نیٹ ورک ماڈلز بغیر انٹرنیٹ کے دل، ذیابیطس، اور سانس کے خطرے کی پیش گوئی کرتی ہیں۔',
        linkText: 'اسکرینر شروع کریں →',
      },
      {
        title: 'علاقائی وائس ان پٹ',
        body: 'مقامی زبانوں میں علامات کو تقریر سے متن میں تبدیل کرنا فیلڈ رجسٹریشن کو تیز کرتا ہے۔',
        linkText: 'وائس اسسٹنٹ →',
      },
      {
        title: 'ٹیلی کنسلٹ',
        body: 'دیہی کارکنوں کو ضلعی ہسپتال کے ڈاکٹروں سے کم بینڈوڈتھ ویڈیو اور ایمرجنسی پیغام رسانی کے ذریعے جوڑتا ہے۔',
        linkText: 'ڈاکٹر سے جڑیں →',
      },
      {
        title: 'ایڈمن ڈیش بورڈ',
        body: 'حقیقت پسندانہ وبائی حرارتی نقشے، گاؤں کی صحت کے اعداد و شمار، خطرے کی تقسیم کا تجزیہ، اور فیلڈ سنک کی حیثیت۔',
        linkText: 'تجزیہ دیکھیں →',
      },
    ],
    highlights: [
      { value: '100% آف لائن', detail: 'ONNX ماڈل + Dexie DB' },
      { value: '< 50ms', detail: 'حقیقی وقت AI انفرنس' },
      { value: 'HIPAA / ABDM', detail: 'انکرپٹڈ مقامی ذخیرہ' },
      { value: 'ASHA تیار', detail: 'کثیر اللسانی انٹرفیس' },
    ],
    footer: 'اروجیہ معاون — دیہی صحت AI PWA اسکیفولڈ (IEMH4-HC-01)',
    footerLinks: ['اسکریننگ', 'ڈیش بورڈ', 'ٹیلی کنسلٹ'],
  },
  kn: {
    brandTitle: 'ಆರೋಗ್ಯ ಸಹಾಯಕ',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['ಎಐ ಸ್ಕ್ರೀನಿಂಗ್', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಟೆಲಿಕನ್ಸಲ್ಟ್'],
    status: 'ಆಫ್ಲೈನ್ PWA ಸಿದ್ಧವಾಗಿದೆ',
    badge: 'ಭಾರತದ ASHA ಮತ್ತು ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಗಳನ್ನು ಸಬಲಗೊಳಿಸುತ್ತದೆ',
    heroTitleLine1: 'ಆರೋಗ್ಯ ಸಹಾಯಕ',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI ಚಾಲಿತ ಆರಂಭಿಕ ರೋಗ ಅಪಾಯ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಪ್ರವೇಶ',
    heroDescription:
      'ದೂರದ ಮತ್ತು ಕಡಿಮೆ ಸಂಪರ್ಕ ಪ್ರದೇಶಗಳಲ್ಲಿ ಫ್ರಂಟ್‌ಲೈನ್ ಆರೋಗ್ಯದರ್ಶಕರಿಗೆ ಸಾಧನದಲ್ಲಿ ತ್ವರಿತ AI ದ್ಬ್ಯಾಂಗಳಿಯ ಅದ್ಭುತವನ್ನು ಒದಗಿಸುವುದು.',
    signIn: 'ಸೈನ್ ಇನ್',
    signUp: 'ಸೈನ್ ಅಪ್',
    sectionTitle: 'ಸമಗ್ರ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಬುದ್ಧಿಮತ್ತೆ',
    sectionDescription: 'ಉನ್ನತ ಪರಿಣಾಮ, ಕಡಿಮೆ ಸಂಪರ್ಕ ಮತ್ತು ಸುಲಭ ಕ್ಷೇತ್ರ ಸ್ವೀಕಾರಕ್ಕಾಗಿ ರಚಿಸಲಾಗಿದೆ.',
    cards: [
      {
        title: 'AI ಅಪಾಯ ಸ್ಕ್ರೀನಿಂಗ್',
        body: 'ಸಾಧನದಲ್ಲಿ ನಡಿಸುವ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್ ಮಾದರಿಗಳು ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಹೃದಯ, ರಕ್ತಸಕ್ಕರೆ ಮತ್ತು ಶ್ವಾಸದ ಅಪಾಯಗಳನ್ನು ಭವಿಷ್ಯವಾಣಿ ಮಾಡುತ್ತವೆ.',
        linkText: 'ಸ್ಕ್ರೀನರ್ ಪ್ರಾರಂಭಿಸಿ →',
      },
      {
        title: 'ಪ್ರಾದೇಶಿಕ ವಾಯ್ಸ್ ಇನ್‌ಪುಟ್',
        body: 'ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಲಕ್ಷಣಗಳನ್ನು ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ ಮೂಲಕ ದಾಖಲಿಸುವುದು ಕ್ಷೇತ್ರ ನೋಂದಣಿಯನ್ನು ವೇಗಗೊಳಿಸುತ್ತದೆ.',
        linkText: 'ವಾಯ್ಸ್ ಸಹಾಯಕ →',
      },
      {
        title: 'ಟೆಲಿಕನ್ಸಲ್ಟ',
        body: 'ಗ್ರಾಮೀಣ ಕಾರ್ಯಕರ್ತರನ್ನು ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಯ ವೈದ್ಯರೊಂದಿಗೆ ಕಡಿಮೆ ಬ್ಯಾನ್ಡ್‌ವಿಡ್ ವೀಡಿಯೊ ಮತ್ತು ತುರ್ತು ಸಂದೇಶಗಳ ಮೂಲಕ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
        linkText: 'ವೈದ್ಯರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ →',
      },
      {
        title: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        body: 'ರಿಯಲ್-ಟೈಮ್ ರೋಗ ತಾಪನ ನಕ್ಷೆಗಳು, ಗ್ರಾಮ ಆರೋಗ್ಯ ಆಂಕಡೆ, ಅಪಾಯ ವಿತರಣೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಕ್ಷೇತ್ರ ಸಿಂಕ್ ಸ್ಥಿತಿ.',
        linkText: 'ವಿಶ್ಲೇಷಣೆ ನೋಡಿ →',
      },
    ],
    highlights: [
      { value: '100% ಆಫ್ಲೈನ್', detail: 'ONNX ಮಾದರಿ + Dexie DB' },
      { value: '< 50ms', detail: 'ವಾಸ್ತವಿಕ ಕಾಲ AI ಇನ್‌ಫರೆನ್ಸ್' },
      { value: 'HIPAA / ABDM', detail: 'ಕೋಡ್ ചെയ്ത ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ' },
      { value: 'ASHA ಸಿದ್ಧ', detail: 'ಬಹುಭಾಷಿ ಇಂಟರ್‌ಫೇಸ್' },
    ],
    footer: 'ಆರೋಗ್ಯ ಸಹಾಯಕ — ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ AI PWA ಸ್ಕ್ಯಾಫೋಲ್ಡ್ (IEMH4-HC-01)',
    footerLinks: ['ಸ್ಕ್ರೀನಿಂಗ್', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಟೆಲಿಕನ್ಸಲ್ಟ್'],
  },
  or: {
    brandTitle: 'ଆରୋଗ୍ୟ ସହାୟକ',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['ଏଆଇ ସ୍କ୍ରିନିଂ', 'ଡ୍ୟାଶବୋର୍ଡ', 'ଟେଲିକନସଲ୍ଟ'],
    status: 'ଅଫ୍‌ଲାଇନ୍ PWA ପ୍ରସ୍ତୁତ',
    badge: 'ଭାରତର ASHA ଏବଂ ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ କର୍ମଚାରୀଙ୍କୁ ସଶକ୍ତ କରେ',
    heroTitleLine1: 'ଆରୋଗ୍ୟ ସହାୟକ',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI ଚାଳିତ ପ୍ରାରମ୍ଭିକ ରୋଗ ଜୋଖିମ ପୂର୍ବାନୁମାନ ଏବଂ ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ ଆକ୍ସେସ୍',
    heroDescription:
      'ଦୂର ଏବଂ କମ୍ ସଂଯୋଗ ଥିବା ଅଞ୍ଚଳରେ ଫ୍ରଣ୍ଟଲାଇନ୍ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଦାତାଙ୍କୁ ଡିଭାଇସରେ AI ନିର୍ଣ୍ଣୟ ଧାର୍ମିକତା ପ୍ରଦାନ କରିବା।',
    signIn: 'ସାଇନ୍ ଇନ୍',
    signUp: 'ସାଇନ୍ ଅପ୍',
    sectionTitle: 'ସମ୍ପୂର୍ଣ୍ଣ ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ ବୁଦ୍ଧିମତ୍ତା',
    sectionDescription: 'ଉଚ୍ଚ ପ୍ରଭାବ, କମ୍ ସଂଯୋଗ ଏବଂ ସହଜ ମୌଦ଼ ଗ୍ରହଣ ପାଇଁ ତିଆରି।',
    cards: [
      {
        title: 'AI ଜୋଖିମ ସ୍କ୍ରିନିଂ',
        body: 'ଡିଭାଇସରେ ଚାଲୁଥିବା ନ୍ୟୁରାଲ୍ ନେଟ୍ୱର୍କ ମଡେଲ୍‌ଗୁଡ଼ିକ ଇଣ୍ଟର୍ନେଟ୍ ବିନା ହୃଦୟ, ଡାୟାବେଟିସ୍ ଏବଂ ଶ୍ଵାସ ଜୋଖିମ ପୂର୍ବାନୁମାନ କରନ୍ତି।',
        linkText: 'ସ୍କ୍ରିନର୍ ଆରମ୍ଭ କରନ୍ତୁ →',
      },
      {
        title: 'ପ୍ରଦେଶୀୟ ଭଏସ୍ ଇନପୁଟ୍',
        body: 'ଆଞ୍ଚଳିକ ଭାଷାରେ ଲକ୍ଷଣଗୁଡ଼ିକୁ ଭୁଷଣରୁ ଟେକ୍ସଟ୍‌କୁ ପରିବର୍ତ୍ତନ କରି ଫିଲ୍ଡ ରେଜିଷ୍ଟ୍ରେସନ୍ କୁ ଶୀଘ୍ର କରେ।',
        linkText: 'ଭଏସ୍ ଆସିଷ୍ଟେଣ୍ଟ →',
      },
      {
        title: 'ଟେଲିକନସଲ୍ଟ',
        body: 'ଗ୍ରାମୀଣ କର୍ମଚାରୀଙ୍କୁ ଜିଲ୍ଲା ହସ୍ପିଟାଲ୍ ଡାକ୍ତରଙ୍କ ସହ କମ୍ ବ୍ୟାଣ୍ଡୱିଡ୍ଥ ଭିଡିଓ ଓ ଆପତ୍କାଳୀନ ସନ୍ଦେଶଦ୍ଵାରା ଯୋଡ଼େ।',
        linkText: 'ଡାକ୍ତର ସହ ଯୋଗ ଦିଅନ୍ତୁ →',
      },
      {
        title: 'ଅଡମିନ୍ ଡ୍ୟାଶବୋର୍ଡ',
        body: 'ରିୟଲ୍-ଟାଇମ୍ ରୋଗ ବିତରଣ ହୀଟ୍ ମ୍ୟାପ୍, ଗାଁ ସୁସ୍ଥ ତଥ୍ୟ, ଜୋଖିମ ବିତରଣ ବିଶ୍ଳେଷଣ ଏବଂ ଫିଲ୍ଡ୍ ସିଙ୍କ୍ ଅବସ୍ଥା।',
        linkText: 'ବିଶ୍ଳେଷଣ ଦେଖନ୍ତୁ →',
      },
    ],
    highlights: [
      { value: '100% ଅଫ୍ଲାଇନ୍', detail: 'ONNX ମୋଡେଲ୍ + Dexie DB' },
      { value: '< 50ms', detail: 'ବାସ୍ତବିକ ସମୟ AI ଇନ୍ଫେରେନ୍ସ' },
      { value: 'HIPAA / ABDM', detail: 'ଇନ୍କ୍ରିପ୍ଟେଡ୍ ଲୋକାଲ୍ ଷ୍ଟୋରେଜ୍' },
      { value: 'ASHA ପ୍ରସ୍ତୁତ', detail: 'ବହୁଭାଷା ଇଣ୍ଟରଫେସ୍' },
    ],
    footer: 'ଆରୋଗ୍ୟ ସହାୟକ — ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ AI PWA ସ୍କାଫୋଲ୍ଡ (IEMH4-HC-01)',
    footerLinks: ['ସ୍କ୍ରିନିଂ', 'ଡ୍ୟାଶବୋର୍ଡ', 'ଟେଲିକନସଲ୍ଟ'],
  },
  ml: {
    brandTitle: 'ആരോഗ്യ സഹായി',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['AI സ്ക്രീനിംഗ്', 'ഡാഷ്ബോർഡ്', 'ടെലിക്കൺസൾട്ട്'],
    status: 'ഓഫ്‌ലൈൻ PWA തയ്യാറാണ്',
    badge: 'ഭാരതത്തിലെ ASHAയും ഗ്രാമീണ ആരോഗ്യ പ്രവർത്തകരെയും ശക്തമാക്കുന്നു',
    heroTitleLine1: 'ആരോഗ്യ സഹായി',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-പ്രേരിത പ്രാരംഭ രോഗൗപാധി പ്രവചനം மற்றும் ഗ്രാമീണ ആരോഗ്യം ആക്സസ്',
    heroDescription:
      'ദൂരപ്രദേശങ്ങളിലും കുറഞ്ഞ കണക്ടിവിറ്റിയുള്ള മേഖലകളിലും മുൻനിര ആരോഗ്യപ്രദായകർക്ക് ഉപകരണത്തിൽ AI നിവേദന ബുദ്ധിമുട്ട് നൽകുന്നു.',
    signIn: 'സൈൻ ഇൻ',
    signUp: 'രജിസ്റ്റർ ചെയ്യുക',
    sectionTitle: 'സമഗ്ര ഗ്രാമീണ ആരോഗ്യ ബുദ്ധിമുട്ട്',
    sectionDescription: 'ഉയർന്ന സ്വാധീനം, കുറഞ്ഞ ബന്ധം, എളുപ്പമുള്ള ഫീൽഡ് സ്വീകരണത്തിനായി നിർമ്മിച്ചിരിക്കുന്നു.',
    cards: [
      {
        title: 'AI അപകടം സ്ക്രീനിംഗ്',
        body: 'ഉപകരണത്തിൽ പ്രവർത്തിക്കുന്ന ന്യുറൽ നെറ്റ്‌വർക്ക് മോഡലുകൾ ഇന്റർനെറ്റില്ലാതെ ഹൃദയ രോഗം, മധുമേഹം, ശ്വാസകോശ അപകടങ്ങൾ മുൻകൂട്ടി പ്രവചിക്കുന്നു.',
        linkText: 'സ്ക്രീനർ ആരംഭിക്കുക →',
      },
      {
        title: 'പ്രാദേശിക ബോയ്‌സ് ഇൻപുട്ട്',
        body: 'പ്രാദേശിക ഭാഷകളിൽ ലക്ഷണങ്ങളെ സംസാരത്തിൽ നിന്ന് എഴുത്തിലേക്ക് മാറ്റുന്നത് ഫീൽഡ് രജിസ്ട്രേഷൻ വേഗത്തിലാക്കുന്നു.',
        linkText: 'വോയ്‌സ് അസിസ്റ്റന്റ് →',
      },
      {
        title: 'ടെലിക്കൺസൾട്ട്',
        body: 'ഗ്രാമീണ പ്രവർത്തകരെ ജില്ലാ ആശുപത്രിയിലെ ഡോക്ടർമാരുമായി കുറഞ്ഞ ബാൻഡ്വിഡ്ത്ത് വീഡിയോയും അടിയന്തര സന്ദേശവിനിമയവും വഴി ബന്ധിപ്പിക്കുന്നു.',
        linkText: 'ഡോക്ടറുമായി ബന്ധപ്പെടുക →',
      },
      {
        title: 'അഡ്മിൻ ഡാഷ്ബോർഡ്',
        body: 'റിയൽ-ടൈം എപിഡെമിയോളജിക്കൽ ഹീറ്റ് മാപ്പുകൾ, ഗ്രാമ ആരോഗ്യстatis틱ുകൾ, അപകട വിതരണ വിശകലനം, ഫീൽഡ് സിങ്ക് നില.',
        linkText: 'വിശകലനം കാണുക →',
      },
    ],
    highlights: [
      { value: '100% ഓഫ്‌ലൈൻ', detail: 'ONNX മോഡൽ + Dexie DB' },
      { value: '< 50ms', detail: 'റിയൽ-ടൈം AI ഇൻഫറൻസ്' },
      { value: 'HIPAA / ABDM', detail: 'എൻക്രിപ്റ്റുചെയ്ത ലോക്കൽ സ്റ്റോറേജ്' },
      { value: 'ASHA റെഡിയാണ്', detail: 'ബഹുഭാഷാ ഇന്റർഫേസ്' },
    ],
    footer: 'ആരോഗ്യ സഹായി — ഗ്രാമീണ ആരോഗ്യ AI PWA സ്കാഫോൾഡ് (IEMH4-HC-01)',
    footerLinks: ['സ്ക്രീനിംഗ്', 'ഡാഷ്ബോർഡ്', 'ടെലിക്കൺസൾട്ട്'],
  },
  pa: {
    brandTitle: 'ਸਿਹਤ ਸਹਾਇਕ',
    brandSubtitle: 'आरोग্য सहायक',
    nav: ['ਏਆਈ ਸਕ੍ਰੀਨਿੰਗ', 'ਡੈਸ਼ਬੋਰਡ', 'ਟੈਲੀਕਨਸਲਟ'],
    status: 'ਆਫਲਾਈਨ PWA ਤਿਆਰ ਹੈ',
    badge: 'ਭਾਰਤ ਵਿੱਚ ASHA ਅਤੇ ਪੇਂਡੂ ਸਿਹਤ ਵਰਕਰਾਂ ਨੂੰ ਸਸ਼ਕਤ ਕਰਨਾ',
    heroTitleLine1: 'ਸਿਹਤ ਸਹਾਇਕ',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-ਚਲਿਤ ਸ਼ੁਰੂਆਤੀ ਬਿਮਾਰੀ ਖਤਰੇ ਦਾ ਅਨੁਮਾਨ ਅਤੇ ਪੇਂਡੂ ਸਿਹਤ ਪਹੁੰਚ',
    heroDescription:
      "ਦੂਰੀ ਅਤੇ ਘੱਟ ਕਨੈਕਟਿਵਿਟੀ ਵਾਲੇ ਖੇਤਰਾਂ ਵਿੱਚ ਫਰੰਟਲਾਈਨ ਸਿਹਤ ਪ੍ਰਦਾਤਾਂ ਨੂੰ ਡਿਵਾਈਸ 'ਤੇ ਤੇਜ਼ AI ਨਿਦਾਨੀ ਬੁੱਧੀਮੱਤਾ ਪ੍ਰਦਾਨ ਕਰਨਾ.",
    signIn: 'ਸਾਈਨ ਇਨ',
    signUp: 'ਸਾਈਨ ਅੱਪ',
    sectionTitle: 'ਵਿਆਪਕ ਪੇਂਡੂ ਸਿਹਤ ਬੁੱਧੀਮत्ता',
    sectionDescription: 'ਉੱਚ ਪ੍ਰਭਾਵ, ਘੱਟ ਕਨੈਕਟਿਵਿਟੀ ਅਤੇ ਆਸਾਨ ਫੀਲਡ ਅਪਣਾਉਣ ਲਈ ਬਣਾਇਆ ਗਿਆ।',
    cards: [
      {
        title: 'AI ਖਤਰਾ ਸਕ੍ਰੀਨਿੰਗ',
        body: "ਡਿਵਾਈਸ 'ਤੇ ਚੱਲ ਰਹੇ ਨਿਊਰਲ ਨੈੱਟਵਰਕ ਮਾਡਲ ਇੰਟਰਨੈੱਟ ਬਿਨਾਂ ਦਿਲ, ਡਾਇਬਟੀਜ਼ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿਚ ਸਮੱਸਿਆ ਦੇ ਜੋਖਮ ਨੂੰ ਅਨੁਮਾਨ ਲਗਾਉਂਦੇ ਹਨ.",
        linkText: 'ਸਕ੍ਰੀਨਰ ਸ਼ੁਰੂ ਕਰੋ →',
      },
      {
        title: 'ਪ੍ਰਾਂਤੀਕ ਵੌਇਸ ਇਨਪੁਟ',
        body: 'ਖੇਤਰੀ ਬੋਲੀਆਂ ਵਿੱਚ ਲੱਛਣਾਂ ਨੂੰ ਸਪੀਚ ਤੋਂ ਟੈਕਸਟ ਵਿੱਚ ਬਦਲਣਾ ਫੀਲਡ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨੂੰ ਤੇਜ਼ ਕਰਦਾ ਹੈ.',
        linkText: 'ਵੌਇਸ ਅਸੀਸਟੈਂਟ →',
      },
      {
        title: 'ਟੈਲੀਕਨਸਲਟ',
        body: 'ਪੇਂਡੂ ਵਰਕਰਾਂ ਨੂੰ ਜਿਲ੍ਹਾ ਹਸਪਤਾਲ ਡਾਕਟਰਾਂ ਨਾਲ ਘੱਟ ਬੈਂਡਵਿਡਥ ਵੀਡੀਓ ਅਤੇ ਐਮਰਜੈਂਸੀ ਸੁਨੇਹਿਆਂ ਰਾਹੀਂ ਜੋੜਦਾ ਹੈ.',
        linkText: 'ਡਾਕਟਰ ਨਾਲ ਜੁੜੋ →',
      },
      {
        title: 'ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ',
        body: 'ਰੇਅਲ-ਟਾਈਮ ਮਿਆਰੀ ਰੋਗ ਹਿੱਟਮੈਪ, ਪੇਂਡੂ ਸਿਹਤ ਅੰਕੜੇ, ਖਤਰਾ ਵੰਡ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਫੀਲਡ ਸਿੰਕ ਸਥਿਤੀ.',
        linkText: 'ਵਿਸ਼ਲੇਸ਼ਣ ਦੇਖੋ →',
      },
    ],
    highlights: [
      { value: '100% ਆਫਲਾਈਨ', detail: 'ONNX ਮਾਡਲ + Dexie DB' },
      { value: '< 50ms', detail: 'ਰੇਅਲ-ਟਾਈਮ AI ਇੰਫਰੰਸ' },
      { value: 'HIPAA / ABDM', detail: 'ਕੋਡ ਕੀਤਾ ਸਥਾਨਕ ਸਟੋਰੇਜ' },
      { value: 'ASHA ਤਿਆਰ', detail: 'ਬਹੁਭਾਸ਼ੀ ਇੰਟਰਫੇਸ' },
    ],
    footer: 'ਸਿਹਤ ਸਹਾਇਕ — ਪੇਂਡੂ ਸਿਹਤ AI PWA ਸਕੈਫੋਲਡ (IEMH4-HC-01)',
    footerLinks: ['ਸਕ੍ਰੀਨਿੰਗ', 'ਡੈਸ਼ਬੋਰਡ', 'ਟੈਲੀਕਨਸਲਟ'],
  },
};

const LOCALIZED_ROLES: Record<string, string[]> = {
  'en': ['Patient Mode', 'ASHA Worker', 'PHC Center', 'App Admin'],
  'hi': ['रोगी मोड', 'आशा वर्कर', 'PHC केंद्र', 'ऐप एडमिन'],
  'bn': ['রোগী মোড', 'আশা কর্মী', 'PHC কেন্দ্র', 'অ্যাপ অ্যাডমিন'],
  'te': ['రోగి మోడ్', 'ఆశా వర్కర్', 'PHC కేంద్రం', 'యాప్ అడ్మిన్'],
  'mr': ['रुग्ण मोड', 'आशा वर्कर', 'PHC केंद्र', 'अॅप अॅडमिन'],
  'ta': ['நோயாளி முறை', 'ஆஷா பணியாளர்', 'PHC மையம்', 'பயன்பாட்டு நிர்வாகி'],
  'gu': ['દર્દી મોડ', 'આશા વર્કર', 'PHC કેન્દ્ર', 'એપ એડમિન'],
  'ur': ['مریض موڈ', 'آشا ورکر', 'پی ایچ سی سینٹر', 'ایپ ایڈمن'],
  'kn': ['ರೋಗಿ ಮೋಡ್', 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ', 'PHC ಕೇಂದ್ರ', 'ಆಪ್ ಅಡ್ಮಿನ್'],
  'or': ['ରୋଗୀ ମୋଡ୍', 'ଆଶା କର୍ମୀ', 'PHC କେନ୍ଦ୍ର', 'ଆପ୍ ଆଡମିନ୍'],
  'ml': ['രോഗി മോഡ്', 'ആശാ വർക്കർ', 'PHC കേന്ദ്രം', 'ആപ്പ് അഡ്മിൻ'],
  'pa': ['ਮਰੀਜ਼ ਮੋਡ', 'ਆਸ਼ਾ ਵਰਕਰ', 'PHC ਕੇਂਦਰ', 'ਐਪ ਐਡਮਿਨ'],
};

export default function HomePage() {
  const { language, setLanguage } = useAuthStore();

  const shortLang = language.split('-')[0];
  const copy = (content as any)[shortLang] || content.en;
  const roles = LOCALIZED_ROLES[shortLang] || LOCALIZED_ROLES['en'];

  useEffect(() => {
    document.documentElement.lang = language || 'en';
  }, [language]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans mesh-backdrop">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" aria-hidden="true" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HeartPulse className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                {copy.brandTitle}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <Link href="/screening" className="hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md px-2 py-1">
              {copy.nav[0]}
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md px-2 py-1">
              {copy.nav[1]}
            </Link>
            <Link href="/teleconsult" className="hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md px-2 py-1">
              {copy.nav[2]}
            </Link>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector />
            <Link href="/auth/login" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-2.5 py-1.5 transition-colors">
              {copy.signIn}
            </Link>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-tech flex-shrink-0">
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                {copy.status}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex-shrink-0">
                Beta
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <section className="text-center py-12 md:py-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md font-mono-tech">
            <BrainCircuit className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            {copy.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {copy.heroTitleLine1}
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-indigo-200/90 mb-4">
            {copy.heroSubtitle}
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {copy.heroDescription}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              href="/auth/login?role=patient"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-indigo-500/20 hover:border-indigo-500/60 transition-colors transition-transform duration-200 hover:-translate-y-1 hover:bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-indigo-400" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg text-white">{roles[0]}</span>
            </Link>

            <Link
              href="/auth/login?role=asha"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-emerald-500/20 hover:border-emerald-500/60 transition-colors transition-transform duration-200 hover:-translate-y-1 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartPulse className="w-7 h-7 text-emerald-400" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg text-white">{roles[1]}</span>
            </Link>

            <Link
              href="/auth/login?role=phc"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-amber-500/20 hover:border-amber-500/60 transition-colors transition-transform duration-200 hover:-translate-y-1 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Hospital className="w-7 h-7 text-amber-400" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg text-white">{roles[2]}</span>
            </Link>

            <Link
              href="/auth/login?role=admin"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-rose-500/20 hover:border-rose-500/60 transition-colors transition-transform duration-200 hover:-translate-y-1 hover:bg-rose-500/10 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7 text-rose-400" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg text-white">{roles[3]}</span>
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {copy.sectionTitle}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              {copy.sectionDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.cards.map((card: any, index: number) => {
              const cardStyles = [
                'bg-indigo-600/20 text-indigo-400',
                'bg-violet-600/20 text-violet-400',
                'bg-emerald-600/20 text-emerald-400',
                'bg-amber-600/20 text-amber-400',
              ];
              const linkStyles = [
                'text-indigo-400 hover:text-indigo-300',
                'text-violet-400 hover:text-violet-300',
                'text-emerald-400 hover:text-emerald-300',
                'text-amber-400 hover:text-amber-300',
              ];
              const hrefs = ['/screening', '/screening', '/teleconsult', '/dashboard'];
              const icons = [Stethoscope, Mic, Video, LayoutDashboard];

              const Icon = icons[index];

              return (
                <div key={card.title} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className={`w-12 h-12 rounded-xl ${cardStyles[index]} flex items-center justify-center mb-5 group-hover:bg-slate-900/70 transition-colors duration-200`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{card.body}</p>
                  <Link href={hrefs[index]} className={`inline-flex items-center text-xs font-semibold ${linkStyles[index]} group-hover:translate-x-1 transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1`}>
                    {card.linkText}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 glass p-8 rounded-3xl border border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {copy.highlights.map((item: any, index: number) => {
              const iconStyles = [
                'bg-indigo-500/10 text-indigo-400',
                'bg-emerald-500/10 text-emerald-400',
                'bg-violet-500/10 text-violet-400',
                'bg-amber-500/10 text-amber-400',
              ];
              const icons = [WifiOff, Zap, ShieldCheck, Users];
              const Icon = icons[index];

              return (
                <div key={item.value} className="p-4">
                  <div className={`inline-flex p-3 rounded-xl ${iconStyles[index]} mb-3`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-mono-tech tabular-nums">{item.value}</div>
                  <div className="text-xs text-slate-400 mt-1 font-mono-tech">{item.detail}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 glass py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>{copy.footer}</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <Link href="/screening" className="hover:text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1">{copy.footerLinks[0]}</Link>
            <Link href="/dashboard" className="hover:text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1">{copy.footerLinks[1]}</Link>
            <Link href="/teleconsult" className="hover:text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1">{copy.footerLinks[2]}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
