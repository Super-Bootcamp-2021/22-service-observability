/** @module WorkerService */
const Busboy = require('busboy');
const url = require('url');
const mime = require('mime-types');
const { Writable } = require('stream');
const {
  register,
  list,
  remove,
  info,
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
} = require('./worker');
const { saveFile, readFile, ERROR_FILE_NOT_FOUND } = require('../lib/storage');
// eslint-disable-next-line no-unused-vars
const { ClientRequest, IncomingMessage, ServerResponse } = require('http');

/**
 * service to regiser worker
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
function registerSvc(req, res, { tracer, logger }) {
  const busboy = new Busboy({ headers: req.headers });

  const data = {
    name: '',
    age: 0,
    bio: '',
    address: '',
    photo: '',
  };

  let finished = false;

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    const parentSpan = tracer.startSpan('post_add');
    const span = tracer.startSpan('parsing_body', {
      childOf: parentSpan,
    });
    switch (fieldname) {
      case 'photo':
        try {
          data.photo = await saveFile(file, mimetype);
        } catch (err) {
          abort();
          logger.error('photo is null');
          span.setTag('error', true);
          span.log({
            event: 'error parsing body',
            message: 'parameter photo tidak ada',
          });
        }
        if (!req.aborted && finished) {
          const span1 = tracer.startSpan('write_worker_on_db', {
            childOf: parentSpan,
          });
          try {
            const worker = await register(data);
            span1.finish();
            res.setHeader('content-type', 'application/json');
            const span2 = tracer.startSpan('encode_result', {
              childOf: parentSpan,
            });
            res.write(JSON.stringify(worker));
          } catch (err) {
            span1.finish();
            if (err === ERROR_REGISTER_DATA_INVALID) {
              res.statusCode = 401;
              logger.error('ERROR_REGISTER_DATA_INVALID');
              span.setTag('error', true);
              span.log({
                event: 'error write to database',
                message: err.message,
              });
            } else {
              res.statusCode = 500;
              logger.error('data worker tidak lengkap');
              span.setTag('error', true);
              span.log({
                event: 'error parsing body',
                message: 'parameter worker tidak valid',
              });
            }
            const span2 = tracer.startSpan('encode_result', {
              childOf: parentSpan,
            });
            res.write(err);
          }
          res.end();
          span2.finish();
        }
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
    parentSpan.finish();
  });

  busboy.on('field', (fieldname, val) => {
    if (['name', 'age', 'bio', 'address'].includes(fieldname)) {
      data[fieldname] = val;
    }
  });

  busboy.on('finish', async () => {
    finished = true;
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

/**
 * service to get list of workers
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
async function listSvc(req, res, { tracer, logger }) {
  const parentSpan = tracer.startSpan('get_list');
  const span = tracer.startSpan('getlist', {
    childOf: parentSpan,
  });
  try {
    const workers = await list();
    span.finish();
    res.setHeader('content-type', 'application/json');
    const span1 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(workers));
    res.end();
    span1.finish();
  } catch (err) {
    span.finish();
    res.statusCode = 500;
    res.end();
    span.finish();
    return;
  }
  parentSpan.finish();
}

/**
 * service to get info workers
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function infoSvc(req, res, { tracer, logger }) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('get_by_id');
  const span = tracer.startSpan('getById', {
    childOf: parentSpan,
  });
  if (!id) {
    logger.error('id is null');
      span.setTag('error', true);
      span.log({
        event: 'error parsing body',
        message: 'parameter id tidak ada',
      });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span.finish();
    return;
  }
  const span1 = tracer.startSpan('membaca worker dari database', {
    childOf: parentSpan,
  });
  try {
    const worker = await info(id);
    span1.finish();
    res.setHeader('content-type', 'application/json');
    const span2 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(worker));
    res.end();
    span2.finish();
  } catch (err) {
    span1.finish();
    span.setTag('error', true);
    span.log({
        event: 'error write to database',
      message: err.message,
    });
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    span.finish();
    return;
  }
  parentSpan.finish();
}

/**
 * service to remove a worker by id
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function removeSvc(req, res, { tracer, logger }) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('hapus');
  const span = tracer.startSpan('hapus', {
    childOf: parentSpan,
  });
  if (!id) {
    logger.error('id is null');
      span.setTag('error', true);
      span.log({
        event: 'error parsing body',
        message: 'parameter id tidak ada',
      });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span.finish();
    return;
  }
  const span1 = tracer.startSpan('mengapus worker dari database', {
    childOf: parentSpan,
  });
  try {
    const worker = await remove(id);
    span1.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    const span2 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(worker));
    res.end();
    span2.finish();
  } catch (err) {
    span1.finish();
    span.setTag('error', true);
    span.log({
        event: 'error write to database',
      message: err.message,
    });
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    span.finish();
    return;
  }
}

/**
 *  service to get a photo of worker
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function getPhotoSvc(req, res) {
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/photo/', '');
  if (!objectName) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  try {
    const objectRead = await readFile(objectName);
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    objectRead.pipe(res);
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    return;
  }
  parentSpan.finish();
}

module.exports = {
  listSvc,
  registerSvc,
  infoSvc,
  removeSvc,
  getPhotoSvc,
};
