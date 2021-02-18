/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from './lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from './lib/tracer';
import { AppContext } from './lib/context';
let ctx: AppContext;

async function init(arr: string) {
  const logger: Logger = createNodeLogger(LogLevel.info, arr);
  const tracer: JaegerTracer = createTracer(arr);
  ctx = {
    logger,
    tracer,
  };
  try {
    ctx.logger.info('connect to database');
    await orm.connect([WorkerSchema, TaskSchema], {
      type: config.database?.type,
      host: config.database?.host,
      port: config.database?.port,
      username: config.database?.username,
      password: config.database?.password,
      database: config.database?.database,
    });
    ctx.logger.info('database connected');
  } catch (err: any) {
    ctx.logger.error('database connection failed');
    process.exit(1);
  }
  try {
    ctx.logger.info('connect to object storage');
    await storage.connect('task-manager', {
      endPoint: config.minio?.endPoint,
      port: config.minio?.port,
      useSSL: config.minio?.useSSL,
      accessKey: config.minio?.accessKey,
      secretKey: config.minio?.secretKey,
    });
    ctx.logger.info('object storage connected');
  } catch (err: any) {
    ctx.logger.error('object storage connection failed');
    process.exit(1);
  }
  try {
    ctx.logger.info('connect to message bus');
    await bus.connect(`nats://${config.nats?.hostname}:${config.nats?.port}`); //update library
    ctx.logger.info('message bus connected');
  } catch (err: any) {
    ctx.logger.error('message bus connection failed');
    process.exit(1);
  }
  try {
    ctx.logger.info('connect to key value store');
    await kv.connect({
      host: config.kv.hostname,
      port: config.kv.port,
    }); //update library
    ctx.logger.info('key value store connected');
  } catch (err: any) {
    ctx.logger.error('key value store connection failed');
    process.exit(1);
  }
}

async function onStop() {
  const logger: Logger = createNodeLogger(LogLevel.info, 'main-stop');
  const tracer: JaegerTracer = createTracer('main-stop');
  ctx = {
    logger,
    tracer,
  };
  ctx.logger.info('bus disconect');
  bus.close();
  ctx.logger.info('bus disconected');
  ctx.logger.info('kv disconect');
  kv.close();
  ctx.logger.info('kv disconected');
}

async function main(command) {
  const logger: Logger = createNodeLogger(LogLevel.info, 'main-comand');
  const tracer: JaegerTracer = createTracer('main-comand');
  ctx = {
    logger,
    tracer,
  };
  switch (command) {
    case 'performance':
      ctx.logger.info('performance server start');
      await init('performance');
      performanceServer.run(onStop);
      ctx.logger.info('performance server running');
      break;
    case 'task':
      ctx.logger.info('task server start');
      await init('task');
      tasksServer.run(onStop);
      ctx.logger.info('task server running');
      break;
    case 'worker':
      ctx.logger.info('worker server start');
      await init('worker');
      workerServer.run(onStop);
      ctx.logger.info('worker server running');
      break;
    default:
      ctx.logger.info(`${command} tidak dikenali`);
      ctx.logger.info('command yang valid: task, worker, performance');
  }
}

main(process.argv[2]);
