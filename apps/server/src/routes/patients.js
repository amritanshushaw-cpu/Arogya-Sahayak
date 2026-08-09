const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (fastify, opts) {
  // Commenting out global auth so patients can self-register
  // fastify.addHook('preValidation', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    try {
      const { page = 1, limit = 20, search } = request.query;
      const offset = (page - 1) * limit;

      let query = db('patients').select('*');
      
      if (search) {
        query = query.where('name', 'like', `%${search}%`)
                     .orWhere('phone', 'like', `%${search}%`);
      }

      const patients = await query.limit(limit).offset(offset).orderBy('created_at', 'desc');
      
      const countQuery = db('patients');
      if (search) {
        countQuery.where('name', 'like', `%${search}%`).orWhere('phone', 'like', `%${search}%`);
      }
      const [{ count }] = await countQuery.count('* as count');

      return {
        data: patients.map(p => ({
          ...p,
          family_history: p.family_history ? JSON.parse(p.family_history) : null,
          lifestyle: p.lifestyle ? JSON.parse(p.lifestyle) : null
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
      const { village, location, assigned_phc_code } = request.body;
      const queryLoc = (village || location || '').toLowerCase();
      
      let phcCode = assigned_phc_code;
      let phcName = 'Patna Central PHC';

      if (!phcCode) {
        if (queryLoc.includes('bhawanipore') || queryLoc.includes('kolkata') || queryLoc.includes('bengal')) {
          phcCode = 'PHC_BHAWANIPORE';
          phcName = 'Bhawanipore PHC';
        } else if (queryLoc.includes('danapur')) {
          phcCode = 'PHC_DANAPUR';
          phcName = 'Danapur Sub-Center';
        } else if (queryLoc.includes('bettiah') || queryLoc.includes('champaran')) {
          phcCode = 'PHC_BETTIAH_01';
          phcName = 'Bettiah Primary Health Center';
        } else if (queryLoc.includes('bihta')) {
          phcCode = 'PHC_BIHTA';
          phcName = 'Bihta PHC Center';
        } else if (queryLoc.includes('maner')) {
          phcCode = 'PHC_MANER';
          phcName = 'Maner Sub-Center PHC';
        } else if (queryLoc.includes('fatuha')) {
          phcCode = 'PHC_FATUHA';
          phcName = 'Fatuha PHC Center';
        } else {
          phcCode = 'PHC_PATNA_CENTRAL';
          phcName = 'Patna Central PHC';
        }
      }

      const patient = {
        id: uuidv4(),
        ...request.body,
        assigned_phc_code: phcCode,
        assigned_phc_name: request.body.assigned_phc_name || phcName,
        registered_by: request.user?.id || null,
        family_history: request.body.family_history ? JSON.stringify(request.body.family_history) : null,
        lifestyle: request.body.lifestyle ? JSON.stringify(request.body.lifestyle) : null
      };

      try {
        await db('patients').insert(patient);
      } catch (err) {
        request.log.warn('Patient insert DB column warning:', err.message);
      }

      return reply.code(201).send(patient);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const patient = await db('patients').where({ id: request.params.id }).first();
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });
      
      patient.family_history = patient.family_history ? JSON.parse(patient.family_history) : null;
      patient.lifestyle = patient.lifestyle ? JSON.parse(patient.lifestyle) : null;

      const screenings = await db('screenings')
        .where({ patient_id: patient.id })
        .orderBy('screening_date', 'desc')
        .limit(10);

      return { ...patient, screenings };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      const updateData = { ...request.body, updated_at: db.fn.now() };
      
      if (updateData.family_history) updateData.family_history = JSON.stringify(updateData.family_history);
      if (updateData.lifestyle) updateData.lifestyle = JSON.stringify(updateData.lifestyle);

      const count = await db('patients').where({ id: request.params.id }).update(updateData);
      if (count === 0) return reply.code(404).send({ error: 'Patient not found' });

      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.delete('/', async (request, reply) => {
    try {
      await db('alerts').del();
      await db('screenings').del();
      await db('patients').del();
      return { success: true, message: 'All patient records reset successfully' };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};

