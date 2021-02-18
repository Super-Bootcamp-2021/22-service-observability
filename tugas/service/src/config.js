const rc = require('rc');

const defaultConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'database',
  },
  minio: {
    endPoint: '127.0.0.1', //diganti
    port: 9000,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
  nats: {
    hostname: 'localhost',
    port: '4222',
  },
  kv: {
    hostname: 'localhost',
    port: '6379',
  },
  server: {
    port: {
      worker: 10,
      task: 20,
      performance: 30,
    },
  },
};

const config = rc('server', defaultConfig);

module.exports = {
  config,
};
