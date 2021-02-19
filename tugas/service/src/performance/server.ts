/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import { summarySvc } from './performance.service';
import * as agg from './performance.agg';
import { config } from '../config';
import { createTracer } from '../lib/tracer';
import { JaegerTracer } from 'jaeger-client';

let server: Server;
const tracer: JaegerTracer = createTracer('performance-service');

export function run(callback: Function): void {
  server = createServer((req, res) => {
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
        case '/summary':
          if (req.method === 'GET') {
            return summarySvc(req, res, tracer);
          } else {
            respond(404);
          }
          break;
        default:
          respond(404);
      }
    } catch (err) {
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
  const PORT = config.server.performance;
  server.listen(PORT, () => {
    stdout.write(`🚀 performance service listening on port ${PORT}\n`);
  });
}

export function cors(req: IncomingMessage, res: ServerResponse) {
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
