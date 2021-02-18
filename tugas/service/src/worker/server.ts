import { createServer } from 'http';
import * as url from 'url';
import { stdout } from 'process';
import {
  listSvc,
  registerSvc,
  removeSvc,
  infoSvc,
  getPhotoSvc,
} from './worker.service';
import { IncomingMessage, ServerResponse } from 'http';
import { config } from '../config';

let server: any;

export function run(callback: () => any): void {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // cors
    const aborted = cors(req, res);
    if (aborted) {
      return;
    }

    function respond(statusCode: number, message: string): void {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      const uri = url.parse(req.url, true);
      console.log(uri.pathname);
      switch (uri.pathname) {
        case '/register':
          if (req.method === 'POST') {
            return registerSvc(req, res);
          } else {
            respond(404, 'Method not found');
          }
          break;
        case '/list':
          if (req.method === 'GET') {
            return listSvc(req, res);
          } else {
            respond(404, 'Method not found');
          }
          break;
        case '/info':
          if (req.method === 'GET') {
            return infoSvc(req, res);
          } else {
            respond(404, 'Method not found');
          }
          break;
        case '/remove':
          if (req.method === 'DELETE') {
            return removeSvc(req, res);
          } else {
            respond(404, 'Method not found');
          }
          break;
        default:
          if (/^\/photo\/\w+/.test(uri.pathname)) {
            return getPhotoSvc(req, res);
          }
          respond(404, 'Method not found');
      }
    } catch (err) {
      respond(500, 'unkown server error');
    }
  });

  // stop handler
  server.on('close', (): void => {
    if (callback) {
      callback();
    }
  });

  // run server
  const PORT = config?.server?.portWorker;
  server.listen(PORT, (): void => {
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

export function stop(): void {
  if (server) {
    server.close();
  }
}
