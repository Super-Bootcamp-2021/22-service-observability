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

function registerSvc(req, res, ctx) {
  const busboy = new Busboy({ headers: req.headers });
  const parentSpan = ctx.startSpan('get_register_worker');
  const spanErrSavePhoto = ctx.startSpan('save_photo_error', {
    childOf: parentSpan,
  });

  const spanInvalidData = ctx.startSpan('invalid_data', {
    childOf: parentSpan,
  });

  const spanInternalServer = ctx.startSpan('internal_server_error', {
    childOf: parentSpan,
  });

  const data = {
    name: '',
    age: 0,
    bio: '',
    address: '',
    photo: '',
  };

  let finished = false;

  function abort() {
    spanErrSavePhoto.finish();
    spanInvalidData.finish();
    spanInternalServer.finish();
    parentSpan.finish();
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        try {
          data.photo = await saveFile(file, mimetype);
          spanErrSavePhoto.finish();
        } catch (err) {
          spanErrSavePhoto.setTag('error', true);
          abort();
        }
        if (!req.aborted && finished) {
          try {
            const worker = await register(data);
            spanInvalidData.finish();
            spanInternalServer.finish();
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(worker));
          } catch (err) {
            if (err === ERROR_REGISTER_DATA_INVALID) {
              res.statusCode = 401;
              spanInvalidData.finish();
              spanInvalidData.setTag('error', true);
            } else {
              res.statusCode = 500;
              spanInternalServer.finish();
              spanInternalServer.setTag('error', true);
            }
            res.write(err);
          }
          parentSpan.finish();
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
}

async function listSvc(req, res, ctx) {
  const span = ctx.startSpan('get_worker_list');
  try {
    const workers = await list();
    span.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    res.end();
  } catch (err) {
    span.setTag('error', true);
    span.finish();
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function infoSvc(req, res, ctx) {
  const parentSpan = ctx.startSpan('worker_info');
  const spanParseUrl = ctx.startSpan('parse_url_id', {
    childOf: parentSpan,
  });
  const spanGetInfo = ctx.startSpan('get_info', {
    childOf: parentSpan,
  });
  const spanNotFound = ctx.startSpan('user_not_found', {
    childOf: parentSpan,
  });

  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    spanParseUrl.setTag('error', true);
    spanParseUrl.finish();
    spanNotFound.finish();
    spanGetInfo.finish();
    parentSpan.finish();

    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  spanParseUrl.finish();
  try {
    const worker = await info(id);
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(worker));
    spanGetInfo.finish();
    spanNotFound.finish();
    parentSpan.finish();
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      spanNotFound.setTag('error', true);
      res.statusCode = 404;
      res.write(err);
      res.end();
      spanNotFound.finish();
      spanGetInfo.finish();
      parentSpan.finish();

      return;
    }
    spanGetInfo.setTag('error', true);
    spanGetInfo.finish();
    spanParseUrl.finish();
    spanNotFound.finish();
    parentSpan.finish();

    res.statusCode = 500;
    res.end();
    return;
  }
}

async function removeSvc(req, res, ctx) {
  const spanParent = ctx.startSpan('remove_worker');
  const spanParseUrl = ctx.startSpan('parse_url_id', {
    childOf: spanParent,
  });
  const spanRemoveWorker = ctx.startSpan('removing', {
    childOf: spanParent,
  });
  const spanNotFound = ctx.startSpan('user_not_found', {
    childOf: spanParent,
  });

  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    spanParseUrl.setTag('error', true);
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    spanParseUrl.finish();
    spanRemoveWorker.finish();
    spanNotFound.finish();
    spanParent.finish();
    return;
  }
  try {
    const worker = await remove(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
    spanParseUrl.finish();
    spanNotFound.finish();
    spanParent.finish();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      spanNotFound.setTag('error', true);
      spanRemoveWorker.finish();
      spanNotFound.finish();
      spanParent.finish();

      return;
    }
    res.statusCode = 500;
    res.end();
    spanRemoveWorker.setTag('error', true);
    spanNotFound.finish();
    spanRemoveWorker.finish();
    spanParent.finish();
    return;
  }
}

async function getPhotoSvc(req, res, ctx) {
  const spanParent = ctx.startSpan('get_photo_worker');
  const spanParseUrl = ctx.startSpan('parse_url', {
    childOf: spanParent,
  });
  const spanGetPhoto = ctx.startSpan('get_photo', {
    childOf: spanParent,
  });
  const spanNotFound = ctx.startSpan('photo_not_found', {
    childOf: spanParent,
  });

  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/photo/', '');
  if (!objectName) {
    spanParseUrl.setTag('error', true);
    spanParseUrl.finish();
    spanGetPhoto.finish();
    spanNotFound.finish();
    spanParent.finish();
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  spanParseUrl.finish();
  try {
    const objectRead = await readFile(objectName);
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    //finishing tracing
    spanParseUrl.finish();
    spanGetPhoto.finish();
    spanNotFound.finish();
    spanParent.finish();

    objectRead.pipe(res);
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      spanNotFound.setTag('error', true);
      spanGetPhoto.finish();
      spanNotFound.finish();
      spanParent.finish();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    spanGetPhoto.setTag('error', true);
    spanGetPhoto.finish();
    spanNotFound.finish();
    spanParent.finish();
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
