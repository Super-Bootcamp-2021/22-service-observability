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
const { createLogConsole, createLogFile } = require('./lib/logger');

const logConsole = createLogConsole('info', 'server');
const logFile = createLogFile('error', 'server');

async function init() {
  try {
    logConsole.info('connect to database', 'postgres');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    logConsole.info('database connected', 'postgres');
  } catch (err) {
    logFile.error('database connection failed');
    process.exit(1);
  }
  try {
    logConsole.info('connect to object storage');
    await storage.connect('task-manager', config.minio);
    logConsole.info('object storage connected');
  } catch (err) {
    logFile.error('object storage connection failed');
    process.exit(1);
  }
  try {
    logConsole.info('connect to message bus');
    await bus.connect();
    logConsole.info('message bus connected');
  } catch (err) {
    logFile.error('message bus connection failed');
    process.exit(1);
  }
  try {
    logConsole.info('connect to key value store');
    await kv.connect();
    logConsole.info('key value store connected');
  } catch (err) {
    logFile.error('key value store connection failed');
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
      logConsole.info(`${command} tidak dikenali`);
      logConsole.info('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
