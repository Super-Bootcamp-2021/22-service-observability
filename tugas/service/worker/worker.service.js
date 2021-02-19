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

const { createTracer } = require('../lib/tracer');
const { throwError } = require('rxjs');
const tracer = createTracer('worker.service');

/**
 * register profile pekerja baru
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
function registerSvc(req, res) {
  const parentSpan = tracer.startSpan('worker_register');

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

  const span1 = tracer.startSpan('save file to storage', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('save data to database', {
    childOf: parentSpan,
  });

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        try {
          data.photo = await saveFile(file, mimetype);
          span1.setTag('info', true);
          span1.setTag('statusCode', res.statusCode);
          span1.log({
            event: 'save file to storage',
            message: 'success',
          });
          span1.finish();
        } catch (err) {
          abort();
          span1.setTag('error', true);
          span1.setTag('statusCode', res.statusCode);
          span1.log({
            event: 'error save file to storage',
            message: err,
          });
          span1.finish();
        }
        if (!req.aborted && finished) {
          try {
            const worker = await register(data);
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(worker));
            span2.setTag('info', true);
            span2.setTag('statusCode', res.statusCode);
            span2.log({
              event: 'save data to database',
              message: 'success',
            });
            span2.finish();
          } catch (err) {
            if (err === ERROR_REGISTER_DATA_INVALID) {
              res.statusCode = 401;
            } else {
              res.statusCode = 500;
            }
            res.write(err);
            span2.setTag('error', true);
            span2.setTag('statusCode', res.statusCode);
            span2.log({
              event: 'error save data to database',
              message: err,
            });
            span2.finish();
          }
          res.end();
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
  parentSpan.finish();
}

/**
 * menampilkan daftar pekrja
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function listSvc(req, res) {
  const parentSpan = tracer.startSpan('worker_list');
  const span1 = tracer.startSpan('get worker list', {
    childOf: parentSpan,
  });
  try {
    const workers = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    res.end();
    span1.setTag('info', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'get worker list',
      message: 'response ok',
    });
    span1.finish();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error get worker list',
      message: err,
    });
    span1.finish();
    return;
  }
  parentSpan.finish();
}

/**
 * menampilkan informasi dari pekerja
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function infoSvc(req, res) {
  const parentSpan = tracer.startSpan('worker_info');
  const span1 = tracer.startSpan('parsing query parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('get worker info by id', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error query parameter value is null',
      message: 'parameter id tidak ditemukan',
    });
    span1.finish();
    return;
  }
  try {
    const worker = await info(id);
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(worker));
    res.end();
    span2.setTag('info', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'get worker info by id',
      message: 'response ok',
    });
    span2.finish();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span2.setTag('error', true);
      span2.setTag('statusCode', res.statusCode);
      span2.log({
        event: 'error get worker info by id',
        message: err,
      });
      span2.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    span2.setTag('error', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'error get worker info by id',
      message: err,
    });
    span2.finish();
    return;
  }
  parentSpan.finish();
}

/**
 * menghapus data pekerja
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function removeSvc(req, res) {
  const parentSpan = tracer.startSpan('worker_remove');
  const span1 = tracer.startSpan('parsing query parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('remove worker data by id', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error remove worker data by id',
      message: 'parameter id tidak ditemukan',
    });
    span1.finish();
    return;
  }
  try {
    const worker = await remove(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
    span2.setTag('info', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'remove worker data by id',
      message: 'response ok',
    });
    span2.finish();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span2.setTag('error', true);
      span2.setTag('statusCode', res.statusCode);
      span2.log({
        event: 'error remove worker data by id',
        message: err,
      });
      span2.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    span2.setTag('error', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'error remove worker data by id',
      message: err,
    });
    span2.finish();
    return;
  }
  parentSpan.finish();
}

/**
 * menampilkan foto profil pekerja
 * @param {ClientRequest} req
 * @param {ServerResponse} res
 */
async function getPhotoSvc(req, res) {
  const parentSpan = tracer.startSpan('GET /photo/{filename}');
  const span1 = tracer.startSpan('parsing query parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('get worker photo', {
    childOf: parentSpan,
  });

  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/photo/', '');
  if (!objectName) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error get worker photo',
      message: 'request tidak sesuai',
    });
    span1.finish();
  }
  try {
    const objectRead = await readFile(objectName);
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    objectRead.pipe(res);
    span2.setTag('info', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'get worker photo',
      message: 'response ok',
    });
    span2.finish();
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span2.setTag('error', true);
      span2.setTag('statusCode', res.statusCode);
      span2.log({
        event: 'error get worker photo',
        message: err,
      });
      span2.finish();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    span2.setTag('error', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'error get worker photo',
      message: 'gagal membaca file',
    });
    span2.finish();
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
