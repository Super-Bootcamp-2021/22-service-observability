import * as orm from'./lib/orm';
import * as storage from'./lib/storage';
import * as kv from'./lib/kv';
import * as bus from'./lib/bus';
import { TaskSchema } from'./tasks/task.model';
import { WorkerSchema } from'./worker/worker.model';
import * as workerServer from'./worker/server';
import * as tasksServer from'./tasks/server';
import * as performanceServer from'./performance/server';
import { config } from'./config';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from './lib/logger';

const logger: Logger = createNodeLogger(LogLevel.info);

async function init() {
  try {
    logger.info('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    logger.info('database connected');
  } catch (err) {
    logger.error('database connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to object storage');
    await storage.connect('task-manager', config.minio);
    logger.info('object storage connected');
  } catch (err) {
    logger.error('object storage connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to message bus');
    await bus.connect(config.bus.host, config.bus);
    logger.info('message bus connected');
  } catch (err) {
    logger.error('message bus connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to key value store');
    await kv.connect(config.kv);
    logger.info('key value store connected');
  } catch (err) {
    logger.error('key value store connection failed');
    process.exit(1);
  }
}

async function onStop() {
  bus.close();
  kv.close();
}

async function main(command :string) {
  switch (command) {
    case 'performance':
      await init();
      performanceServer.run(onStop);
      break;
    case 'task':
      await init();
      tasksServer.run(onStop);
      break;
    case 'worker':
      await init();
      workerServer.run(onStop);
      break;
    default:
      logger.info(`${command} tidak dikenali`);
      logger.info('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
