import { httpClient as client } from '../lib/http-client';

import { WORKER_SERVICE_BASEURL } from './config';

export function list(): Promise<any> {
  return client.get(`${WORKER_SERVICE_BASEURL}/list`);
}
