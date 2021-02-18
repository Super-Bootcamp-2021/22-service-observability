import * as nats from 'nats';

let client:any;

export function connect(url?:string, config?:nats.ClientOpts):Promise<void> {
  return new Promise((resolve, reject) => {
    client = nats.connect(url, config);
    client.on('connect', () => {
      resolve();
    });
    client.on('error', (err:any) => {
      reject(err);
    });
  });
}

export function publish(subject:string, data:any) {
  client.publish(subject, JSON.stringify(data));
}

export function subscribe(subject:string, callback:Function) {
  return client.subscribe(subject, callback);
}

export function unsubscribe(sid:number) {
  return client.unsubscribe(sid);
}

export function close() {
  if (!client) {
    return;
  }
  client.close();
}
