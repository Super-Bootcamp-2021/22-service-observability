import * as orm from './lib/orm';
import * as storage from './lib/storage';
import * as kv from './lib/kv';
import * as bus from './lib/bus';
import { TaskSchema } from './tasks/task.model';
import { WorkerSchema } from './worker/worker.model';
import * as workerServer from './worker/server';
import * as tasksServer from './tasks/server';
import * as performanceServer from './performance/server';
import { config } from './config';
import { AppContext } from './lib/context';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from './lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from './lib/tracer';

let ctx: AppContext;

async function init(): Promise<void> {
  const logger: Logger = createNodeLogger(LogLevel.info, 'tm-service');
  const tracer: JaegerTracer = createTracer('tm-service');
  ctx = {
    logger,
    tracer,
  };

  try {
    ctx?.logger?.info('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], config.database);
    ctx?.logger?.info('database connected');
  } catch (err) {
    ctx?.logger?.error('database connection failed');
    process.exit(1);
  }
  try {
    ctx?.logger?.info('connect to object storage');
    await storage.connect('task-manager', config.objectStorage);
    ctx?.logger?.info('object storage connected');
  } catch (err) {
    ctx?.logger?.error('object storage connection failed');
    process.exit(1);
  }
  try {
    ctx?.logger?.info('connect to message bus');
    await bus.connect(`nats://${config?.nats?.host}:${config?.nats?.port}`);
    ctx?.logger?.info('message bus connected');
  } catch (err) {
    ctx?.logger?.error('message bus connection failed');
    process.exit(1);
  }
  try {
    ctx?.logger?.info('connect to key value store');
    await kv.connect(config?.redis);
    ctx?.logger?.info('key value store connected');
  } catch (err) {
    ctx?.logger?.error('key value store connection failed');
    process.exit(1);
  }
}

async function onStop(): Promise<void> {
  bus.close();
  kv.close();
}

async function main(command: string): Promise<void> {
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
      workerServer.run(onStop, ctx);
      break;
    default:
      ctx?.logger?.info(`${command} tidak dikenali`);
      ctx?.logger?.info('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
