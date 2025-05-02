import 'dotenv/config';

const POSTGRESQL_CONFIG = {
  production: {
    username: process.env.POSTGRE_USER,
    password: process.env.POSTGRE_PASS,
    database: process.env.POSTGRE_DBNAME,
    host: process.env.POSTGRE_IP,
    port: parseInt(process.env.POSTGRE_PORT!),
  }
};

export default POSTGRESQL_CONFIG;