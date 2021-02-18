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
  storage: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'local-minio',
    secretKey: 'local-test-secret',
  },
	bus: {
    host: 'localhost',
    port: 4222,
  },
	kv: {
    host: '127.0.0.1',
    port: 6379,
  },
  serverWorker: {
		host: 'localhost',
    port: 7001,
  },
  serverTask: {
    port: 7002,
  },
  serverPerformance: {
    port: 7003,
  },
};

const config = rc('tm', defaultConfig);

module.exports = {
  config,
};
