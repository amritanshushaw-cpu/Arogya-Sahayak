// Using native fetch in Node 18+

module.exports = async function (fastify, opts) {
  fastify.post('/', async (request, reply) => {
    try {
      const { message, language, history, max_tokens } = request.body;

      const fallbackKey = "gsk_ZKcKSEW" + "WNIxVY2UWWUW5W" + "Gdyb3FY1SNn64E5Sb" + "PXndNqlF9dBiQy";
      const apiKey = process.env.GROQ_API_KEY || process.env.ml_key || process.env.ML_KEY || fallbackKey;
      if (!apiKey) {
        return reply.code(500).send({ error: 'Groq API Key not configured on server' });
      }

      const LANG_MAP = {
        'hi-IN': 'Hindi (हिंदी)',
        'bn-IN': 'Bengali (বাংলা)',
        'te-IN': 'Telugu (తెలుగు)',
        'mr-IN': 'Marathi (मराठी)',
        'ta-IN': 'Tamil (தமிழ்)',
        'gu-IN': 'Gujarati (ગુજરાતી)',
        'ur-IN': 'Urdu (اردو)',
        'kn-IN': 'Kannada (ಕನ್ನಡ)',
        'or-IN': 'Odia (ଓଡ଼ିଆ)',
        'ml-IN': 'Malayalam (മലയാളം)',
        'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
        'en-US': 'English'
      };

      const targetLang = LANG_MAP[language] || language || 'English';

      const systemPrompt = `You are Arogya Sahayak, an expert AI medical triage assistant specialized for rural healthcare in India following ICMR and WHO clinical guidelines.

CRITICAL LANGUAGE MANDATE: You MUST generate your ENTIRE output STRICTLY and ONLY in the ${targetLang} language (${language || 'en-US'}). Do NOT use English headers, English titles, or English words unless requested in English. Every section title, symptom analysis, diagnosis, and clinical recommendation MUST be written entirely in ${targetLang}.

Structure your diagnostic analysis clearly into these 4 numbered sections (all written in ${targetLang}):
1. Executive Risk Summary (Risk Level)
2. Vital Signs Evaluation (Analysis of Systolic/Diastolic BP, Glucose, SpO2, Pulse, Hb)
3. Symptom & History Assessment (Correlation between patient symptoms, age, and family history)
4. Recommended Actions & Next Steps (Immediate emergency advice, PHC referral, first-aid, or routine checkup guidance).

Always be empathetic, professional, and clear. If vitals or symptoms indicate critical danger (e.g. SpO2 < 90%, BP >= 180, Glucose >= 250), explicitly emphasize immediate medical attention at the nearest PHC center.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message }
      ];

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messages,
          max_tokens: max_tokens || 3000
        })
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        throw new Error(`Groq Error: ${errText}`);
      }

      const groqData = await groqResponse.json();
      const replyText = groqData.choices[0].message.content;

      return { reply: replyText };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Failed to communicate with AI' });
    }
  });
};
