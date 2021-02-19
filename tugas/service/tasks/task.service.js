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

const { createTracer } = require('../lib/tracer');
const tracer = createTracer('task.service');

/**
 * menambahkan pekerjaan baru
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
function addSvc(req, res) {
  const parentSpan = tracer.startSpan('POST /add');

  const busboy = new Busboy({ headers: req.headers });

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

  const span1 = tracer.startSpan('save file to storage', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('save data to database', {
    childOf: parentSpan,
  });

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'attachment':
        try {
          data.attachment = await saveFil(file, mimetype);
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
            const task = await add(data);
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(task));
            span2.setTag('info', true);
            span2.setTag('statusCode', res.statusCode);
            span2.log({
              event: 'save data to database',
              message: 'success',
            });
            span2.finish();
          } catch (err) {
            if (err === ERROR_TASK_DATA_INVALID) {
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
  parentSpan.finish();
}

/**
 * menampilkan daftar pekerjaan
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
async function listSvc(req, res) {
  const parentSpan = tracer.startSpan('GET /list');
  const span1 = tracer.startSpan('get task list', {
    childOf: parentSpan,
  });

  try {
    const tasks = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(tasks));
    res.end();
    span1.setTag('info', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'get task list',
      message: 'success',
    });
    span1.finish();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error get task list',
      message: err,
    });
    span1.finish();
    return;
  }
  parentSpan.finish();
}

async function doneSvc(req, res) {
  const parentSpan = tracer.startSpan('GET /done?id={id}');
  const span1 = tracer.startSpan('parsing query parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('done task by id', {
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
    const task = await done(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(task));
    res.end();
    span2.setTag('info', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'done task by id',
      message: 'success',
    });
    span2.finish();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span2.setTag('error', true);
      span2.setTag('statusCode', res.statusCode);
      span2.log({
        event: 'error done task by id',
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
      event: 'error done task by id',
      message: err,
    });
    span2.finish();
    return;
  }
  parentSpan.finish();
}

async function cancelSvc(req, res) {
  const parentSpan = tracer.startSpan('GET /cancel?id={id}');
  const span1 = tracer.startSpan('parsing query parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('cancel task by id', {
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
    const task = await cancel(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(task));
    res.end();
    span2.setTag('info', true);
    span2.setTag('statusCode', res.statusCode);
    span2.log({
      event: 'cancel task by id',
      message: 'success',
    });
    span2.finish();
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      span2.setTag('error', true);
      span2.setTag('statusCode', res.statusCode);
      span2.log({
        event: 'error cancel task by id',
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
      event: 'error cancel task by id',
      message: err,
    });
    span2.finish();
    return;
  }
  parentSpan.finish();
}

async function getAttachmentSvc(req, res) {
  const parentSpan = tracer.startSpan('GET /attachment/{filename}');
  const span1 = tracer.startSpan('parsing path parameter', {
    childOf: parentSpan,
  });
  const span2 = tracer.startSpan('get worker photo', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/attachment/', '');
  if (!objectName) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error get task attachment',
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
      event: 'get task attachment',
      message: 'success',
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
        event: 'error get task attachment',
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
      event: 'gagal membaca file',
      message: err,
    });
    span2.finish();
    return;
  }
  parentSpan.finish();
}

module.exports = {
  listSvc,
  addSvc,
  doneSvc,
  cancelSvc,
  getAttachmentSvc,
};
