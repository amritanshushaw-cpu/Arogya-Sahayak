const db = require('../db/connection');

module.exports = async function (fastify, opts) {
  fastify.addHook('preValidation', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    try {
      const { status = 'ACTIVE', page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      const alerts = await db('alerts')
        .join('patients', 'alerts.patient_id', 'patients.id')
        .select('alerts.*', 'patients.name as patient_name', 'patients.village')
        .where('alerts.status', status)
        .limit(limit)
        .offset(offset)
        .orderBy('alerts.created_at', 'desc');

      const [{ count }] = await db('alerts').where('status', status).count('* as count');

      return {
        data: alerts.map(a => ({
          ...a,
          disease_flags: a.disease_flags ? JSON.parse(a.disease_flags) : null
        })),
        meta: { total: count, page: Number(page), limit: Number(limit) }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const alert = await db('alerts').where({ id: request.params.id }).first();
      if (!alert) return reply.code(404).send({ error: 'Alert not found' });
      
      alert.disease_flags = alert.disease_flags ? JSON.parse(alert.disease_flags) : null;
      
      const patient = await db('patients').where({ id: alert.patient_id }).first();
      const screening = await db('screenings').where({ id: alert.screening_id }).first();

      return { ...alert, patient, screening };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.patch('/:id/acknowledge', async (request, reply) => {
    try {
      const count = await db('alerts')
        .where({ id: request.params.id })
        .update({ status: 'ACKNOWLEDGED' });
        
      if (count === 0) return reply.code(404).send({ error: 'Alert not found' });
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.patch('/:id/resolve', async (request, reply) => {
    try {
      const count = await db('alerts')
        .where({ id: request.params.id })
        .update({ status: 'RESOLVED', resolved_at: db.fn.now() });
        
      if (count === 0) return reply.code(404).send({ error: 'Alert not found' });
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
