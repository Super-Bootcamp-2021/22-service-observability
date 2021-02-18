import * as rc from 'rc';

const defaultConfig = {
  database: {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "",
    "database": "sanbercode2"
  },
  objectStorage: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
  nats: {
    host: 'localhost',
    port: 4222
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  server: {
    portWorker: 7001,
    portTask: 7002,
    portPerformance: 7003,
  },
  host: {
    worker: 'localhost',
  },
};

export const config = rc('tm', defaultConfig);