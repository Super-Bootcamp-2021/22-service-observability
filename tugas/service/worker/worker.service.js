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

function registerSvc(req, res, tracer) {
  const busboy = new Busboy({ headers: req.headers });

  const data = {
    name: '',
    age: 0,
    bio: '',
    address: '',
    photo: '',
  };

  let finished = false;

  const parentSpan = tracer.startSpan('register worker');
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
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        try {
          data.photo = await saveFile(file, mimetype);
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
            const worker = await register(data);
            span2.finish();
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(worker));
            span3.finish();
          } catch (err) {
            span2.setTag('error', true);
            span2.log({
              event: 'error write to database',
              message: err,
            });
            span2.finish();
            if (err === ERROR_REGISTER_DATA_INVALID) {
              res.statusCode = 401;
            } else {
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
    if (['name', 'age', 'bio', 'address'].includes(fieldname)) {
      data[fieldname] = val;
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
  const parentSpan = tracer.startSpan('show list of worker');
  const span = tracer.startSpan('get worker data', { childOf: parentSpan });
  try {
    const workers = await list();
    span.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    res.end();
  } catch (err) {
    span.setTag('error', true);
    span.log({ event: 'error get data', message: err });
    span.finish();
    parentSpan.finish();
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function infoSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('info worker');
  const span = tracer.startSpan('get id worker', { childOf: parentSpan });
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
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  span.finish();
  const span2 = tracer.startSpan('get worker by id', { childOf: parentSpan });
  try {
    const worker = await info(id);
    span2.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(worker));
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      span2.setTag('error', true);
      span2.log({
        event: 'error get worker by id',
        message: err,
      });
      span2.finish();
      parentSpan.finish();
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
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function removeSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('remove worker');
  const span = tracer.startSpan('get id worker', { childOf: parentSpan });
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
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  span.finish();
  const span2 = tracer.startSpan('remove worker by id', {
    childOf: parentSpan,
  });
  try {
    const worker = await remove(id);
    span2.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      span2.setTag('error', true);
      span2.log({
        event: 'error remove worker by id',
        message: err,
      });
      span2.finish();
      parentSpan.finish();
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
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function getPhotoSvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('get photo worker');
  const span = tracer.startSpan('parse url', { childOf: parentSpan });
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/photo/', '');
  if (!objectName) {
    span.setTag('error', true);
    span.log({ event: 'error parse url', message: 'request tidak sesuai' });
    span.finish();
    parentSpan.finish();
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  span.finish();
  const span2 = tracer.startSpan('get photo worker', { childOf: parentSpan });
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
      span2.log({ event: 'error get photo', message: err });
      span2.finish();
      parentSpan.finish();
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span2.setTag('error', true);
    span2.log({ event: 'error get photo', message: err });
    span2.finish();
    parentSpan.finish();
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    return;
  }
}

module.exports = {
  listSvc,
  registerSvc,
  infoSvc,
  removeSvc,
  getPhotoSvc,
};
