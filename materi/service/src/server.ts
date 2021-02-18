import { createServer, IncomingMessage, ServerResponse } from 'http';
import { connect } from './lib/orm';
import * as url from 'url';
import { stdout } from 'process';
import { listSvc, addSvc, removeSvc, doneSvc, undoneSvc } from './todo.service';
import { TodoSchema } from './todo.model';
import { config } from './config';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from './lib/logger';

const logger: Logger = createNodeLogger(LogLevel.info);

/**
 * intiate database connection
 */
async function init(): Promise<void> {
  try {
    logger.info('connect to database');
    await connect([TodoSchema], config.database);
    logger.info('database connected');
  } catch (err) {
    logger.error('database connection failed');
    process.exit(1);
  }
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const method = req.method;
  // handle preflight request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // route service
  let message = 'tidak ditemukan data';
  let statusCode = 200;
  const uri = url.parse(req.url, true);
  const respond = (): void => {
    res.statusCode = statusCode;
    res.write(message);
    res.end();
  };
  switch (true) {
    case uri.pathname === '/add':
      if (method === 'POST') {
        addSvc(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    case uri.pathname === '/remove':
      if (method === 'POST') {
        removeSvc(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    case uri.pathname === '/list':
      if (method === 'GET') {
        listSvc(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    case uri.pathname === '/done':
      if (method === 'PUT') {
        doneSvc(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    case uri.pathname === '/undone':
      if (method === 'PUT') {
        undoneSvc(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    default:
      statusCode = 404;
      respond();
  }
});

init();
const PORT = config.server.port;
server.listen(PORT, () => {
  stdout.write(`server listening on port ${PORT}\n`);
});
