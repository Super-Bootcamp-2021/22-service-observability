import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import { summarySvc } from './performance.service';
import * as agg from './performance.agg';
import { config } from '../config';

let server: Server;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function run(callback: () => void) {
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
      const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
      switch (uri?.pathname) {
        case '/summary':
          if (req?.method === 'GET') {
            return summarySvc(req, res);
          } else {
            respond(404, 'tidak ketemu');
          }
          break;
        default:
          respond(404, 'tidak ketemu');
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
