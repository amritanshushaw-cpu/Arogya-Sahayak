// Using native fetch in Node 18+

module.exports = async function (fastify, opts) {
  fastify.post('/', async (request, reply) => {
    try {
      const { message, language, history } = request.body;

      if (!process.env.GROQ_API_KEY) {
        return reply.code(500).send({ error: 'Groq API Key not configured on server' });
      }

      const systemPrompt = `You are Arogya Sahayak, a helpful AI medical triage assistant for rural India.
Respond STRICTLY in the following language: ${language}.
Always be concise, empathetic, and ask clarifying questions about symptoms.
If symptoms are severe, advise seeing a doctor immediately.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message }
      ];

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: messages,
          max_tokens: 300
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
      return reply.code(500).send({ error: 'Failed to communicate with AI' });
    }
  });
};
