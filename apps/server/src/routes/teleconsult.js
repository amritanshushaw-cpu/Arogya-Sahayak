const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (fastify, opts) {
  fastify.addHook('preValidation', fastify.authenticate);

  fastify.post('/book', async (request, reply) => {
    try {
      const { patient_id, scheduled_at, session_type } = request.body;
      const worker_id = request.user.id;
      
      const worker = await db('users').where({ id: worker_id }).first();
      const doctor = await db('users')
        .where({ role: 'doctor', district: worker.district })
        .first();

      const booking = {
        id: uuidv4(),
        patient_id,
        worker_id,
        doctor_id: doctor ? doctor.id : null,
        status: 'REQUESTED',
        session_type: session_type || 'VIDEO',
        scheduled_at
      };

      await db('teleconsult_bookings').insert(booking);
      return reply.code(201).send(booking);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/', async (request, reply) => {
    try {
      const { status = 'REQUESTED' } = request.query;
      const bookings = await db('teleconsult_bookings')
        .where({ status })
        .orderBy('created_at', 'desc');
        
      return { data: bookings };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.patch('/:id/status', async (request, reply) => {
    try {
      const { status, notes, prescription } = request.body;
      
      const updateData = { status };
      if (status === 'STARTED') updateData.started_at = db.fn.now();
      if (status === 'COMPLETED') updateData.ended_at = db.fn.now();
      if (notes) updateData.doctor_notes = notes;
      if (prescription) updateData.prescription = JSON.stringify(prescription);

      const count = await db('teleconsult_bookings')
        .where({ id: request.params.id })
        .update(updateData);
        
      if (count === 0) return reply.code(404).send({ error: 'Booking not found' });
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
