const orm = require('./lib/orm');
const storage = require('./lib/storage');
const kv = require('./lib/kv');
const bus = require('./lib/bus');
const { TaskSchema } = require('./tasks/task.model');
const { WorkerSchema } = require('./worker/worker.model');
const { config } = require('./config');
const workerServer = require('./worker/server');
const tasksServer = require('./tasks/server');
const performanceServer = require('./performance/server');
const { createNodeLogger } = require('./lib/logger');

const logger = createNodeLogger('info', 'Main Service');

async function init() {
  try {
    logger.info('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], {
      type: config.database?.type,
      host: config.database?.host,
      port: config.database?.port,
      username: config.database?.username,
      password: config.database?.password,
      database: config.database?.database,
    });
    logger.info('database connected');
  } catch (err) {
    logger.error('database connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to object storage');
    await storage.connect('task-manager', {
      endPoint: config.minio?.endPoint,
      port: config.minio?.port,
      useSSL: config.minio?.useSSL,
      accessKey: config.minio?.accessKey,
      secretKey: config.minio?.secretKey,
    });
    logger.info('object storage connected');
  } catch (err) {
    logger.error('object storage connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to message bus');
    await bus.connect();
    logger.info('message bus connected');
  } catch (err) {
    logger.error('message bus connection failed');
    process.exit(1);
  }
  try {
    logger.info('connect to key value store');
    await kv.connect();
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

async function main(command) {
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
