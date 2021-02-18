/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as Busboy from 'busboy';
import * as url from 'url';
import * as mime from 'mime-types';
import { Writable } from 'stream';
import { Worker } from './worker.model';
import {
  register,
  list,
  remove,
  info,
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
} from './worker';
import { saveFile, readFile, ERROR_FILE_NOT_FOUND } from '../lib/storage';
import { IncomingMessage, ServerResponse } from 'http';
import { AppContext } from '../lib/context';

export function registerSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
) {
  const busboy = new Busboy({ headers: req.headers });

  const data: Worker = {
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

  busboy.on(
    'file',
    async (
      fieldname: any,
      file: { pipe: (arg0: Writable) => void },
      filename: any,
      encoding: any,
      mimetype: string
    ) => {
      const parentSpan = tracer.startSpan('worker_register');
      const span = tracer.startSpan('save_photo', {
        childOf: parentSpan,
      });
      switch (fieldname) {
        case 'photo':
          try {
            data.photo = await saveFile(file, mimetype);
          } catch (err) {
            logger.error('photo not found');
            span.setTag('error', true);
            span.log({
              event: 'error save photo',
              message: 'file photo tidak ada',
            });
            abort();
          }
          if (!req.aborted && finished) {
            span.finish();
            const span2 = tracer.startSpan('write_worker_on_db', {
              childOf: parentSpan,
            });
            try {
              const worker = await register(data);
              span2.finish();
              res.setHeader('content-type', 'application/json');
              const span3 = tracer.startSpan('encode_result', {
                childOf: parentSpan,
              });
              res.write(JSON.stringify(worker));
              span3.finish();
            } catch (err) {
              if (err === ERROR_REGISTER_DATA_INVALID) {
                span.setTag('error', true);
                span.log({
                  event: 'error write to database',
                  message: err.message,
                });
                res.statusCode = 401;
              } else {
                span.setTag('error', true);
                span.log({
                  event: 'server cannot found',
                  message: err.message,
                });
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
      parentSpan.finish();
    }
  );

  busboy.on('field', (fieldname: string, val: any) => {
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

export async function listSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const parentSpan = tracer.startSpan('worker_list');
  const span = tracer.startSpan('show_worker_list', {
    childOf: parentSpan,
  });
  try {
    const workers = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    res.end();
    span.finish();
  } catch (err) {
    span.setTag('error', true);
    span.log({
      event: 'error show worker list',
      message: 'server cannot found',
    });
    res.statusCode = 500;
    res.end();
    return;
  }
  parentSpan.finish();
}

export async function infoSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const parentSpan = tracer.startSpan('worker_info');
  const span = tracer.startSpan('get_worker_info', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url!, true); // tanda ! diakhir variabel tanpa bahwa variabel tersebut pasti ada isinya
  const id = uri.query['id'];
  if (!id) {
    logger.error('id not found');
    span.setTag('error', true);
    span.log({
      event: 'error show worker info',
      message: 'id worker tidak ditemukan',
    });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const worker = await info(id);
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(worker));
    res.end();
    span.finish();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      span.setTag('error', true);
      span.log({
        event: 'error show worker list',
        message: 'response code not found',
      });
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span.setTag('error', true);
    span.log({
      event: 'error show worker list',
      message: 'server cannot found',
    });
    res.statusCode = 500;
    res.end();
    return;
  }
  parentSpan.finish();
}

export async function removeSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const parentSpan = tracer.startSpan('remove_worker');
  const span = tracer.startSpan('remove_worker_info', {
    childOf: parentSpan,
  });
  const uri = url.parse(req.url!, true); // tanda ! diakhir variabel tanpa bahwa variabel tersebut pasti ada isinya
  const id = uri.query['id'];
  if (!id) {
    logger.error('id not found');
    span.setTag('error', true);
    span.log({
      event: 'error remove worker',
      message: 'id worker tidak ditemukan',
    });
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const worker = await remove(id);
    span.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      span.setTag('error', true);
      span.log({
        event: 'error show worker list',
        message: 'response code not found',
      });
      res.write(err);
      res.end();
      return;
    }
    span.setTag('error', true);
    span.log({
      event: 'error show worker list',
      message: 'server cannot found',
    });
    res.statusCode = 500;
    res.end();
    return;
  }
  parentSpan.finish();
}

export async function getPhotoSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const parentSpan = tracer.startSpan('get_photo');
  const span = tracer.startSpan('get_worker_photo', {
    childOf: parentSpan,
  });
  const uri: url.UrlWithParsedQuery = url.parse(req.url!, true);
  const objectName = uri.pathname!.replace('/photo/', '');
  if (!objectName) {
    logger.error('photo not found');
    span.setTag('error', true);
    span.log({
      event: 'error parsing photo',
      message: 'photo tidak dapat ditemukan',
    });
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  try {
    const objectRead = await readFile(objectName);
    span.finish();
    const mimeContent = mime.lookup(objectName);
    if (typeof mimeContent === 'string') {
      res.setHeader('Content-Type', mimeContent);
      res.statusCode = 200;
      objectRead.pipe(res);
    }
  } catch (err) {
    if (err === ERROR_FILE_NOT_FOUND) {
      span.setTag('error', true);
      span.log({
        event: 'error show worker list',
        message: 'response code not found',
      });
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    span.setTag('error', true);
    span.log({
      event: 'error show worker list',
      message: 'server cannot found',
    });
    res.statusCode = 500;
    res.write('gagal membaca file');
    res.end();
    return;
  }
}
