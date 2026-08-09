const db = require('../db/connection');

async function adminRoutes(fastify, options) {
  fastify.get('/users', async (request, reply) => {
    const { role } = request.query;
    try {
      let query = db('users').select('*');
      if (role === 'asha') {
        query = query.where({ role: 'asha' });
      } else if (role === 'phc' || role === 'phc_admin') {
        query = query.whereIn('role', ['phc', 'phc_admin']);
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
      // Subquery to get the latest screening timestamp per patient
      const latestScreenings = db('screenings')
        .select('patient_id')
        .max('created_at as max_created')
        .groupBy('patient_id')
        .as('latest_s');

      const patients = await db('patients')
        .leftJoin(latestScreenings, 'patients.id', 'latest_s.patient_id')
        .leftJoin('screenings', function() {
          this.on('screenings.patient_id', '=', 'latest_s.patient_id')
              .andOn('screenings.created_at', '=', 'latest_s.max_created');
        })
        .select(
          'patients.*',
          'screenings.risk_level',
          'screenings.screening_date as last_visit'
        )
        .orderBy('patients.created_at', 'desc');

      const formattedPatients = patients.map(p => ({
        ...p,
        family_history: p.family_history ? (typeof p.family_history === 'string' ? (function() { try { return JSON.parse(p.family_history); } catch(e) { return p.family_history; } })() : p.family_history) : null,
        lifestyle: p.lifestyle ? (typeof p.lifestyle === 'string' ? (function() { try { return JSON.parse(p.lifestyle); } catch(e) { return p.lifestyle; } })() : p.lifestyle) : null,
        status: p.risk_level === 'RED' ? 'Critical' : p.risk_level === 'YELLOW' ? 'Observation' : p.risk_level === 'GREEN' ? 'Stable' : 'Pending',
        lastVisit: p.last_visit || (p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : 'N/A')
      }));

      return { success: true, patients: formattedPatients };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to fetch patients' });
    }
  });
}

module.exports = adminRoutes;

