import * as Busboy from 'busboy';
import * as url from 'url';
import * as mime from 'mime-types';
import { Writable } from 'stream';
import {
  add,
  cancel,
  done,
  list,
  ERROR_TASK_DATA_INVALID,
  ERROR_TASK_NOT_FOUND,
} from './task';
import { saveFile, readFile, ERROR_FILE_NOT_FOUND } from '../lib/storage';
import { IncomingMessage, ServerResponse } from 'http';
import { AppContext } from '../lib/context';

export function addSvc(req: IncomingMessage, res: ServerResponse, { tracer, logger }: AppContext) {
  const busboy = new Busboy({ headers: req.headers });
  const parentSpan = tracer.startSpan('task_add');

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

  busboy.on('file', async (fieldname: string, file: any, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'attachment':
        try {
          data.attachment = await saveFile(file, mimetype);
        } catch (err) {
          abort();
        }
        if (!req.aborted && finished) {
          const span = tracer.startSpan('add_to_db', {
            childOf: parentSpan,
          });
          try {
            const task = await add(data);
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(task));
            span.finish();
          } catch (err) {
            if (err === ERROR_TASK_DATA_INVALID) {
              res.statusCode = 401;
              logger.error(err);
              span.setTag('error', true);
              span.log({
                event: 'error write to database',
                message: err,
              });
              span.finish();
            } else {
              res.statusCode = 500;
            }
            res.write(err);
          }
          res.end();
          parentSpan.finish();
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

  busboy.on('field', (fieldname: string, val: string) => {
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

export async function listSvc(req: IncomingMessage, res: ServerResponse, { tracer, logger }: AppContext) {
  const parentSpan = tracer.startSpan('task_list');
  try {
    const tasks = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(tasks));
    res.end();
    parentSpan.finish();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'error get list task',
      message: err?.message,
    });
    parentSpan.finish();
    return;
  }
}

export async function doneSvc(req: IncomingMessage, res: ServerResponse, { tracer, logger }: AppContext) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'] as string;
  const parentSpan = tracer.startSpan('task_done');
  const span = tracer.startSpan('check_id', {
    childOf: parentSpan,
  });

  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    logger.error('parameter id tidak ditemukan');
    span.setTag('error', true);
    span.log({
      event: 'error get id paramater',
      message: 'parameter id tidak ditemukan',
    });
    span.finish();
    parentSpan.finish();
    return;
  }
  span.finish();

  const span2 = tracer.startSpan('get_task_from_db_by_id', {
    childOf: parentSpan,
  });
  try {
    const task = await done(parseInt(id, 10));
    span2.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(task));
    res.end();
    span3.finish();
  } catch (err) {
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      logger.error(err);
      span2.setTag('error', true);
      span2.log({
        event: 'error get task by id',
        message: err,
      });
      span2.finish();
      span3.finish();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    logger.error(err);
    span2.setTag('error', true);
    span2.log({
      event: 'error get task by id',
      message: err,
    });
    span2.finish();
    span3.finish();
    parentSpan.finish();
    return;
  }

  parentSpan.finish();
}

export async function cancelSvc(req: IncomingMessage, res: ServerResponse, { tracer, logger }: AppContext) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'] as string;
  const parentSpan = tracer.startSpan('task_cancel');
  const span = tracer.startSpan('check_id', {
    childOf: parentSpan,
  });

  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    logger.error('parameter id tidak ditemukan');
    span.setTag('error', true);
    span.log({
      event: 'error get id paramater',
      message: 'parameter id tidak ditemukan',
    });
    span.finish();
    parentSpan.finish();
    return;
  }
  span.finish();

  const span2 = tracer.startSpan('get_task_from_db_by_id', {
    childOf: parentSpan,
  });
  try {
    const task = await cancel(parseInt(id, 10));
    span2.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(task));
    res.end();
    span3.finish();
  } catch (err) {
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      logger.error(err);
      span2.setTag('error', true);
      span2.log({
        event: 'error get task by id',
        message: err,
      });
      span2.finish();
      span3.finish();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    logger.error(err);
    span2.setTag('error', true);
    span2.log({
      event: 'error get task by id',
      message: err,
    });
    span2.finish();
    span3.finish();
    parentSpan.finish();
    return;
  }

  parentSpan.finish();
}

export async function getAttachmentSvc(req: IncomingMessage, res: ServerResponse, { tracer, logger }: AppContext) {
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/attachment/', '');
  const parentSpan = tracer.startSpan('task_get_attachment');
  const span = tracer.startSpan('check_objectName', {
    childOf: parentSpan,
  });

  if (!objectName) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    logger.error('request tidak sesuai');
    span.setTag('error', true);
    span.log({
      event: 'error get attachment',
      message: 'request tidak sesuai',
    });
    span.finish();
    parentSpan.finish();
    return;
  }
  span.finish();

  const span2 = tracer.startSpan('get_attachment', {
    childOf: parentSpan,
  });
  try {
    const objectRead = await readFile(objectName);
    span2.finish();
    res.setHeader('Content-Type', mime.lookup(objectName) as string);
    res.statusCode = 200;
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    objectRead.pipe(res);
    span2.finish();
    span3.finish();
    parentSpan.finish();
  } catch (err) {
    const span3 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      logger.error(err);
      span2.setTag('error', true);
      span2.log({
        event: 'error get attachment',
        message: err,
      });
      span2.finish();
      span3.finish();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    logger.error(err);
    span2.setTag('error', true);
    span2.log({
      event: 'error get attachment',
      message: err,
    });
    span2.finish();
    span3.finish();
    parentSpan.finish();
    return;
  }
}
