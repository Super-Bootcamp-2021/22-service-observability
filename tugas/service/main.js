const orm = require('./lib/orm');
const storage = require('./lib/storage');
const kv = require('./lib/kv');
const bus = require('./lib/bus');
const { TaskSchema } = require('./tasks/task.model');
const { WorkerSchema } = require('./worker/worker.model');
const workerServer = require('./worker/server');
const tasksServer = require('./tasks/server');
const performanceServer = require('./performance/server');
const {config} = require('./config');
const tracer = require('./lib/tracer');

let ctx;

async function init() {
  try {
    console.log('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    console.log('database connected');
  } catch (err) {
    console.error('database connection failed',err);
    process.exit(1);
  }
  try {
    console.log('connect to object storage');
    await storage.connect('task-manager', config.storage);
    console.log('object storage connected');
  } catch (err) {
    console.error('object storage connection failed',err);
    process.exit(1);
  }
  try {
    console.log('connect to message bus');
    await bus.connect(config.bus);
    console.log('message bus connected');
  } catch (err) {
    console.error('message bus connection failed',err);
    process.exit(1);
  }
  try {
    console.log('connect to key value store');
    await kv.connect(config.kv);
    console.log('key value store connected');
  } catch (err) {
    console.error('key value store connection failed',err);
    process.exit(1);
  }
}

async function tracerInit(config) {
  try {
    console.log('connect to tracer ...');
    return await tracer.connect(config);
  } catch (err) {
    console.error('tracer connection failed', err);
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
      ctx = await tracerInit(config.tracer.performance);
      performanceServer.run(ctx, onStop);
      break;
    case 'task':
      await init();
      ctx = await tracerInit(config.tracer.task);
      tasksServer.run(ctx, onStop);
      break;
    case 'worker':
      await init();
      ctx = await tracerInit(config.tracer.worker);
      await workerServer.run(ctx, onStop);
      break;
    default:
      console.log(`${command} tidak dikenali`);
      console.log('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
