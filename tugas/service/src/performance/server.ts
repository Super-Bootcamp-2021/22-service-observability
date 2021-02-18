import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import { summarySvc } from './performance.service';
import * as agg from './performance.agg';
import { config } from '../config';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from '../lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from '../lib/tracer';
import { AppContext } from '../lib/context';

let server: Server;
let ctx: AppContext;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function run(callback: () => void) {
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

    function respond(statusCode: number, message: string) {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parentSpan = tracer.startSpan('Performance_endpoint');
      const span = tracer.startSpan('Swtiching endpoint', {
        childOf: parentSpan,
      });
      const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
      switch (uri?.pathname) {
        case '/summary':
          if (req?.method === 'GET') {
            span.finish();
            parentSpan.finish();
            return summarySvc(req, res, ctx);
          } else {
            span.setTag('error', true);
            span.log({
              event: 'error using method',
              message: 'method tidaks sesuai',
            });
            span.finish();
            parentSpan.finish();
            ctx.logger.error(`404, method salah`);
            respond(404, 'tidak ketemu');
          }
          break;
        default:
          span.setTag('error', true);
          span.log({
            event: 'error pathname',
            message: 'pathname kosong',
          });
          span.finish();
          parentSpan.finish();
          ctx.logger.error(`404, pathname kosong`);
          respond(404, 'tidak ketemu');
      }
    } catch (err) {
      ctx.logger.error(`${res.statusCode},${err}`);
      respond(500, 'unkown server error');
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
  const PORT: number = config.server.port.performance;
  server.listen(PORT, () => {
    stdout.write(`🚀 performance service listening on port ${PORT}\n`);
  });
}

export function cors(
  req: IncomingMessage,
  res: ServerResponse
): boolean | undefined {
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

export function stop(): void {
  if (server) {
    server.close();
  }
}
