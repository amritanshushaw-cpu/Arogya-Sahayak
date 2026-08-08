const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const { sendAlertSMS } = require('../services/sms');

module.exports = async function (fastify, opts) {
  fastify.addHook('preValidation', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    try {
      const { patient_id, page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      let query = db('screenings').select('*');
      if (patient_id) query = query.where({ patient_id });

      const screenings = await query.limit(limit).offset(offset).orderBy('screening_date', 'desc');
      
      let countQuery = db('screenings');
      if (patient_id) countQuery = countQuery.where({ patient_id });
      const [{ count }] = await countQuery.count('* as count');

      return {
        data: screenings.map(s => ({
          ...s,
          symptoms: s.symptoms ? JSON.parse(s.symptoms) : null,
          risk_explanation: s.risk_explanation ? JSON.parse(s.risk_explanation) : null
        })),
        meta: { total: count, page: Number(page), limit: Number(limit) }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const id = uuidv4();
      const screening = {
        id,
        worker_id: request.user.id,
        ...request.body,
        symptoms: request.body.symptoms ? JSON.stringify(request.body.symptoms) : null,
        risk_explanation: request.body.risk_explanation ? JSON.stringify(request.body.risk_explanation) : null
      };

      await db('screenings').insert(screening);

      // Auto-create alert if risk is RED or YELLOW
      if (screening.risk_level === 'RED' || screening.risk_level === 'YELLOW') {
        const alert_type = screening.risk_level === 'RED' ? 'RED_ALERT' : 'YELLOW_ALERT';
        await db('alerts').insert({
          id: uuidv4(),
          patient_id: screening.patient_id,
          screening_id: id,
          alert_type,
          status: 'ACTIVE'
        });

        // Attempt to send an SMS using the helper
        // Since we may not have patient name or doctor phone in the request directly, 
        // we'll use placeholder or fetch if needed. For now, use basic details:
        await sendAlertSMS(screening.patient_id, screening.risk_level, process.env.DOCTOR_PHONE_NUMBER || '+1234567890');
      }

      return reply.code(201).send({ id });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const screening = await db('screenings').where({ id: request.params.id }).first();
      if (!screening) return reply.code(404).send({ error: 'Screening not found' });
      
      screening.symptoms = screening.symptoms ? JSON.parse(screening.symptoms) : null;
      screening.risk_explanation = screening.risk_explanation ? JSON.parse(screening.risk_explanation) : null;

      return screening;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/stats', async (request, reply) => {
    try {
      const count = await db('screenings').count('* as total').first();
      const riskBreakdown = await db('screenings')
        .select('risk_level')
        .count('* as count')
        .groupBy('risk_level');

      const averages = await db('screenings')
        .avg('risk_diabetes as avg_diabetes')
        .avg('risk_hypertension as avg_htn')
        .first();

      return {
        total: count.total,
        risk_breakdown: riskBreakdown,
        averages
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
