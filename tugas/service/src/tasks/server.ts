import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
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
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from '../lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from '../lib/tracer';
import { AppContext } from '../lib/context';

let server: Server;

let ctx: AppContext;

export function run(callback: () => void) {
  const logger: Logger = createNodeLogger(LogLevel.info, 'server-task');
  const tracer: JaegerTracer = createTracer('server-task');
  ctx = {
    logger,
    tracer,
  };
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // cors
    const aborted = cors(req, res);
    if (aborted) {
      ctx.logger.info('request cors');
      return;
    }

    function respond(statusCode: number, message: string) {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
      switch (uri.pathname) {
        case '/add':
          if (req.method === 'POST') {
            ctx.logger.info(
              `memulai request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()}`
            );
            return addSvc(req, res, ctx);
          } else {
            ctx.logger.error(
              `request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()} tidak ditemukan`
            );
            respond(404, 'tidak ditemukan');
          }
          break;
        case '/list':
          if (req.method === 'GET') {
            ctx.logger.info(
              `memulai request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()}`
            );
            return listSvc(req, res, ctx);
          } else {
            ctx.logger.error(
              `request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()} tidak ditemukan`
            );
            respond(404, 'tidak ditemukan');
          }
          break;
        case '/done':
          if (req.method === 'PUT') {
            ctx.logger.info(
              `memulai request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()}`
            );
            return doneSvc(req, res, ctx);
          } else {
            ctx.logger.error(
              `request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()} tidak ditemukan`
            );
            respond(404, 'tidak ditemukan');
          }
          break;
        case '/cancel':
          if (req.method === 'PUT') {
            ctx.logger.info(
              `memulai request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()}`
            );
            return cancelSvc(req, res, ctx);
          } else {
            ctx.logger.error(
              `request end point ${
                uri.pathname
              } method ${req.method.toLowerCase()} tidak ditemukan`
            );
            respond(404, 'tidak ditemukan');
          }
          break;
        default:
          if (/^\/attachment\/\w+/.test(uri.pathname!)) {
            ctx.logger.info(`memulai request end point ${uri.pathname} task`);
            return getAttachmentSvc(req, res, ctx);
          }
          ctx.logger.error(`request end point ${uri.pathname} tidak ditemukan`);
          respond(404, 'tidak ditemukan');
      }
    } catch (err) {
      ctx.logger.error(`unknown server error`);
      respond(500, 'unkown server error');
    }
  });

  // stop handler
  server.on('close', () => {
    ctx.logger.info('server dimatikan');
    if (callback) {
      callback();
    }
  });

  // run server
  const PORT = config.server.port.task;
  server.listen(PORT, () => {
    stdout.write(`🚀 task service listening on port ${PORT}\n`);
    ctx.logger.info('server running');
  });
}

export function cors(
  req: IncomingMessage,
  res: ServerResponse
): boolean | undefined {
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

export function stop(): void {
  if (server) {
    server.close();
  }
}
