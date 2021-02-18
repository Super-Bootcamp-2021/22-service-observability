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

function addSvc(req, res, ctx) {
  const busboy = new Busboy({ headers: req.headers });
  const spanParent = ctx.startSpan('add_task');
  const spanErrSavePhoto = ctx.startSpan('save_attachment', {
    childOf: spanParent,
  });

  const spanInvalidData = ctx.startSpan('invalid_data', {
    childOf: spanParent,
  });

  const spanInternalServer = ctx.startSpan('internal_server_error', {
    childOf: spanParent,
  });

  const data = {
    job: '',
    assigneeId: 0,
    attachment: null,
  };

  let finished = false;

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
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
          spanErrSavePhoto.finish();
        } catch (err) {
          spanErrSavePhoto.setTag('error', true);
          spanErrSavePhoto.finish();
          spanInternalServer.finish();
          spanInvalidData.finish();
          spanParent.finish();
          abort();
        }
        if (!req.aborted && finished) {
          try {
            const task = await add(data);
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(task));
            spanInternalServer.finish();
            spanInvalidData.finish();
            spanParent.finish();
          } catch (err) {
            if (err === ERROR_TASK_DATA_INVALID) {
              res.statusCode = 401;
              spanInvalidData.setTag('error', true);
              spanInternalServer.finish();
              spanInvalidData.finish();
              spanParent.finish();
            } else {
              res.statusCode = 500;
              spanInternalServer.setTag('error', true);
              spanInternalServer.finish();
              spanInvalidData.finish();
              spanParent.finish();
            }
            res.write(err);
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
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

async function listSvc(req, res, ctx) {
  const spanGetList = ctx.startSpan('get_list_task');

  try {
    const tasks = await list();
    spanGetList.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(tasks));
    res.end();
  } catch (err) {
    res.statusCode = 500;
    spanGetList.setTag('error', true);
    spanGetList.finish();
    res.end();
    return;
  }
}

async function doneSvc(req, res, ctx) {
  const spanParent = ctx.startSpan('get_list_task');
  const spanParseUrl = ctx.startSpan('parse_url', {
    childOf: spanParent,
  });
  const spanTaskDone = ctx.startSpan('set_task_done', {
    childOf: spanParent,
  });
  const spanTaskNotFound = ctx.startSpan('task_not_found', {
    childOf: spanParent,
  });

  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    spanParseUrl.setTag('error', true);
    spanParseUrl.finish();
    spanTaskDone.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  spanParseUrl.finish();
  try {
    const task = await done(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    spanTaskDone.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.write(JSON.stringify(task));
    res.end();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      spanTaskNotFound.setTag('error', true);
      spanTaskNotFound.finish();
      spanTaskDone.finish();
      spanParent.finish();
      res.write(err);
      res.end();
      return;
    }
    spanTaskDone.setTag('error', true);
    spanTaskDone.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function cancelSvc(req, res, ctx) {
  const spanParent = ctx.startSpan('get_list_task');
  const spanParseUrl = ctx.startSpan('parse_url', {
    childOf: spanParent,
  });
  const spanTaskCancel = ctx.startSpan('set_task_done', {
    childOf: spanParent,
  });
  const spanTaskNotFound = ctx.startSpan('task_not_found', {
    childOf: spanParent,
  });

  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    spanParseUrl.setTag('error', true);
    spanParseUrl.finish();
    spanTaskCancel.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  spanParseUrl.finish();
  try {
    const task = await cancel(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    spanTaskCancel.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.write(JSON.stringify(task));
    res.end();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      spanTaskNotFound.setTag('error', true);
      spanTaskCancel.finish();
      spanTaskNotFound.finish();
      spanParent.finish();
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    spanTaskCancel.setTag('error', true);
    spanTaskCancel.finish();
    spanTaskNotFound.finish();
    spanParent.finish();
    res.end();
    return;
  }
}

async function getAttachmentSvc(req, res, ctx) {
  const spanParent = ctx.startSpan('get_photo_worker');
  const spanParseUrl = ctx.startSpan('parse_url', {
    childOf: spanParent,
  });
  const spanGetAttachment = ctx.startSpan('get_attachemnt', {
    childOf: spanParent,
  });
  const spanNotFound = ctx.startSpan('photo_not_found', {
    childOf: spanParent,
  });
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/attachment/', '');
  if (!objectName) {
    spanParseUrl.setTag('error', true);
    spanParseUrl.finish();
    spanGetAttachment.finish();
    spanNotFound.finish();
    spanParent.finish();
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  try {
    const objectRead = await readFile(objectName);
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    //finishing tracing
    spanParseUrl.finish();
    spanGetAttachment.finish();
    spanNotFound.finish();
    spanParent.finish();

    objectRead.pipe(res);
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      spanNotFound.setTag('error', true);
      spanGetAttachment.finish();
      spanNotFound.finish();
      spanParent.finish();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    spanGetAttachment.setTag('error', true);
    spanGetAttachment.finish();
    spanNotFound.finish();
    spanParent.finish();
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
