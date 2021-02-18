/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createServer,
  IncomingMessage,
  Server,
  ServerOptions,
  ServerResponse,
} from 'http';
import * as url from 'url';
import { stdout } from 'process';
import {
  listSvc,
  registerSvc,
  removeSvc,
  infoSvc,
  getPhotoSvc,
} from './worker.service';
import { config } from '../config';

let server: Server;

export function run(callback) {
  server = createServer((req, res) => {
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
      const uri = url.parse(req.url!, true); // tanda ! diakhir variabel tanpa bahwa variabel tersebut pasti ada isinya
      switch (uri.pathname) {
        case '/register':
          if (req.method === 'POST') {
            return registerSvc(req, res);
          } else {
            respond(404, 'Method tidak tersedia');
          }
          break;
        case '/list':
          if (req.method === 'GET') {
            return listSvc(req, res);
          } else {
            respond(404, 'Method tidak tersedia');
          }
          break;
        case '/info':
          if (req.method === 'GET') {
            return infoSvc(req, res);
          } else {
            respond(404, 'Method tidak tersedia');
          }
          break;
        case '/remove':
          if (req.method === 'DELETE') {
            return removeSvc(req, res);
          } else {
            respond(404, 'Method tidak tersedia');
          }
          break;
        default:
          if (/^\/photo\/\w+/.test(uri.pathname!)) {
            return getPhotoSvc(req, res);
          }
          respond(404, 'Method tidak tersedia');
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
  const PORT = config.server?.port.worker;
  server.listen(PORT, () => {
    stdout.write(`🚀 worker service listening on port ${PORT}\n`);
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
    res.statusCode = 204;
    res.end();
    return true;
  }
}

export function stop() {
  if (server) {
    server.close();
  }
}
