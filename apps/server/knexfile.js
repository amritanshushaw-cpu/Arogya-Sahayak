require('dotenv').config();

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './data/arogya.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations'
    }
  },

  production: {
    client: 'better-sqlite3',
    connection: {
      filename: './data/arogya.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations'
    }
  }
};
