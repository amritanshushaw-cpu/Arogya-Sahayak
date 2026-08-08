const { generateFHIRBundle } = require('../services/fhir');

module.exports = async function(fastify, options) {
  fastify.post('/api/abdm/link-record', async (request, reply) => {
    try {
      const { patientId, screeningId } = request.body || {};
      
      // Simulate fetching patient and screening
      const patient = { id: patientId, name: 'John Doe' };
      const screening = { id: screeningId, result: 'Normal' };

      const fhirPayload = generateFHIRBundle(patient, screening);

      // Simulate sending it to ABDM sandbox
      
      return {
        success: true,
        message: 'Record successfully linked to ABDM',
        data: fhirPayload
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to link record' });
    }
  });
};
