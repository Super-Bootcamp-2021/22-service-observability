import * as redis from 'redis';
import { promisify } from 'util';

let client: redis.RedisClient;

export function connect(options?: redis.ClientOpts) {
  return new Promise< Error|void >((resolve, reject) => {
    client = redis.createClient(options);
    client.on('connect', () => {
      resolve();
    });
    client.on('error', (err) => {
      reject(err);
    });
  });
}

export function save(db: string, data: any): Promise<void> {
  const setAsync = promisify(client.set).bind(client);
  return setAsync(db, data);
}

export async function read(db: string = '0'): Promise<string> {
  const getAsync = promisify(client.get).bind(client);
  const val = await getAsync(db);
  return JSON.parse(val);
}

export function drop(db: string) {
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

