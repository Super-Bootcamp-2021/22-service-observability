const { createServer } = require('http');
const url = require('url');
const { stdout } = require('process');
const {
  listSvc,
  registerSvc,
  removeSvc,
  infoSvc,
  getPhotoSvc,
} = require('./worker.service');
const { config } = require('../config');
const { createTracer } = require('../lib/tracer');
const { createNodeLogger } = require('../lib/logger');

const logger = createNodeLogger('info', 'Worker Service');
let server;

function run(callback) {
  const tracer = createTracer('worker-service');
  server = createServer((req, res) => {
    // cors
    const aborted = cors(req, res);
    if (aborted) {
      return;
    }

    function respond(statusCode, message) {
      res.statusCode = statusCode || 200;
      res.write(message || '');
      res.end();
    }

    try {
      const uri = url.parse(req.url, true);
      switch (uri.pathname) {
        case '/register':
          if (req.method === 'POST') {
            return registerSvc(req, res, tracer);
          } else {
            logger.error('page not found');
            respond(404);
          }
          break;
        case '/list':
          if (req.method === 'GET') {
            return listSvc(req, res, tracer);
          } else {
            logger.error('page not found');
            respond(404);
          }
          break;
        case '/info':
          if (req.method === 'GET') {
            return infoSvc(req, res, tracer);
          } else {
            logger.error('page not found');
            respond(404);
          }
          break;
        case '/remove':
          if (req.method === 'DELETE') {
            return removeSvc(req, res, tracer);
          } else {
            logger.error('page not found');
            respond(404);
          }
          break;
        default:
          if (/^\/photo\/\w+/.test(uri.pathname)) {
            return getPhotoSvc(req, res, tracer);
          }
          logger.error('page not found');
          respond(404);
      }
    } catch (err) {
      logger.error('unkown server error');
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
  const PORT = config.server?.port?.worker;
  server.listen(PORT, () => {
    stdout.write(`🚀 worker service listening on port ${PORT}\n`);
  });
}

function cors(req, res) {
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

function stop() {
  if (server) {
    server.close();
  }
}

module.exports = {
  run,
  stop,
  cors,
};
