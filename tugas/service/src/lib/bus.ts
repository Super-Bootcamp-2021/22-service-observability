/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as nats from 'nats';

let client: nats.Client;

export function connect(url?: string, config?: nats.ClientOpts) {
  return new Promise<Error | void>((resolve, reject) => {
    client = nats.connect(url, config);
    client.on('connect', () => {
      resolve();
    });
    client.on('error', (err: Error) => {
      reject(err);
    });
  });
}

export function publish(subject: string, data: unknown): void {
  client.publish(subject, JSON.stringify(data));
}

export function subscribe(subject: string, callback: Function) {
  return client.subscribe(subject, callback);
}

export function unsubscribe(sid: number): void {
  return client.unsubscribe(sid);
}

export function close(): void {
  if (!client) {
    return;
  }
  client.close();
}
