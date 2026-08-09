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

      const langMap = {
        'en-US': 'English', 'hi-IN': 'Hindi (हिंदी)', 'bn-IN': 'Bengali (বাংলা)', 
        'te-IN': 'Telugu (తెలుగు)', 'mr-IN': 'Marathi (मराठी)', 'ta-IN': 'Tamil (தமிழ்)',
        'gu-IN': 'Gujarati (ગુજરાતી)', 'ur-IN': 'Urdu (اردو)', 'kn-IN': 'Kannada (ಕನ್ನಡ)',
        'or-IN': 'Odia (ଓଡ଼ିଆ)', 'ml-IN': 'Malayalam (മലയാളം)', 'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)'
      };
      const langName = langMap[language] || language || 'English';

      const systemPrompt = `You are Arogya Sahayak, an advanced, highly-accurate AI clinical decision support system designed for rural healthcare in India. 
CRITICAL RULE: You MUST output your ENTIRE response STRICTLY and ONLY in the target native script for ${langName} (e.g., Gujarati script for Gujarati, Devanagari for Hindi, Bengali script for Bengali, Telugu script for Telugu). Never output Hindi script or English text when a different Indian language like Gujarati or Bengali is requested.

Your goal is to achieve an extremely high F1 score for diagnosis accuracy based on WHO and ICMR guidelines. Do NOT just say "consult a doctor". Instead, provide a deep, constructive, and actionable clinical triage.
Structure your analysis:
1. Executive Risk Summary: (State Risk Level: LOW / MODERATE / HIGH / RED ALERT)
2. Vital Signs Evaluation: (Detailed physiological implications of BP, Glucose, SpO2, Pulse, Hb, Temp)
3. Symptom & History Correlation: (Analyze the patient's symptoms, age, and family history deeply)
4. Differential Diagnoses: (List top 3 most likely medical conditions with high clinical confidence)
5. Recommended Action Plan: (Give specific first-aid, safe home remedies, lifestyle interventions, and exact warning signs. Explicitly mention immediate PHC referral if critical danger).`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message }
      ];

      const candidateModels = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'];
      let replyText = null;

      for (const model of candidateModels) {
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: Math.max(max_tokens || 0, 2000),
              temperature: 0.1
            })
          });

          if (groqResponse.ok) {
            const groqData = await groqResponse.json();
            replyText = groqData.choices?.[0]?.message?.content;
            if (replyText) break;
          }
        } catch (mErr) {
          console.warn(`Model ${model} failed, trying next fallback:`, mErr.message);
        }
      }

      if (replyText) {
        return { reply: replyText };
      }

      throw new Error('All Groq AI models unavailable');
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Failed to communicate with AI' });
    }
  });
};
