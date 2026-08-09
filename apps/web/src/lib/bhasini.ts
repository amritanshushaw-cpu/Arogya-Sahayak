/**
 * Bhasini AI Platform Client Service
 * Provides NMT Translation, Vernacular Voice Synthesis (TTS), and ASR Speech Recognition
 * for 12+ Indian languages (Bengali, Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Odia, Malayalam, Punjabi, Urdu, English)
 */

export interface BhasiniTranslateResult {
  translatedText: string;
  source: string;
  target: string;
  provider: 'bhasini' | 'fallback';
}

export interface BhasiniTTSResult {
  audioContent?: string | null;
  language: string;
  provider: string;
  audioType?: 'wav' | 'mp3';
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Translates clinical text between Indian languages using Bhasini NMT pipeline
 */
export async function bhasiniTranslate(
  text: string,
  sourceLang: string = 'en-US',
  targetLang: string = 'bn-IN'
): Promise<BhasiniTranslateResult> {
  if (!text || sourceLang === targetLang) {
    return { translatedText: text, source: sourceLang, target: targetLang, provider: 'fallback' };
  }

  try {
    const res = await fetch(`${apiUrl}/api/bhasini/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Bhasini Service] Translation fetch fallback:', err);
  }

  return { translatedText: text, source: sourceLang, target: targetLang, provider: 'fallback' };
}

/**
 * Generates Bhasini Vernacular Text-to-Speech Audio Content
 */
export async function bhasiniTextToSpeech(
  text: string,
  language: string = 'bn-IN'
): Promise<BhasiniTTSResult> {
  if (!text) {
    return { audioContent: null, language, provider: 'none' };
  }

  try {
    const res = await fetch(`${apiUrl}/api/bhasini/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Bhasini Service] TTS fetch fallback:', err);
  }

  return { audioContent: null, language, provider: 'web-speech-fallback' };
}

/**
 * Checks Bhasini API configuration status and supported Indian languages
 */
export async function getBhasiniConfig() {
  try {
    const res = await fetch(`${apiUrl}/api/bhasini/config`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Bhasini Service] Config fetch fallback:', err);
  }
  return { status: 'offline', bhasiniActive: false };
}
