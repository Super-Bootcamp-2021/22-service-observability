/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Busboy from 'busboy';
import * as url from 'url';
import * as mime from 'mime-types';
import { IncomingMessage, ServerResponse } from 'http';
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
import { JaegerTracer } from 'jaeger-client';

export function addSvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
) {
  const busboy = new Busboy({ headers: req.headers });
  const parentSpan = tracer.startSpan('Add Task');
  const span = tracer.startSpan('Parsing Body', {
    childOf: parentSpan,
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
      span.setTag('error', true);
      span.log({
        event: 'error parsing body',
        message: 'data tidak tersedia',
      });
      res.statusCode = 500;
      res.write('internal server error');
      res.end();
      span.finish();
      parentSpan.finish();
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
          const span2 = tracer.startSpan('Write to DB', {
            childOf: parentSpan,
          });
          try {
            const task = await add(data);
            span2.finish();
            res.setHeader('content-type', 'application/json');
            const span3 = tracer.startSpan('Encode Result', {
              childOf: parentSpan,
            });
            res.write(JSON.stringify(task));
            span3.finish();
          } catch (err) {
            span2.setTag('error', true);
            span2.log({
              event: 'error write to DB',
              message: err,
            });
            span2.finish();
            if (err === ERROR_TASK_DATA_INVALID) {
              res.statusCode = 401;
            } else {
              res.statusCode = 500;
            }
            const span3 = tracer.startSpan('Encode Result', {
              childOf: parentSpan,
            });
            res.write(err);
            span3.finish();
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

export async function listSvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
): Promise<any> {
  const parentSpan = tracer.startSpan('Task List');
  const span = tracer.startSpan('Read from DB', {
    childOf: parentSpan,
  });
  try {
    const tasks = await list();
    span.finish();
    res.setHeader('content-type', 'application/json');
    const span2 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(tasks));
    span2.finish();
    res.end();
    parentSpan.finish();
  } catch (err) {
    span.setTag('error', true);
    span.log({
      event: 'error read from DB',
      message: 'gagal membaca data',
    });
    span.finish();
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
}

export async function doneSvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
): Promise<any> {
  const parentSpan = tracer.startSpan('Done Task');
  const span = tracer.startSpan('Parse Query', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    span.setTag('error', true);
    span.log({
      event: 'error parsing query',
      message: 'parameter id tidak ditemukan',
    });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span.finish();
    parentSpan.finish();
    return;
  }
  span.finish();

  const span2 = tracer.startSpan('Update DB', {
    childOf: parentSpan,
  });
  try {
    const task = await done(id);
    span2.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    const span3 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(task));
    span3.finish();
    res.end();
  } catch (err) {
    span2.setTag('error', true);
    span2.log({
      event: 'error update DB',
      message: err,
    });
    span2.finish();
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      const span3 = tracer.startSpan('Encode Result', {
        childOf: parentSpan,
      });
      res.write(err);
      span3.finish();
      res.end();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
  parentSpan.finish();
}

export async function cancelSvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
): Promise<any> {
  const parentSpan = tracer.startSpan('Cancel Task');
  const span = tracer.startSpan('Parse Query', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    span.setTag('error', true);
    span.log({
      event: 'error parsing query',
      message: 'parameter id tidak ditemukan',
    });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    span.finish();
    parentSpan.finish();
    return;
  }
  span.finish();
  const span2 = tracer.startSpan('Update DB', {
    childOf: parentSpan,
  });
  try {
    const task = await cancel(id);
    span2.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    const span3 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(task));
    span3.finish();
    res.end();
  } catch (err) {
    span2.setTag('error', true);
    span2.log({
      event: 'error update DB',
      message: err,
    });
    span2.finish();
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      const span3 = tracer.startSpan('Encode Result', {
        childOf: parentSpan,
      });
      res.write(err);
      span3.finish();
      res.end();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
  parentSpan.finish();
}

export async function getAttachmentSvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
): Promise<any> {
  const parentSpan = tracer.startSpan('Task Attachment');
  const span = tracer.startSpan('Parse URL', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/attachment/', '');
  if (!objectName) {
    span.setTag('error', true);
    span.log({
      event: 'error parsing url',
      message: 'nama file tidak ditemukan',
    });
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    span.finish();
    parentSpan.finish();
  }
  span.finish();

  const span2 = tracer.startSpan('Read from Object Storage', {
    childOf: parentSpan,
  });
  try {
    const objectRead = await readFile(objectName);
    span2.finish();
    res.setHeader('Content-Type', mime.lookup(objectName));
    res.statusCode = 200;
    const span3 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    objectRead.pipe(res);
    span3.finish();
  } catch (err) {
    span2.setTag('error', true);
    span2.log({
      event: 'error read from Object Storage',
      message: err,
    });
    span2.finish();
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      const span3 = tracer.startSpan('Encode Result', {
        childOf: parentSpan,
      });
      res.write(err);
      span3.finish();
      res.end();
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    const span3 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    res.write('gagal membaca file');
    span3.finish();
    res.end();
    parentSpan.finish();
    return;
  }
  parentSpan.finish();
}
