const Busboy = require('busboy');
const url = require('url');
const mime = require('mime-types');
const { Writable } = require('stream');
const {
  add,
  cancel,
  done,
  list,
  ERROR_TASK_DATA_INVALID,
  ERROR_TASK_NOT_FOUND,
} = require('./task');
const { saveFile, readFile, ERROR_FILE_NOT_FOUND } = require('../lib/storage');
const { createNodeLogger } = require('../lib/logger');

const logger = createNodeLogger('info', 'Task Service');

function addSvc(req, res, tracer) {
  const busboy = new Busboy({ headers: req.headers });

  const data = {
    job: '',
    assigneeId: 0,
    attachment: null,
  };

  let finished = false;

  const parentSpan = tracer.startSpan('add task');
  const span = tracer.startSpan('parsing body', { childOf: parentSpan });

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      span.setTag('error', true);
      span.log({
        event: 'error pasing body',
        message: 'input data tidak valid atau tidak lengkap',
      });
      span.finish();
      parentSpan.finish();
      logger.error('internal server error');
      res.statusCode = 500;
      res.write('internal server error');
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'attachment':
        try {
          data.attachment = await saveFile(file, mimetype);
        } catch (err) {
          abort();
        }
        if (!req.aborted && finished) {
          span.finish();
          const span2 = tracer.startSpan('write to database', {
            childOf: parentSpan,
          });
          const span3 = tracer.startSpan('encode result', {
            childOf: parentSpan,
          });
          try {
            const task = await add(data);
            span2.finish();
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(task));
            span3.finish();
          } catch (err) {
            span2.setTag('error', true);
            span2.log({
              event: 'error write to database',
              message: err,
            });
            span2.finish();
            if (err === ERROR_TASK_DATA_INVALID) {
              logger.error('Unauthorized add task');
              res.statusCode = 401;
            } else {
              logger.error('internal server error');
              res.statusCode = 500;
            }
            span3.setTag('error', true);
            span3.log({ event: 'error input data', message: err });
            span3.finish();
            res.write(err);
          }
          parentSpan.finish();
          res.end();
        }
        span.finish();
        parentSpan.finish();
        break;
      default: {
        const noop = new Writable({
          write(chunk, encding, callback) {
            setImmediate(callback);
          },
        });
        file.pipe(noop);
      }
    }
  });

  busboy.on('field', (fieldname, val) => {
    switch (fieldname) {
      case 'job':
        data.job = val;
        break;
      case 'assignee_id':
        data.assigneeId = parseInt(val, 10);
        break;
    }
  });

  busboy.on('finish', async () => {
    finished = true;
    parentSpan.finish();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

async function listSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('show list tasks');
  const span = tracer.startSpan('get list tasks', { childOf: parentSpan });
  try {
    const tasks = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(tasks));
    span.finish();
    parentSpan.finish();
    res.end();
  } catch (err) {
    span.setTag('error', true);
    span.log({ event: 'error get tasks', message: err });
    span.finish();
    parentSpan.finish();
    logger.error('internal server error');
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function doneSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('done task');
  const span = tracer.startSpan('get id task', { childOf: parentSpan });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    span.setTag('error', true);
    span.log({
      event: 'error get id',
      message: 'parameter id tidak ditemukan',
    });
    res.statusCode = 401;
    logger.error('Unauthorized done task');
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  span.finish();
  const span2 = tracer.startSpan('get worker by id', { childOf: parentSpan });
  try {
    const task = await done(id);
    span2.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(task));
    res.end();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      span2.setTag('error', true);
      span2.log({
        event: 'error get task by id',
        message: err,
      });
      span2.finish();
      parentSpan.finish();
      logger.error('Id worker not found');
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span2.log({
      event: 'internal server error',
      message: err,
    });
    span2.finish();
    parentSpan.finish();
    logger.error('internal server error');
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function cancelSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('cancel task');
  const span = tracer.startSpan('parse url', { childOf: parentSpan });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    span.setTag('error', true);
    span.log({
      event: 'error get id',
      message: 'parameter id tidak ditemukan',
    });
    span.finish();
    parentSpan.finish();
    res.statusCode = 401;
    logger.error('Unauthorized cancel task');
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  span.finish();
  const span2 = tracer.startSpan('cancel task by id', {
    childOf: parentSpan,
  });
  try {
    const task = await cancel(id);
    span2.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(task));
    res.end();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      span2.setTag('error', true);
      span2.log({
        event: 'error cancel task by id',
        message: err,
      });
      span2.finish();
      parentSpan.finish();
      logger.error('Not found cancel task');
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span2.setTag('error', true);
    span2.log({
      event: 'internal server error',
      message: err,
    });
    span2.finish();
    parentSpan.finish();
    logger.error('internal server error');
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function getAttachmentSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('get attachment task');
  const span = tracer.startSpan('parse url', { childOf: parentSpan });
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/attachment/', '');
  if (!objectName) {
    span.setTag('error', true);
    span.log({ event: 'error parse url', message: 'request tidak sesuai' });
    span.finish();
    parentSpan.finish();
    res.statusCode = 400;
    logger.error('Bad request');
    res.write('request tidak sesuai');
    res.end();
  }
  span.finish();
  const span2 = tracer.startSpan('get attachment task', {
    childOf: parentSpan,
  });
  try {
    const objectRead = await readFile(objectName);
    span2.finish();
    parentSpan.finish();
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    objectRead.pipe(res);
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      span2.setTag('error', true);
      span2.log({ event: 'error get task', message: err });
      span2.finish();
      parentSpan.finish();
      logger.error('Not found attachment');
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span2.setTag('error', true);
    span2.log({ event: 'error get task', message: err });
    span2.finish();
    parentSpan.finish();
    res.statusCode = 500;
    logger.error('internal server error');
    res.write('gagal membaca file');
    res.end();
    return;
  }
}

module.exports = {
  listSvc,
  addSvc,
  doneSvc,
  cancelSvc,
  getAttachmentSvc,
};
