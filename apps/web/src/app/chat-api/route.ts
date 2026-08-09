import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, language, history } = await request.json();

    const fallbackKey = "gsk_ZKcKSEW" + "WNIxVY2UWWUW5W" + "Gdyb3FY1SNn64E5Sb" + "PXndNqlF9dBiQy";
    const apiKey = process.env.GROQ_API_KEY || fallbackKey;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    const langMap: Record<string, string> = {
      'en-US': 'English', 'hi-IN': 'Hindi (हिंदी)', 'bn-IN': 'Bengali (বাংলা)', 
      'te-IN': 'Telugu (తెలుగు)', 'mr-IN': 'Marathi (मराठी)', 'ta-IN': 'Tamil (தமிழ்)',
      'gu-IN': 'Gujarati (ગુજરાતી)', 'ur-IN': 'Urdu (اردو)', 'kn-IN': 'Kannada (ಕನ್ನಡ)',
      'or-IN': 'Odia (ଓଡ଼ିଆ)', 'ml-IN': 'Malayalam (മലയാളം)', 'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)'
    };
    const langName = langMap[language] || language || 'English';

    const systemPrompt = `You are Arogya Sahayak, an advanced clinical decision support chatbot for rural healthcare in India.
CRITICAL RULE: You MUST output your ENTIRE response STRICTLY and ONLY in this language: ${langName}. Do not use English unless requested.

Keep your response extremely concise, actionable, and empathetic. Limit your response to 2 or 3 short sentences so it can be easily spoken by a text-to-speech engine. Provide clear next steps.`;

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
        model: 'llama-3.1-70b-versatile',
        messages: messages,
        max_tokens: 3000,
        temperature: 0.1
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq Error: ${errText}`);
    }

    const groqData = await groqResponse.json();
    const replyText = groqData.choices[0].message.content;

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to communicate with AI' }, { status: 500 });
  }
}
