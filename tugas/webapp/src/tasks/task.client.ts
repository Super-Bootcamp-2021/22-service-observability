import { httpClient as client } from '../lib/http-client';

import { SERVICE_BASEURL } from './config';

export function add(data): Promise<any> {
  return client.post(`${SERVICE_BASEURL}/add`, data);
}

export function list(): Promise<any> {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function cancel(id: number): Promise<any> {
  return client.put(`${SERVICE_BASEURL}/cancel?id=${id}`);
}

export function done(id: number): Promise<any> {
  return client.put(`${SERVICE_BASEURL}/done?id=${id}`);
}
