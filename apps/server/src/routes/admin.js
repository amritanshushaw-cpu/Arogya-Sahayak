const db = require('../db/connection');

async function adminRoutes(fastify, options) {
  fastify.get('/users', async (request, reply) => {
    const { role } = request.query;
    try {
      let query = db('users').select('*');
      if (role === 'asha' || role === 'phc') {
        query = query.where({ role });
      } else if (role) {
        query = query.where({ role });
      }
      const users = await query;
      return { success: true, users };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to fetch users' });
    }
  });

  fastify.get('/patients', async (request, reply) => {
    try {
      const patients = await db('patients').select('*');
      return { success: true, patients };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to fetch patients' });
    }
  });
}

module.exports = adminRoutes;
