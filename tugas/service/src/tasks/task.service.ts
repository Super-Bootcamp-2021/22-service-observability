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
  DataTask,
} from './task';
import { saveFile, readFile, ERROR_FILE_NOT_FOUND } from '../lib/storage';
import { IncomingMessage, ServerResponse } from 'http';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from '../lib/logger';
import { JaegerTracer } from 'jaeger-client';
import { createTracer } from '../lib/tracer';
import { AppContext } from '../lib/context';

export function addSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
) {
  const parentSpan = tracer.startSpan('post add task');
  const busboy = new Busboy({ headers: req.headers });

  let data: DataTask = {
    job: '',
    assigneeId: 0,
    attachment: '',
  };

  let finished = false;

  function abort() {
    const spanAbort = tracer.startSpan('abort', {
      childOf: parentSpan,
    });
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 500;
      res.write('internal server error');
      res.end();
      logger.error('request dibatalkan');
      spanAbort.setTag('error', true);
      spanAbort.log({
        event: 'abort request',
        message: 'request dibatalkan',
      });
      spanAbort.finish();
      parentSpan.finish();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    const spanFile = tracer.startSpan('file busboy', {
      childOf: parentSpan,
    });
    switch (fieldname) {
      case 'attachment':
        try {
          data.attachment = await saveFile(file, mimetype);
        } catch (err) {
          spanFile.setTag('error', true);
          spanFile.log({
            event: 'upload file attachment',
            message: 'error attachment file upload',
          });
          spanFile.finish();
          abort();
        }
        if (!req.aborted && finished) {
          const spanAddData = tracer.startSpan('add data', {
            childOf: parentSpan,
          });
          try {
            const task = await add(data);
            spanAddData.finish();
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(task));
            parentSpan.finish();
          } catch (err) {
            if (err === ERROR_TASK_DATA_INVALID) {
              spanAddData.setTag('error', true);
              spanAddData.log({
                event: 'add data',
                message: ERROR_TASK_DATA_INVALID,
              });
              logger.error(ERROR_TASK_DATA_INVALID);
              spanAddData.finish();
              res.statusCode = 401;
            } else {
              spanAddData.setTag('error', true);
              spanAddData.log({
                event: 'add data',
                message: 'unknown error add data',
              });
              logger.error('unknown add data error');
              spanAddData.finish();
              res.statusCode = 500;
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

export async function listSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
) {
  const parentSpan = tracer.startSpan('list task service');
  try {
    const tasks = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(tasks));
    res.end();
    parentSpan.finish();
  } catch (err) {
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'list task service',
      message: ' unknown error',
    });
    logger.error('unknown error');
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
}

export async function doneSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { logger, tracer }: AppContext
) {
  const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('done');
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'done',
      message: 'parameter id tidak ada',
    });
    logger.error('parameter id tidak ada');
    parentSpan.finish();
    return;
  }
  try {
    if (typeof id === 'string') {
      const spanDB = tracer.startSpan('memasukan data ke DB', {
        childOf: parentSpan,
      });
      const idnum = parseInt(id);
      const task = await done(idnum);
      spanDB.finish();
      res.setHeader('content-type', 'application/json');
      res.statusCode = 200;
      res.write(JSON.stringify(task));
      res.end();
      parentSpan.finish();
    }
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      parentSpan.setTag('error', true);
      parentSpan.log({
        event: 'done',
        message: ERROR_TASK_NOT_FOUND,
      });
      logger.error(ERROR_TASK_NOT_FOUND);
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'done',
      message: 'unknown server error',
    });
    logger.error('unknown server error');
    parentSpan.finish();
    return;
  }
}

export async function cancelSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { logger, tracer }: AppContext
) {
  const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('cancel');
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'cancel',
      message: 'parameter id tidak ditemukan',
    });
    logger.error('parameter id tidak ditemukan');
    parentSpan.finish();
    return;
  }
  try {
    if (typeof id === 'string') {
      const spanCancel = tracer.startSpan('change DB', {
        childOf: parentSpan,
      });
      const idnum = parseInt(id);
      const task = await cancel(idnum);
      spanCancel.finish();
      res.setHeader('content-type', 'application/json');
      res.statusCode = 200;
      res.write(JSON.stringify(task));
      res.end();
      parentSpan.finish();
    }
  } catch (err) {
    if (err === ERROR_TASK_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      parentSpan.setTag('error', true);
      parentSpan.log({
        event: 'cancel',
        message: ERROR_TASK_NOT_FOUND,
      });
      logger.error(ERROR_TASK_NOT_FOUND);
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'cancel',
      message: 'unknown server error',
    });
    logger.error('unknown server error');
    parentSpan.finish();
    return;
  }
}

export async function getAttachmentSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { logger, tracer }: AppContext
) {
  const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
  const objectName = uri.pathname!.replace('/attachment/', '');
  const parentSpan = tracer.startSpan('download attacment');
  if (!objectName) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'cek objekName',
      message: 'request tidak sesuai',
    });
    logger.error('request tidak sesuai');
    parentSpan.finish();
  }
  try {
    const spanRead = tracer.startSpan('baca file', {
      childOf: parentSpan,
    });
    const objectRead = await readFile(objectName);
    spanRead.finish();
    let mimeContent = mime.lookup(objectName);
    if (typeof mimeContent === 'string') {
      res.setHeader('Content-Type', mimeContent);
      res.statusCode = 200;
      objectRead.pipe(res);
      parentSpan.finish();
    }
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      parentSpan.setTag('error', true);
      parentSpan.log({
        event: 'baca file',
        message: ERROR_FILE_NOT_FOUND,
      });
      logger.error(ERROR_FILE_NOT_FOUND);
      parentSpan.finish();
      return;
    }
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    parentSpan.setTag('error', true);
    parentSpan.log({
      event: 'baca file',
      message: 'gagal membaca file',
    });
    logger.error('gagal membaca file');
    parentSpan.finish();
    return;
  }
}
