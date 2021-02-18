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

async function init() {
  try {
    console.log('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    console.log('database connected');
  } catch (err) {
    console.error('database connection failed');
    process.exit(1);
  }
  try {
    console.log('connect to object storage');
    await storage.connect('task-manager', config.minio);
    console.log('object storage connected');
  } catch (err) {
    console.error('object storage connection failed');
    process.exit(1);
  }
  try {
    console.log('connect to message bus');
    await bus.connect(config.bus.host, config.bus);
    console.log('message bus connected');
  } catch (err) {
    console.error('message bus connection failed');
    process.exit(1);
  }
  try {
    console.log('connect to key value store');
    await kv.connect(config.kv);
    console.log('key value store connected');
  } catch (err) {
    console.error('key value store connection failed');
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
      console.log(`${command} tidak dikenali`);
      console.log('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
