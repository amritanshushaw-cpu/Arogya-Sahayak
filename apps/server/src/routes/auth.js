const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (fastify, opts) {
  fastify.post('/register', async (request, reply) => {
    try {
      const { name, phone, email, password, role, district, state, language } = request.body;
      const normalizedPhone = phone || email;

      if (!name || !normalizedPhone || !password) {
        return reply.code(400).send({ error: 'Name, phone/email, and password are required' });
      }

      const existingUser = await db('users').where({ phone: normalizedPhone }).first();
      if (existingUser) {
        return reply.code(400).send({ error: 'Phone number already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const id = uuidv4();

      await db('users').insert({
        id,
        name,
        phone: normalizedPhone,
        password_hash,
        role: role || 'asha',
        district,
        state,
        language
      });

      const token = fastify.jwt.sign({ id, role: role || 'asha', phone: normalizedPhone, district });
      return reply.code(201).send({ token, user: { id, name, phone: normalizedPhone, role: role || 'asha', district } });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const { phone, email, password } = request.body;
      const normalizedPhone = phone || email;

      if (!normalizedPhone || !password) {
        return reply.code(400).send({ error: 'Phone/email and password are required' });
      }

      const user = await db('users').where({ phone: normalizedPhone }).first();
      if (!user) {
        return reply.code(401).send({ error: 'Invalid phone or password' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid phone or password' });
      }

      const token = fastify.jwt.sign({ id: user.id, role: user.role, phone: user.phone, district: user.district });
      return { token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, district: user.district } };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = await db('users').where({ id: request.user.id }).first();
      if (!user) return reply.code(404).send({ error: 'User not found' });
      
      delete user.password_hash;
      return user;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
