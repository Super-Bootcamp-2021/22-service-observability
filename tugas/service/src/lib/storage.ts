/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as mime from 'mime-types';
import { Client } from 'minio';

export const ERROR_REQUIRE_OBJECT_NAME = 'error wajib memasukan nama objek';
export const ERROR_FILE_NOT_FOUND = 'error file tidak ditemukan';

let client: any;
let bucketname: string;

export async function connect(_bucketname: string, options: any) {
  client = new Client({
    ...options,
    useSSL: false,
  });
  bucketname = _bucketname || 'photo';
  try {
    await client.makeBucket(bucketname);
  } catch (err) {
    if (err?.code === 'BucketAlreadyOwnedByYou') {
      return;
    }
    throw err;
  }
}

function randomFileName(mimetype: string) {
  return (
    new Date().getTime() +
    '-' +
    Math.round(Math.random() * 1000) +
    '.' +
    mime.extension(mimetype)
  );
}

export function saveFile(file: any, mimetype: string): Promise<string> {
  const objectName = randomFileName(mimetype);
  return new Promise((resolve, reject) => {
    client.putObject(bucketname, objectName, file, (err: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(objectName);
    });
  });
}

export async function readFile(objectName: string) {
  if (!objectName) {
    throw ERROR_REQUIRE_OBJECT_NAME;
  }
  try {
    await client.statObject(bucketname, objectName);
  } catch (err) {
    if (err?.code === 'NotFound') {
      throw ERROR_FILE_NOT_FOUND;
    }
    throw err;
  }
  return client.getObject(bucketname, objectName);
}
