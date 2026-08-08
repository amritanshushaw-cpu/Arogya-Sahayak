require('dotenv').config();
const fastify = require('fastify')({ logger: true });

// Register plugins
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'arogya-dev-secret'
});
fastify.register(require('@fastify/websocket'));

// Authenticate decorator
fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register routes under /api prefix
fastify.register(async function (api) {
  api.register(require('./routes/auth'), { prefix: '/auth' });
  api.register(require('./routes/patients'), { prefix: '/patients' });
  api.register(require('./routes/screenings'), { prefix: '/screenings' });
  api.register(require('./routes/alerts'), { prefix: '/alerts' });
  api.register(require('./routes/teleconsult'), { prefix: '/teleconsult' });
  api.register(require('./routes/dashboard'), { prefix: '/dashboard' });
  api.register(require('./routes/abdm'), { prefix: '/abdm' });
  api.register(require('./routes/chat'), { prefix: '/chat' });
}, { prefix: '/api' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
