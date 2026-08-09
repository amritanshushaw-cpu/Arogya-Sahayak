"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Mic, MicOff, Globe, Activity, Send, Loader2, User, HeartPulse, FileText, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

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

const UI_TRANS: any = {
  'en-US': { 
    tab1: 'Basic Information', tab2: 'Vitals & Symptoms', tab3: 'Disease Detection', 
    save: 'Save Information', analyze: 'Analyze Vitals',
    header1: 'Patient Details & History', sub1: 'Please provide your details before recording vitals.',
    age: 'Age', gender: 'Gender', male: 'Male', female: 'Female', other: 'Other',
    location: 'Village / Location', locPlaceholder: 'Enter location or use auto-fetch',
    getLocation: 'Get Location', locating: 'Locating...',
    history: 'Family Disease History', historyPlaceholder: 'E.g. Diabetes, Hypertension in parents...',
    saveAndContinue: 'Save Information & Continue',
    header2: 'Patient Vitals', sub2: 'Record symptoms via audio to autofill parameters, or type manually.',
    languageLabel: 'Audio & UI Language', recordPlaceholder: 'Speak to record your symptoms, or type here...',
    record: 'Record', stop: 'Stop', autofill: 'Autofill Params',
    sys: 'BP Systolic', dia: 'BP Diastolic', glucose: 'Glucose (mg/dL)', temp: 'Temp (°F)', pulse: 'Pulse (bpm)', spo2: 'SpO2 (%)', weight: 'Weight (kg)', height: 'Height (cm)',
    analyzeBtn: 'Analyze Health Risk', header3: 'Disease Detection Results', sub3: 'AI analysis based on your info and vitals.',
    listen: 'Listen to Result', analyzing: 'Analyzing Health Data', processing: 'Processing with ML models...', audioFailed: 'Audio playback failed.', audioStopped: 'Audio playback stopped.'
  },
  'hi-IN': { 
    tab1: 'मूल जानकारी', tab2: 'वाइटल्स और लक्षण', tab3: 'रोग का पता लगाना', 
    save: 'जानकारी सहेजें', analyze: 'वाइटल्स का विश्लेषण करें',
    header1: 'मरीज का विवरण और इतिहास', sub1: 'कृपया वाइटल्स दर्ज करने से पहले अपना विवरण प्रदान करें।',
    age: 'आयु', gender: 'लिंग', male: 'पुरुष', female: 'महिला', other: 'अन्य',
    location: 'गाँव / स्थान', locPlaceholder: 'स्थान दर्ज करें',
    getLocation: 'स्थान प्राप्त करें', locating: 'खोज रहा है...',
    history: 'पारिवारिक बीमारी का इतिहास', historyPlaceholder: 'उदा. माता-पिता में मधुमेह...',
    saveAndContinue: 'जानकारी सहेजें और आगे बढ़ें',
    header2: 'मरीज के वाइटल्स', sub2: 'लक्षण रिकॉर्ड करने के लिए बोलें, या टाइप करें।',
    languageLabel: 'भाषा', recordPlaceholder: 'अपने लक्षण रिकॉर्ड करने के लिए बोलें...',
    record: 'रिकॉर्ड करें', stop: 'रोकें', autofill: 'स्वतः भरें',
    sys: 'बीपी सिस्टोलिक', dia: 'बीपी डायस्टोलिक', glucose: 'ग्लूकोज (mg/dL)', temp: 'तापमान (°F)', pulse: 'पल्स (bpm)', spo2: 'SpO2 (%)', weight: 'वजन (kg)', height: 'ऊंचाई (cm)',
    analyzeBtn: 'स्वास्थ्य जोखिम का विश्लेषण करें', header3: 'रोग पहचान परिणाम', sub3: 'एआई विश्लेषण।',
    listen: 'परिणाम सुनें', analyzing: 'विश्लेषण कर रहा है', processing: 'एमएल मॉडल के साथ प्रसंस्करण...', audioFailed: 'ऑडियो विफल रहा।', audioStopped: 'ऑडियो प्लेबैक रोक दिया गया।'
  },
  'bn-IN': { tab1: 'প্রাথমিক তথ্য', tab2: 'ভাইটালস ও লক্ষণ', tab3: 'রোগ সনাক্তকরণ', save: 'তথ্য সংরক্ষণ করুন', analyze: 'ভাইটালস বিশ্লেষণ করুন' },
  'te-IN': { tab1: 'ప్రాథమిక సమాచారం', tab2: 'లక్షణాలు', tab3: 'వ్యాధి గుర్తింపు', save: 'సమాచారం భద్రపరుచు', analyze: 'విశ్లేషించండి' },
  'mr-IN': { tab1: 'मूलभूत माहिती', tab2: 'लक्षणे', tab3: 'रोगनिदान', save: 'माहिती जतन करा', analyze: 'विश्लेषण करा' },
  'ta-IN': { tab1: 'அடிப்படை தகவல்', tab2: 'அறிகுறிகள்', tab3: 'நோய் கண்டறிதல்', save: 'தகவலை சேமி', analyze: 'பகுப்பாய்வு செய்' },
  'gu-IN': { tab1: 'મૂળભૂત માહિતી', tab2: 'લક્ષણો', tab3: 'રોગ નિદાન', save: 'માહિતી સાચવો', analyze: 'વિશ્લેષણ કરો' },
  'ur-IN': { tab1: 'بنیادی معلومات', tab2: 'علامات', tab3: 'بیماری کی تشخیص', save: 'معلومات محفوظ کریں', analyze: 'تجزیہ کریں' },
  'kn-IN': { tab1: 'ಮೂಲ ಮಾಹಿತಿ', tab2: 'ಲಕ್ಷಣಗಳು', tab3: 'ರೋಗ ಪತ್ತೆ', save: 'ಮಾಹಿತಿ ಉಳಿಸಿ', analyze: 'ವಿಶ್ಲೇಷಿಸಿ' },
  'or-IN': { tab1: 'ମୌଳିକ ସୂଚନା', tab2: 'ଲକ୍ଷଣ', tab3: 'ରୋଗ ନିର୍ଣ୍ଣୟ', save: 'ସୂଚନା ସଂରକ୍ଷଣ କରନ୍ତୁ', analyze: 'ବିଶ୍ଳେଷଣ କରନ୍ତୁ' },
  'ml-IN': { tab1: 'അടിസ്ഥാന വിവരങ്ങൾ', tab2: 'ലക്ഷണങ്ങൾ', tab3: 'രോഗ നിർണയം', save: 'വിവരങ്ങൾ സംരക്ഷിക്കുക', analyze: 'വിശകലനം ചെയ്യുക' },
  'pa-IN': { tab1: 'ਮੁੱਢਲੀ ਜਾਣਕਾਰੀ', tab2: 'ਲੱਛਣ', tab3: 'ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ', save: 'ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਕਰੋ', analyze: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' },
};

export default function PatientDashboard() {
  const { token, user, language, setLanguage } = useAuthStore();
  const [step, setStep] = useState<'info' | 'vitals' | 'detection'>('info');

  // Info State
  const [infoForm, setInfoForm] = useState({
    age: '',
    gender: 'Male',
    village: '',
    familyHistory: ''
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Vitals State
  const [vitalsForm, setVitalsForm] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    blood_glucose: '',
    temperature: '',
    pulse: '',
    spo2: '',
    weight: '',
    height: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Detection State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up speech synthesis when component unmounts or step changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakResult = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error(UI_TRANS[language]?.audioFailed || 'Audio playback is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast(UI_TRANS[language]?.audioStopped || 'Audio playback stopped.', { icon: 'ℹ️' });
      return;
    }

    if (!analysisResult) {
      toast.error('No analysis result to read out.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    // Format clean text for text-to-speech engine
    const textToSpeak = analysisResult
      .replace(/[*#_`]/g, '')
      .replace(/\[Offline Diagnostic Model\]/g, 'Diagnostic Summary.')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (err) => {
      // Do not display failure toast if speech was deliberately stopped/canceled
      if (err.error === 'interrupted' || err.error === 'canceled') {
        setIsSpeaking(false);
        return;
      }
      console.error('Speech synthesis error:', err);
      setIsSpeaking(false);
      toast.error(UI_TRANS[language]?.audioFailed || 'Audio playback failed.');
    };

    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language; // IMPORTANT: Set initial language

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  // Update speech recognition language when user changes dropdown
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let placeName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const { village, town, city, suburb, county, state_district, state } = data.address;
              const place = village || town || city || suburb || state_district || county;
              if (place && state) {
                placeName = `${place}, ${state}`;
              } else if (place) {
                placeName = place;
              } else if (data.display_name) {
                placeName = data.display_name.split(',').slice(0, 2).join(',').trim();
              }
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding failed:', e);
        }
        setInfoForm(prev => ({ ...prev, village: placeName }));
        toast.success(`Location acquired: ${placeName}`);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoForm.age || !infoForm.village) {
      toast.error('Please fill in age and village/location');
      return;
    }

    try {
      const payload = {
        name: user?.name || 'Patient',
        age: Number(infoForm.age),
        gender: infoForm.gender,
        village: infoForm.village,
        family_history: infoForm.familyHistory
      };

      const res = await fetch(`${apiUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const patientData = await res.json();
        setCreatedPatientId(patientData.id);
        toast.success('Information saved successfully!');
        setInfoSaved(true);
        setStep('vitals');
      } else {
        toast.error('Failed to save information');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error');
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const autofillVitals = async () => {
    if (!transcript.trim()) {
      toast.error('Please record audio first before autofilling.');
      return;
    }
    
    setIsAutofilling(true);
    try {
      const prompt = `Extract vitals from this text and return ONLY a valid JSON object. Keys must be exactly: bp_systolic, bp_diastolic, blood_glucose, temperature, pulse, spo2, weight, height. If a value is missing, set it to an empty string "". Text: "${transcript}"`;
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const textReply = data.reply || data.response || data.answer || "{}";
        const jsonMatch = textReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setVitalsForm(prev => ({ ...prev, ...parsed }));
          toast.success('Vitals autofilled successfully!');
        } else {
          toast.error('Could not extract vitals perfectly.');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Autofill failed. Check network or type manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

  const submitVitals = () => {
    if (!transcript.trim() && !vitalsForm.temperature && !vitalsForm.bp_systolic) {
      toast.error('Please record your symptoms or enter your vitals');
      return;
    }
    setStep('detection');
    analyzeData();
  };

  const analyzeData = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Calculate deterministic risk level for backend
    let riskScore = 0;
    let conditions = [];
    let advice = [];
    const lowerTranscript = transcript.toLowerCase();
    
    const glucose = Number(vitalsForm.blood_glucose);
    const sys = Number(vitalsForm.bp_systolic);
    const dia = Number(vitalsForm.bp_diastolic);
    const temp = Number(vitalsForm.temperature);
    
    if (lowerTranscript.includes('sugar') || lowerTranscript.includes('diabetes') || glucose > 140) {
      riskScore += 30;
      conditions.push('Elevated Blood Sugar (Diabetes Risk)');
      advice.push('Reduce sugar intake and schedule a fasting blood glucose test.');
    }
    if (lowerTranscript.includes('pressure') || lowerTranscript.includes('bp') || sys > 140 || dia > 90) {
      riskScore += 30;
      conditions.push('High Blood Pressure (Hypertension)');
      advice.push('Reduce salt intake, monitor BP daily, and avoid stress.');
    }
    if (lowerTranscript.includes('fever') || lowerTranscript.includes('temperature') || temp > 99.5) {
      riskScore += 20;
      conditions.push('Fever / Possible Infection');
      advice.push('Rest, stay hydrated, and monitor temperature.');
    }
    if (lowerTranscript.includes('chest') || lowerTranscript.includes('pain') || lowerTranscript.includes('breath')) {
      riskScore += 40;
      conditions.push('Cardiovascular Symptoms');
      advice.push('URGENT: Seek immediate medical attention at the nearest PHC.');
    }
    
    let level = 'LOW RISK';
    let alertLevel = 'GREEN_ALERT';
    let summary = 'Your vitals appear stable based on the provided parameters.';
    if (riskScore >= 50) {
      level = 'HIGH RISK (RED ALERT)';
      alertLevel = 'RED_ALERT';
      summary = 'Critical abnormalities detected. Immediate medical consultation is required.';
    } else if (riskScore > 0) {
      level = 'MODERATE RISK (YELLOW ALERT)';
      alertLevel = 'YELLOW_ALERT';
      summary = 'Some irregularities found. Please schedule a routine checkup soon.';
    }
    
    let finalDiagnosisText = '';
    
    try {
      const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      const vitalsString = JSON.stringify(vitalsForm);
      const prompt = `Act as a medical risk analyzer. Patient Age: ${infoForm.age}, Gender: ${infoForm.gender}, Family History: ${infoForm.familyHistory}. Patient Vitals entered: ${vitalsString}. Patient Symptoms Audio Transcript: "${transcript}". Provide a detailed disease detection analysis and risk assessment. YOU MUST OUTPUT ENTIRELY IN THIS LANGUAGE: ${langName}.`;

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          language: language,
          max_tokens: 1024
        })
      });

      if (response.ok) {
        const data = await response.json();
        finalDiagnosisText = data.reply || data.response || data.answer || "Analysis complete.";
        setAnalysisResult(finalDiagnosisText);
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Network error or AI unavailable');
      }
    } catch (error) {
      console.error('Online LLM failed, using offline math model', error);
      
      const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      
      const diagnosisText = `[Offline Diagnostic Model]

Risk Assessment: ${level}
Summary: ${summary}

Detected Flags:
${conditions.length > 0 ? conditions.map(c => '- ' + c).join('\n') : '- No major flags detected in basic parameters.'}

Recommended Action:
${advice.length > 0 ? advice.map(a => '- ' + a).join('\n') : '- Maintain a healthy diet and regular exercise.'}

(Note: Online AI failed: ${error instanceof Error ? error.message : 'Unreachable'}. This is an inbuilt deterministic assessment. Translated for: ${langName})`;

      // Translate the offline diagnostic string if not English
      const targetLang = language.split('-')[0];
      if (targetLang !== 'en') {
        try {
          const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(diagnosisText)}`;
          const transRes = await fetch(transUrl);
          const transData = await transRes.json();
          let translatedText = '';
          transData[0].forEach((t: any) => {
            translatedText += t[0];
          });
          finalDiagnosisText = translatedText;
          setAnalysisResult(translatedText);
        } catch (transErr) {
          console.error("Translation API failed", transErr);
          finalDiagnosisText = diagnosisText;
          setAnalysisResult(diagnosisText);
        }
      } else {
        finalDiagnosisText = diagnosisText;
        setAnalysisResult(diagnosisText);
      }
    }
    
    // SAVE TO BACKEND PHC DATABASE
    if (createdPatientId) {
      try {
        const screeningPayload = {
          patient_id: createdPatientId,
          bp_systolic: sys || 0,
          bp_diastolic: dia || 0,
          blood_glucose: glucose || 0,
          temperature: temp || 0,
          pulse: Number(vitalsForm.pulse) || 0,
          spo2: Number(vitalsForm.spo2) || 0,
          weight: Number(vitalsForm.weight) || 0,
          height: Number(vitalsForm.height) || 0,
          risk_level: alertLevel,
          risk_explanation: JSON.stringify({ ai_summary: finalDiagnosisText }),
          symptoms: transcript ? [transcript] : []
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        await fetch(`${apiUrl}/api/screenings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(screeningPayload)
        });
        
        if (alertLevel !== 'GREEN_ALERT') {
          toast.success('Alert routed to nearest PHC automatically.');
        }
      } catch (err) {
        console.error('Failed to sync to PHC', err);
      }
    }
    
    setIsAnalyzing(false);
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitalsForm({ ...vitalsForm, [e.target.name]: e.target.value });
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/10 gap-2">
          <button 
            onClick={() => setStep('info')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'info' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            1. {UI_TRANS[language]?.tab1 || UI_TRANS['en-US'].tab1}
          </button>
          <button 
            onClick={() => infoSaved && setStep('vitals')}
            disabled={!infoSaved}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'vitals' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : infoSaved ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'}`}
          >
            2. {UI_TRANS[language]?.tab2 || UI_TRANS['en-US'].tab2}
          </button>
          <button 
            onClick={() => (infoSaved && (transcript || vitalsForm.temperature)) && setStep('detection')}
            disabled={!infoSaved || (!transcript && !vitalsForm.temperature)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'detection' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : infoSaved && (transcript || vitalsForm.temperature) ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'}`}
          >
            3. {UI_TRANS[language]?.tab3 || UI_TRANS['en-US'].tab3}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          {/* STEP 1: INFO */}
          {step === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" /> {UI_TRANS[language]?.header1 || UI_TRANS['en-US'].header1}
                </h2>
                <p className="text-slate-400">{UI_TRANS[language]?.sub1 || UI_TRANS['en-US'].sub1}</p>
              </header>

              <form onSubmit={handleInfoSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{UI_TRANS[language]?.age || UI_TRANS['en-US'].age}</label>
                    <input 
                      type="number" 
                      required
                      value={infoForm.age}
                      onChange={e => setInfoForm({...infoForm, age: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{UI_TRANS[language]?.gender || UI_TRANS['en-US'].gender}</label>
                    <select 
                      value={infoForm.gender}
                      onChange={e => setInfoForm({...infoForm, gender: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option>{UI_TRANS[language]?.male || UI_TRANS['en-US'].male}</option>
                      <option>{UI_TRANS[language]?.female || UI_TRANS['en-US'].female}</option>
                      <option>{UI_TRANS[language]?.other || UI_TRANS['en-US'].other}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">{UI_TRANS[language]?.location || UI_TRANS['en-US'].location}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={infoForm.village}
                      onChange={e => setInfoForm({...infoForm, village: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder={UI_TRANS[language]?.locPlaceholder || UI_TRANS['en-US'].locPlaceholder}
                    />
                    <button 
                      type="button" 
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      {locating ? UI_TRANS[language]?.locating || UI_TRANS['en-US'].locating : UI_TRANS[language]?.getLocation || UI_TRANS['en-US'].getLocation}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">{UI_TRANS[language]?.history || UI_TRANS['en-US'].history}</label>
                  <textarea 
                    rows={3}
                    placeholder={UI_TRANS[language]?.historyPlaceholder || UI_TRANS['en-US'].historyPlaceholder}
                    value={infoForm.familyHistory}
                    onChange={e => setInfoForm({...infoForm, familyHistory: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mt-6">
                  {UI_TRANS[language]?.saveAndContinue || UI_TRANS['en-US'].saveAndContinue}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VITALS */}
          {step === 'vitals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              <header className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-pink-400" /> {UI_TRANS[language]?.header2 || UI_TRANS['en-US'].header2}
                  </h2>
                  <p className="text-slate-400">{UI_TRANS[language]?.sub2 || UI_TRANS['en-US'].sub2}</p>
                </div>
                
                <div className="w-64">
                  <label className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4" /> {UI_TRANS[language]?.languageLabel || UI_TRANS['en-US'].languageLabel}
                  </label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Audio Recording & Transcript */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[200px] relative">
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder={UI_TRANS[language]?.recordPlaceholder || UI_TRANS['en-US'].recordPlaceholder}
                      className="w-full h-full bg-transparent text-white resize-none outline-none placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleRecording}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                        isRecording 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isRecording ? <><MicOff className="w-5 h-5" /> {UI_TRANS[language]?.stop || UI_TRANS['en-US'].stop}</> : <><Mic className="w-5 h-5" /> {UI_TRANS[language]?.record || UI_TRANS['en-US'].record}</>}
                    </button>
                    <button 
                      onClick={autofillVitals}
                      disabled={!transcript || isAutofilling}
                      className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isAutofilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {UI_TRANS[language]?.autofill || UI_TRANS['en-US'].autofill}
                    </button>
                  </div>
                </div>

                {/* Vitals Parameters Grid */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4 content-start">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.sys || UI_TRANS['en-US'].sys}</label>
                    <input type="number" name="bp_systolic" value={vitalsForm.bp_systolic} onChange={handleVitalChange} placeholder="120" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.dia || UI_TRANS['en-US'].dia}</label>
                    <input type="number" name="bp_diastolic" value={vitalsForm.bp_diastolic} onChange={handleVitalChange} placeholder="80" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.glucose || UI_TRANS['en-US'].glucose}</label>
                    <input type="number" name="blood_glucose" value={vitalsForm.blood_glucose} onChange={handleVitalChange} placeholder="95" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.temp || UI_TRANS['en-US'].temp}</label>
                    <input type="number" name="temperature" value={vitalsForm.temperature} onChange={handleVitalChange} placeholder="98.6" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.pulse || UI_TRANS['en-US'].pulse}</label>
                    <input type="number" name="pulse" value={vitalsForm.pulse} onChange={handleVitalChange} placeholder="72" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.spo2 || UI_TRANS['en-US'].spo2}</label>
                    <input type="number" name="spo2" value={vitalsForm.spo2} onChange={handleVitalChange} placeholder="98" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.weight || UI_TRANS['en-US'].weight}</label>
                    <input type="number" name="weight" value={vitalsForm.weight} onChange={handleVitalChange} placeholder="70" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{UI_TRANS[language]?.height || UI_TRANS['en-US'].height}</label>
                    <input type="number" name="height" value={vitalsForm.height} onChange={handleVitalChange} placeholder="170" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                </div>

              </div>

              <button 
                onClick={submitVitals}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-auto"
              >
                {UI_TRANS[language]?.analyzeBtn || UI_TRANS['en-US'].analyzeBtn} <Send className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: DETECTION */}
          {step === 'detection' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-green-400" /> {UI_TRANS[language]?.header3 || UI_TRANS['en-US'].header3}
                  </h2>
                  <p className="text-slate-400">{UI_TRANS[language]?.sub3 || UI_TRANS['en-US'].sub3}</p>
                </div>
                {!isAnalyzing && analysisResult && (
                  <button 
                    onClick={speakResult}
                    className={`py-2 px-4 rounded-xl font-medium transition-all flex items-center gap-2 text-white shadow-lg ${
                      isSpeaking 
                        ? 'bg-rose-600 hover:bg-rose-700 animate-pulse shadow-rose-500/30 ring-2 ring-rose-400/50' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                    }`}
                  >
                    {isSpeaking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Stop Audio' : (UI_TRANS[language]?.listen || UI_TRANS['en-US'].listen)}</span>
                  </button>
                )}
              </header>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{UI_TRANS[language]?.analyzing || UI_TRANS['en-US'].analyzing}</h3>
                  <p className="text-slate-400">{UI_TRANS[language]?.processing || UI_TRANS['en-US'].processing}</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 whitespace-pre-wrap text-slate-300 leading-relaxed min-h-[250px] max-h-[550px] overflow-y-auto custom-scrollbar">
                  {analysisResult}
                </div>
              )}
              
              {!isAnalyzing && (
                <button 
                  onClick={() => setStep('vitals')}
                  className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Record Again
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
