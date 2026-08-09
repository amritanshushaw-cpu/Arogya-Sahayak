/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', table => {
    table.text('id').primary();
    table.text('role').notNullable(); // asha, anm, doctor, phc_admin, district_admin, phc
    table.text('name').notNullable();
    table.text('phone');
    table.text('email');
    table.text('language').defaultTo('hi');
    table.text('district');
    table.text('state');
    table.text('password_hash');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('patients', table => {
    table.text('id').primary();
    table.text('abha_id').nullable();
    table.text('name').notNullable();
    table.integer('age');
    table.text('gender');
    table.text('phone');
    table.text('village');
    table.text('block');
    table.text('district');
    table.text('state');
    table.text('assigned_phc_code');
    table.text('assigned_phc_name');
    table.text('family_history'); // JSON string
    table.text('lifestyle'); // JSON string
    table.text('registered_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('screenings', table => {
    table.text('id').primary();
    table.text('patient_id').references('id').inTable('patients');
    table.text('worker_id').references('id').inTable('users');
    table.text('device_id');
    table.integer('bp_systolic');
    table.integer('bp_diastolic');
    table.float('blood_glucose');
    table.float('hb_level');
    table.float('bmi');
    table.float('weight');
    table.float('height');
    table.float('temperature');
    table.integer('pulse');
    table.integer('spo2');
    table.text('symptoms'); // JSON array string
    table.float('risk_diabetes');
    table.float('risk_hypertension');
    table.float('risk_cvd');
    table.float('risk_anemia');
    table.text('risk_level'); // GREEN/YELLOW/RED
    table.text('risk_explanation'); // JSON string
    table.text('input_method').defaultTo('manual');
    table.date('screening_date').notNullable();
    table.timestamp('synced_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });


  await knex.schema.createTable('alerts', table => {
    table.text('id').primary();
    table.text('patient_id').references('id').inTable('patients');
    table.text('screening_id').references('id').inTable('screenings');
    table.text('alert_type').notNullable(); // RED_ALERT, YELLOW_ALERT, FOLLOWUP
    table.text('disease_flags'); // JSON array
    table.text('status').defaultTo('ACTIVE'); // ACTIVE, ACKNOWLEDGED, RESOLVED
    table.text('assigned_doctor_id').references('id').inTable('users');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('resolved_at');
  });

  await knex.schema.createTable('teleconsult_bookings', table => {
    table.text('id').primary();
    table.text('patient_id').references('id').inTable('patients');
    table.text('worker_id').references('id').inTable('users');
    table.text('doctor_id').references('id').inTable('users');
    table.text('status').defaultTo('REQUESTED');
    table.text('session_type').defaultTo('VIDEO');
    table.timestamp('scheduled_at');
    table.timestamp('started_at');
    table.timestamp('ended_at');
    table.text('doctor_notes');
    table.text('prescription'); // JSON
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('sync_events', table => {
    table.increments('id').primary();
    table.text('table_name').notNullable();
    table.text('record_id').notNullable();
    table.text('field_name');
    table.text('new_value'); // JSON
    table.text('operation').defaultTo('UPSERT');
    table.integer('hlc_timestamp').notNullable();
    table.text('node_id').notNullable();
    table.text('checksum');
    table.timestamp('received_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('sync_events');
  await knex.schema.dropTableIfExists('teleconsult_bookings');
  await knex.schema.dropTableIfExists('alerts');
  await knex.schema.dropTableIfExists('screenings');
  await knex.schema.dropTableIfExists('patients');
  await knex.schema.dropTableIfExists('users');
};
