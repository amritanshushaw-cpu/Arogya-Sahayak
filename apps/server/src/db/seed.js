const knex = require('./connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Clear existing data
    await knex('alerts').del();
    await knex('screenings').del();
    await knex('patients').del();
    await knex('users').del();

    // Users
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const ashaId = uuidv4();
    const doctorId = uuidv4();
    const adminId = uuidv4();

    await knex('users').insert([
      {
        id: ashaId,
        role: 'asha',
        name: 'Priya Devi',
        phone: '9876543210',
        district: 'Patna',
        state: 'Bihar',
        password_hash: passwordHash
      },
      {
        id: doctorId,
        role: 'doctor',
        name: 'Dr. Rajesh Kumar',
        phone: '9876543211',
        district: 'Patna',
        state: 'Bihar',
        password_hash: passwordHash
      },
      {
        id: adminId,
        role: 'phc_admin',
        name: 'Suresh Singh',
        phone: '9876543212',
        district: 'Patna',
        state: 'Bihar',
        password_hash: passwordHash
      }
    ]);

    // Patients
    const patients = [
      {
        id: uuidv4(),
        name: 'Ramesh Yadav',
        age: 45,
        gender: 'M',
        village: 'Maner',
        district: 'Patna',
        state: 'Bihar',
        registered_by: ashaId,
        family_history: JSON.stringify({ diabetes: true }),
        lifestyle: JSON.stringify({ smoking: true })
      },
      {
        id: uuidv4(),
        name: 'Sunita Kumari',
        age: 38,
        gender: 'F',
        village: 'Bihta',
        district: 'Patna',
        state: 'Bihar',
        registered_by: ashaId,
        family_history: JSON.stringify({ hypertension: true }),
        lifestyle: JSON.stringify({ active: true })
      },
      {
        id: uuidv4(),
        name: 'Anil Paswan',
        age: 55,
        gender: 'M',
        village: 'Fatuha',
        district: 'Patna',
        state: 'Bihar',
        registered_by: ashaId,
        family_history: JSON.stringify({ cvd: true }),
        lifestyle: JSON.stringify({ smoking: true, alcohol: true })
      },
      {
        id: uuidv4(),
        name: 'Meena Devi',
        age: 62,
        gender: 'F',
        village: 'Danapur',
        district: 'Patna',
        state: 'Bihar',
        registered_by: ashaId,
        family_history: JSON.stringify({ diabetes: true, hypertension: true }),
        lifestyle: JSON.stringify({ active: false })
      },
      {
        id: uuidv4(),
        name: 'Kishan Sharma',
        age: 28,
        gender: 'M',
        village: 'Mokama',
        district: 'Patna',
        state: 'Bihar',
        registered_by: ashaId,
        family_history: JSON.stringify({}),
        lifestyle: JSON.stringify({ active: true })
      }
    ];

    await knex('patients').insert(patients);

    // Screenings
    const today = new Date().toISOString().split('T')[0];
    const screenings = [
      {
        id: uuidv4(),
        patient_id: patients[0].id,
        worker_id: ashaId,
        bp_systolic: 145,
        bp_diastolic: 95,
        blood_glucose: 140,
        risk_hypertension: 0.8,
        risk_level: 'RED',
        screening_date: today
      },
      {
        id: uuidv4(),
        patient_id: patients[1].id,
        worker_id: ashaId,
        bp_systolic: 120,
        bp_diastolic: 80,
        blood_glucose: 95,
        hb_level: 12.5,
        risk_level: 'GREEN',
        screening_date: today
      },
      {
        id: uuidv4(),
        patient_id: patients[2].id,
        worker_id: ashaId,
        bp_systolic: 150,
        bp_diastolic: 100,
        blood_glucose: 200,
        risk_diabetes: 0.9,
        risk_hypertension: 0.85,
        risk_level: 'RED',
        screening_date: today
      },
      {
        id: uuidv4(),
        patient_id: patients[3].id,
        worker_id: ashaId,
        bp_systolic: 135,
        bp_diastolic: 85,
        blood_glucose: 110,
        risk_level: 'YELLOW',
        screening_date: today
      },
      {
        id: uuidv4(),
        patient_id: patients[4].id,
        worker_id: ashaId,
        bp_systolic: 115,
        bp_diastolic: 75,
        blood_glucose: 90,
        risk_level: 'GREEN',
        screening_date: today
      }
    ];

    await knex('screenings').insert(screenings);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
