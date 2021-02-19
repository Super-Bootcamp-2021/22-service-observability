import * as redis from 'redis';
import { promisify } from 'util';

let client:any;

export function connect(options?:any):Promise<void> {
  return new Promise((resolve, reject) => {
    client = redis.createClient(options);
    client.on('connect', () => {
      resolve();
    });
    client.on('error', (err:any) => {
      reject(err);
    });
  });
}

export function save(db:string, data:any) {
  const setAsync = promisify(client.set).bind(client);
  return setAsync(db, data);
}

export async function read(db:string) {
  const getAsync = promisify(client.get).bind(client);
  const val = await getAsync(db);
  return JSON.parse(val);
}

export function drop(db:string) {
  const delAsync = promisify(client.del).bind(client);
  return delAsync(db);
}

export function close() {
  if (!client) {
    return;
  }
  if (client.connected) {
    client.end(true);
  }
}
