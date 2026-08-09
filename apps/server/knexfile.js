require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/arogya.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './data/arogya.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations'
    }
  }
};
