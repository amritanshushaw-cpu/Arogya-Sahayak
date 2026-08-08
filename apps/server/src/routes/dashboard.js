const db = require('../db/connection');

module.exports = async function (fastify, opts) {
  fastify.addHook('preValidation', fastify.authenticate);

  fastify.get('/stats', async (request, reply) => {
    try {
      const { district } = request.query;
      
      let patientsQuery = db('patients').count('* as count');
      if (district) patientsQuery = patientsQuery.where({ district });
      const [{ count: totalPatients }] = await patientsQuery;

      const currentMonth = new Date().toISOString().slice(0, 7) + '%'; // 'YYYY-MM%'
      
      let screeningsQuery = db('screenings')
        .join('patients', 'screenings.patient_id', 'patients.id')
        .where('screenings.screening_date', 'like', currentMonth);
      if (district) screeningsQuery = screeningsQuery.where('patients.district', district);
      
      const [{ count: totalScreenings }] = await screeningsQuery.count('* as count');

      let riskQuery = db('screenings')
        .join('patients', 'screenings.patient_id', 'patients.id')
        .select('screenings.risk_level')
        .count('* as count')
        .groupBy('screenings.risk_level');
      if (district) riskQuery = riskQuery.where('patients.district', district);
      
      const riskBreakdown = await riskQuery;

      let alertsQuery = db('alerts')
        .join('patients', 'alerts.patient_id', 'patients.id')
        .where('alerts.status', 'ACTIVE');
      if (district) alertsQuery = alertsQuery.where('patients.district', district);
      const [{ count: activeAlerts }] = await alertsQuery.count('* as count');

      let avgQuery = db('screenings')
        .join('patients', 'screenings.patient_id', 'patients.id')
        .avg('risk_diabetes as avg_diabetes')
        .avg('risk_hypertension as avg_htn');
      if (district) avgQuery = avgQuery.where('patients.district', district);
      
      const averages = await avgQuery.first();

      return {
        total_patients: totalPatients,
        total_screenings_this_month: totalScreenings,
        risk_breakdown: riskBreakdown,
        active_alerts: activeAlerts,
        averages
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/alerts', async (request, reply) => {
    try {
      const alerts = await db('alerts')
        .join('patients', 'alerts.patient_id', 'patients.id')
        .select('alerts.*', 'patients.name as patient_name', 'patients.village')
        .where('alerts.status', 'ACTIVE')
        .orderBy('alerts.created_at', 'desc')
        .limit(10);
        
      return {
        data: alerts.map(a => ({
          ...a,
          disease_flags: a.disease_flags ? JSON.parse(a.disease_flags) : null
        }))
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/trends', async (request, reply) => {
    try {
      const { district } = request.query;
      
      let query = db('screenings')
        .join('patients', 'screenings.patient_id', 'patients.id')
        .select(db.raw('substr(screening_date, 1, 7) as month'))
        .avg('risk_diabetes as avg_diabetes')
        .avg('risk_hypertension as avg_htn')
        .groupBy('month')
        .orderBy('month', 'desc')
        .limit(6);

      if (district) query = query.where('patients.district', district);
      
      const trends = await query;
      return { data: trends.reverse() }; // chronologically
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
