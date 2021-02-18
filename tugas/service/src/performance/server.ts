import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import { summarySvc } from './performance.service';
import * as agg from './performance.agg';
import { config } from '../config';
import { AppContext } from '../lib/context';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from '../lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from '../lib/tracer';

let ctx: AppContext;
let server: any;

export function run(callback: any) {
  const logger: Logger = createNodeLogger(LogLevel.info, 'performance-service');
  const tracer: JaegerTracer = createTracer('performance-service');
  ctx = {
    logger,
    tracer,
  };

  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // cors
    const aborted = cors(req, res);
    if (aborted) {
      return;
    }

    function respond(statusCode?: any, message?: any) {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      const uri = url.parse(req.url, true);
      switch (uri.pathname) {
        case '/summary':
          if (req.method === 'GET') {
            ctx?.logger?.info('request summary');
            return summarySvc(req, res, ctx);
          } else {
            respond(404, "not found");
            ctx?.logger?.error('(404) method request to performance host not found');
          }
          break;
        default:
          respond(404, "not found");
          ctx?.logger?.error('(404) pathname request to performance host not found');
      }
    } catch (err) {
      respond(500, 'unkown server error');
      ctx?.logger?.error('(500) unkown server error when request to performance host');
    }
  });

  // run aggregation
  agg.run();

  // stop handler
  server.on('close', () => {
    agg.stop();
    if (callback) {
      callback();
    }
  });

  // run server
  const PORT = config?.server?.portPerformance;
  server.listen(PORT, () => {
    stdout.write(`🚀 performance service listening on port ${PORT}\n`);
  });
}

export function cors(req: any, res: any) {
  // handle preflight request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT');
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
