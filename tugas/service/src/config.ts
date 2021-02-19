import * as rc from 'rc';
import { ConnectionOptions } from 'typeorm';

export interface ServiceConfig {
  database: ConnectionOptions;
  server: {
    worker: number;
    workerHost: string;
    task: number;
    performance: number;
  };
  bus: any;
  kv: any;
  minio: any;
}

const defaultConfig: ServiceConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'database',
  },
  server: {
    worker: 7001,
    workerHost: 'http://localhost:7001',
    task: 7002,
    performance: 7003,
  },
  bus: {
    host: 'localhost',
    port: 4222,
  },
  kv: {
    host: 'localhost',
    port: 6379,
  },
  minio: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
};

export const config: ServiceConfig = rc('tm', defaultConfig);
