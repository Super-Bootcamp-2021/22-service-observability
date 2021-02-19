const orm = require('./lib/orm');
const storage = require('./lib/storage');
const kv = require('./lib/kv');
const bus = require('./lib/bus');
const { TaskSchema } = require('./tasks/task.model');
const { WorkerSchema } = require('./worker/worker.model');
const workerServer = require('./worker/server');
const tasksServer = require('./tasks/server');
const performanceServer = require('./performance/server');
const { config } = require('./config');
const { createNodeLogger } = require('./lib/logger');

async function init(logger) {
  try {
    logger.info('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    logger.info('database connected');
  } catch (err) {
    logger.error('database connection failed', err);
    process.exit(1);
  }
  try {
    logger.info('connect to object storage');
    await storage.connect('task-manager', config.storage);
    logger.info('object storage connected');
  } catch (err) {
    logger.error('object storage connection failed', err);
    process.exit(1);
  }
  try {
    logger.info('connect to message bus');
    await bus.connect(config.bus);
    logger.info('message bus connected');
  } catch (err) {
    logger.error('message bus connection failed', err);
    process.exit(1);
  }
  try {
    logger.info('connect to key value store');
    await kv.connect(config.kv);
    logger.info('key value store connected');
  } catch (err) {
    logger.error('key value store connection failed', err);
    process.exit(1);
  }
}

async function onStop() {
  bus.close();
  kv.close();
}

async function main(command) {
  var logger;
  logger = createNodeLogger('info', 'main-service');
  switch (command) {
    case 'performance':
      logger = createNodeLogger('info', 'performance-service');
      await init(logger);
      performanceServer.run(onStop, logger);
      break;
    case 'task':
      logger = createNodeLogger('info', 'task-service');
      await init(logger);
      tasksServer.run(onStop, logger);
      break;
    case 'worker':
      logger = createNodeLogger('info', 'worker-service');
      await init(logger);
      workerServer.run(onStop, logger);
      break;
    default:
      command =
        typeof command == 'undefined' || typeof command == 'null'
          ? 'command'
          : command;
      logger.info(`${command} tidak dikenali`);
      logger.info('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
