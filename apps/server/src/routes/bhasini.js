/**
 * Bhasini NLTM (National Language Translation Mission) API Integration Route
 * Handles NMT (Translation), TTS (Text-to-Speech), and ASR (Speech-to-Text) for 12+ Indian languages
 */

module.exports = async function (fastify, opts) {
  // Language mappings for Bhasini ISO 639-1 codes
  const BHASINI_LANG_CODES = {
    'en-US': 'en', 'en-IN': 'en', 'hi-IN': 'hi', 'bn-IN': 'bn',
    'te-IN': 'te', 'mr-IN': 'mr', 'ta-IN': 'ta', 'gu-IN': 'gu',
    'ur-IN': 'ur', 'kn-IN': 'kn', 'or-IN': 'or', 'ml-IN': 'ml',
    'pa-IN': 'pa', 'as-IN': 'as'
  };

  /**
   * GET /api/bhasini/config
   * Returns supported Bhasini vernacular languages and API configuration status
   */
  fastify.get('/config', async (request, reply) => {
    const hasKeys = Boolean(process.env.BHASINI_USER_ID && process.env.BHASINI_API_KEY);
    return {
      status: 'active',
      bhasiniActive: hasKeys,
      supportedLanguages: [
        { code: 'bn', name: 'Bengali (বাংলা)', bcp47: 'bn-IN' },
        { code: 'hi', name: 'Hindi (हिंदी)', bcp47: 'hi-IN' },
        { code: 'te', name: 'Telugu (తెలుగు)', bcp47: 'te-IN' },
        { code: 'mr', name: 'Marathi (मराठी)', bcp47: 'mr-IN' },
        { code: 'ta', name: 'Tamil (தமிழ்)', bcp47: 'ta-IN' },
        { code: 'gu', name: 'Gujarati (ગુજરાતી)', bcp47: 'gu-IN' },
        { code: 'ur', name: 'Urdu (اردو)', bcp47: 'ur-IN' },
        { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', bcp47: 'kn-IN' },
        { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', bcp47: 'or-IN' },
        { code: 'ml', name: 'Malayalam (മലയാളം)', bcp47: 'ml-IN' },
        { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', bcp47: 'pa-IN' },
        { code: 'en', name: 'English', bcp47: 'en-US' }
      ]
    };
  });

  /**
   * POST /api/bhasini/translate
   * NMT Translation between Indian languages
   */
  fastify.post('/translate', async (request, reply) => {
    try {
      const { text, sourceLang = 'en-US', targetLang = 'bn-IN' } = request.body;
      if (!text) {
        return reply.code(400).send({ error: 'Text input is required' });
      }

      const sourceCode = BHASINI_LANG_CODES[sourceLang] || sourceLang || 'en';
      const targetCode = BHASINI_LANG_CODES[targetLang] || targetLang || 'bn';

      // If source and target are identical, return input directly
      if (sourceCode === targetCode) {
        return { translatedText: text, source: sourceCode, target: targetCode };
      }

      const userId = process.env.BHASINI_USER_ID;
      const apiKey = process.env.BHASINI_API_KEY;
      const pipelineId = process.env.BHASINI_PIPELINE_ID || '64392f08f405096a60395350';

      // If Bhasini API credentials configured on server, invoke official Bhasini Dhruva pipeline
      if (userId && apiKey) {
        const pipelineRes = await fetch('https://dhruva-api.bhasini.gov.in/services/inference/pipeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'userId': userId,
            'ulcaApiKey': apiKey
          },
          body: JSON.stringify({
            pipelineTasks: [
              {
                taskType: 'translation',
                config: {
                  language: {
                    sourceLanguage: sourceCode,
                    targetLanguage: targetCode
                  }
                }
              }
            ],
            inputData: {
              input: [{ source: text }]
            }
          })
        });

        if (pipelineRes.ok) {
          const resData = await pipelineRes.json();
          const translatedText = resData.pipelineResponse?.[0]?.output?.[0]?.target;
          if (translatedText) {
            return { translatedText, source: sourceCode, target: targetCode, provider: 'bhasini' };
          }
        }
      }

      // Fallback translation response if Bhasini credentials absent or API offline
      return { 
        translatedText: text, 
        source: sourceCode, 
        target: targetCode, 
        provider: 'fallback',
        note: 'Bhasini credentials pending configuration; passed through for local UI rendering.' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Bhasini translation failed' });
    }
  });

  /**
   * POST /api/bhasini/tts
   * Bhasini Text-to-Speech Audio Generation
   */
  fastify.post('/tts', async (request, reply) => {
    try {
      const { text, language = 'bn-IN', gender = 'female' } = request.body;
      if (!text) {
        return reply.code(400).send({ error: 'Text input is required' });
      }

      const langCode = BHASINI_LANG_CODES[language] || 'bn';
      const userId = process.env.BHASINI_USER_ID;
      const apiKey = process.env.BHASINI_API_KEY;

      // 1. Try Bhasini Dhruva API first (if credentials configured)
      if (userId && apiKey) {
        try {
          const ttsRes = await fetch('https://dhruva-api.bhasini.gov.in/services/inference/pipeline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'userId': userId,
              'ulcaApiKey': apiKey
            },
            body: JSON.stringify({
              pipelineTasks: [
                {
                  taskType: 'tts',
                  config: {
                    language: { sourceLanguage: langCode },
                    gender: gender
                  }
                }
              ],
              inputData: {
                input: [{ source: text }]
              }
            })
          });

          if (ttsRes.ok) {
            const resData = await ttsRes.json();
            const audioBase64 = resData.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
            if (audioBase64) {
              return { audioContent: audioBase64, language: langCode, provider: 'bhasini' };
            }
          }
        } catch (bErr) {
          request.log.warn('Bhasini TTS failed, falling back to proxy TTS:', bErr.message);
        }
      }

      // 2. Fallback: Server-side Google Translate TTS proxy (no API key needed)
      // Supports all 12 Indian languages with natural pronunciation
      try {
        // Split text into chunks of max 200 characters for Google TTS limit
        const chunks = [];
        const maxLen = 200;
        let remaining = text.slice(0, 1000); // Limit total text
        while (remaining.length > 0) {
          if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
          }
          // Find a good split point (sentence end or space)
          let splitIdx = remaining.lastIndexOf('.', maxLen);
          if (splitIdx < 50) splitIdx = remaining.lastIndexOf(' ', maxLen);
          if (splitIdx < 20) splitIdx = maxLen;
          chunks.push(remaining.slice(0, splitIdx + 1));
          remaining = remaining.slice(splitIdx + 1).trim();
        }

        const audioBuffers = [];
        for (const chunk of chunks) {
          const encodedText = encodeURIComponent(chunk.trim());
          if (!encodedText) continue;
          
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodedText}`;
          const proxyRes = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://translate.google.com/'
            }
          });

          if (proxyRes.ok) {
            const arrayBuf = await proxyRes.arrayBuffer();
            audioBuffers.push(Buffer.from(arrayBuf));
          }
        }

        if (audioBuffers.length > 0) {
          const combinedBuffer = Buffer.concat(audioBuffers);
          const base64Audio = combinedBuffer.toString('base64');
          return { audioContent: base64Audio, language: langCode, provider: 'google-tts-proxy', audioType: 'mp3' };
        }
      } catch (gErr) {
        request.log.warn('Google TTS proxy failed:', gErr.message);
      }

      return { 
        audioContent: null, 
        language: langCode, 
        provider: 'web-speech-fallback', 
        message: 'Use client Web Speech Synthesis' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Bhasini TTS failed' });
    }
  });
};
