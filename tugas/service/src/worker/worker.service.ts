import * as Busboy from 'busboy';
import * as url from 'url';
import * as mime from 'mime-types';
import { Writable } from 'stream';
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
): void {
  const busboy = new Busboy({ headers: req.headers });
  const parentSpan = tracer.startSpan('register worker');

  const data: any = {
    name: '',
    age: 0,
    bio: '',
    address: '',
    photo: '',
  };

  let finished: boolean = false;

  function abort(): void {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
      parentSpan.finish()
    }
  }

  busboy.on(
    'file',
    async (
      fieldname: string,
      file: any,
      filename: any,
      encoding: any,
      mimetype: any
    ) => {
      switch (fieldname) {
        case 'photo':
          const spanSavePhoto = tracer.startSpan('save photo', {
            childOf: parentSpan,
          });
          try {
            data.photo = await saveFile(file, mimetype);
            spanSavePhoto.finish()
          } catch (err) {
            logger.error('error save photo')
            spanSavePhoto.setTag('error', true)
            spanSavePhoto.log({
              event: 'failed to save photo'
            })
            spanSavePhoto.finish()
            abort();
          }
          if (!req.aborted && finished) {
            const spanRegisterWorker = tracer.startSpan('register worker to db', {childOf: parentSpan});
            try {
              const worker = await register(data);
              spanRegisterWorker.finish()
              res.setHeader('content-type', 'application/json');
              res.write(JSON.stringify(worker));
            } catch (err) {
              logger.error(err || err?.message);
              if (err === ERROR_REGISTER_DATA_INVALID) {
                res.statusCode = 401;
              } else {
                res.statusCode = 500;
              }
              spanRegisterWorker.setTag('error', true);
              spanRegisterWorker.log({
                event: 'failed to register',
                message: err?.message || err
              })
              res.write(err);
              spanRegisterWorker.finish()
            }
            res.end();
            parentSpan.finish()
          }
          break;
        default: {
          const noop: any = new Writable({
            write(chunk, encding, callback): void {
              setImmediate(callback);
            },
          });
          file.pipe(noop);
        }
      }
    }
  );

  busboy.on('field', (fieldname: string, val: string) => {
    if (['name', 'age', 'bio', 'address'].includes(fieldname)) {
      data[fieldname] = val;
    }
  });

  busboy.on('finish', (): void => {
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
  const parentSpan = tracer.startSpan('list_worker');
  const spanGetWorkers = tracer.startSpan('get worker list from db', {
    childOf: parentSpan,
  });

  try {
    const workers: any[] = await list();
    spanGetWorkers.finish();
    res.setHeader('content-type', 'application/json');
    const spanEncode = tracer.startSpan('endoce_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(workers));
    spanEncode.finish();
    res.end();
  } catch (err) {
    logger.error('Internal Server Error');
    res.statusCode = 500;
    spanGetWorkers.setTag('error', true);
    spanGetWorkers.log({
      event: 'error get worker',
      statusCode: res.statusCode,
      message: err.message || err,
    });
    res.end();
    parentSpan.finish();
    spanGetWorkers.finish();
    return;
  }
  parentSpan.finish();
}

export async function infoSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('worker by id');

  if (!id) {
    logger.error('id worker not found');
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    const span = tracer.startSpan('id worker', {
      childOf: parentSpan,
    });
    span.setTag('error', true);
    span.log({
      event: 'error id worker',
      statusCode: res.statusCode,
      message: 'parameter id tidak ditemukan',
    });
    res.end();
    parentSpan.finish();
    span.finish();
    return;
  }

  const spanGetWorker = tracer.startSpan('get worker from db', {
    childOf: parentSpan,
  });

  try {
    const worker = await info(id);
    spanGetWorker.finish();
    res.setHeader('content-type', 'application/json');
    const spanEncode = tracer.startSpan('parsing data', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(worker));
    spanEncode.finish();
    res.end();
  } catch (err) {
    const span = tracer.startSpan('error worker', {
      childOf: parentSpan,
    });
    span.setTag('error', true);
    if (err === ERROR_WORKER_NOT_FOUND) {
      logger.error(err);

      span.log({
        event: 'error get worker not found',
        message: err,
      });
      parentSpan.finish();
      span.finish();

      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    logger.error(err?.message || err);
    span.log({
      event: 'Internal Server Error',
      message: err?.message || err,
    });
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
  parentSpan.finish();
}

export async function removeSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  const parentSpan = tracer.startSpan('remove worker');

  if (!id) {
    logger.error('Id Not Found');
    res.statusCode = 401;
    const span = tracer.startSpan('id worker', {
      childOf: parentSpan,
    });
    span.setTag('error', true);
    span.log({
      event: 'error id worker',
      statusCode: res.statusCode,
      message: 'parameter id tidak ditemukan',
    });
    res.write('parameter id tidak ditemukan');
    res.end();
    parentSpan.finish();
    span.finish();
    return;
  }

  const spanRemoveWorker = tracer.startSpan('remove worker from db', {
    childOf: parentSpan,
  });

  try {
    const worker = await remove(id);
    spanRemoveWorker.finish();
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
  } catch (err) {
    spanRemoveWorker.setTag('error', true);

    if (err === ERROR_WORKER_NOT_FOUND) {
      logger.error(err);
      res.statusCode = 404;
      res.write(err);
      spanRemoveWorker.log({
        event: 'worker not found',
        message: err?.message || err,
      });
      res.end();
      parentSpan.finish();
      spanRemoveWorker.finish();
      return;
    }
    logger.error(err?.message || err);
    res.statusCode = 500;
    spanRemoveWorker.log({
      event: 'Internal Server Error',
      message: err?.message || err,
    });
    res.end();
    parentSpan.finish();
    spanRemoveWorker.finish();
    return;
  }
  spanRemoveWorker.finish();
  parentSpan.finish();
}

export async function getPhotoSvc(
  req: IncomingMessage,
  res: ServerResponse,
  { tracer, logger }: AppContext
): Promise<void> {
  const uri = url.parse(req.url, true);
  const objectName = uri.pathname.replace('/photo/', '');
  const parentSpan = tracer.startSpan('get photo');
  if (!objectName) {
    logger.error('Wrong Request');
    const span = tracer.startSpan('wrong request');
    span.setTag('error', true);
    span.log({
      event: 'request tidak sesuai',
    });
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
    parentSpan.finish();
    span.finish();
    return;
  }

  const spanGetPhoto = tracer.startSpan('get worker from db', {
    childOf: parentSpan,
  });

  try {
    const objectRead = await readFile(objectName);
    spanGetPhoto.finish();
    res.setHeader('Content-Type', mime.lookup(objectName) as string);
    res.statusCode = 200;
    objectRead.pipe(res);
  } catch (err) {
    spanGetPhoto.setTag('error', true);

    if (err === ERROR_FILE_NOT_FOUND) {
      logger.error(ERROR_FILE_NOT_FOUND);
      res.statusCode = 404;
      res.write(err);
      spanGetPhoto.log({
        event: 'error photo not found',
        message: err,
      });
      res.end();
      parentSpan.finish();
      spanGetPhoto.finish();
      return;
    }
    logger.error('Failed to read file');
    res.statusCode = 500;
    res.write('gagal membaca file');
    spanGetPhoto.log({
      event: 'error read file',
      message: err?.message || err,
    });
    res.end();
    parentSpan.finish();
    spanGetPhoto.finish();
    return;
  }
  parentSpan.finish();
}
