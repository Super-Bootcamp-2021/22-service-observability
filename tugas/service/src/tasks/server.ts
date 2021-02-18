import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import {
  addSvc,
  cancelSvc,
  doneSvc,
  listSvc,
  getAttachmentSvc,
} from './task.service';
import { config } from '../config';
import { AppContext } from '../lib/context';
import { Logger } from 'winston';
import { JaegerTracer } from 'jaeger-client';
import { createNodeLogger, LogLevel } from '../lib/logger';
import { createTracer } from '../lib/tracer';

let server;
let ctx: AppContext;

export function run(callback) {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const logger: Logger = createNodeLogger(LogLevel.info, 'task-service');
    const tracer: JaegerTracer = createTracer('task-service');
    ctx = {
      logger,
      tracer,
    };
    
    // cors
    const aborted = cors(req, res);
    if (aborted) {
      return;
    }

    function respond(statusCode: number, message?: string) {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      const uri = url.parse(req.url, true);
      switch (uri.pathname) {
        case '/add':
          if (req.method === 'POST') {
            return addSvc(req, res, ctx);
          } else {
            respond(404);
          }
          break;
        case '/list':
          if (req.method === 'GET') {
            return listSvc(req, res, ctx);
          } else {
            respond(404);
          }
          break;
        case '/done':
          if (req.method === 'PUT') {
            return doneSvc(req, res, ctx);
          } else {
            respond(404);
          }
          break;
        case '/cancel':
          if (req.method === 'PUT') {
            return cancelSvc(req, res, ctx);
          } else {
            respond(404);
          }
          break;
        default:
          if (/^\/attachment\/\w+/.test(uri.pathname)) {
            return getAttachmentSvc(req, res, ctx);
          }
          respond(404);
      }
    } catch (err) {
      respond(500, 'unkown server error');
    }
  });

  // stop handler
  server.on('close', () => {
    if (callback) {
      callback();
    }
  });

  // run server
  const PORT = config?.server?.portTask;
  server.listen(PORT, () => {
    stdout.write(`🚀 task service listening on port ${PORT}\n`);
  });
}

export function cors(req: IncomingMessage, res: ServerResponse) {
  // handle preflight request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
}

export function stop() {
  if (server) {
    server.close();
  }
}
