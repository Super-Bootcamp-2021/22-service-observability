import { httpClient as client } from '../lib/http-client';

import { SERVICE_BASEURL } from './config';

export function register(data): Promise<any> {
  return client.post(`${SERVICE_BASEURL}/register`, data);
}

export function list(): Promise<any
> {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function remove(id): Promise<any> {
  return client.del(`${SERVICE_BASEURL}/remove?id=${id}`);
}

export function info(id): Promise<any> {
  return client.get(`${SERVICE_BASEURL}/info?id=${id}`);
}
