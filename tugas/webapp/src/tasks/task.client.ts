import { httpClient as client } from '../lib/http-client';
import { SERVICE_BASEURL } from './config'

export function add(data: any) {
  return client.post(`${SERVICE_BASEURL}/add`, data);
}

export function list() {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function cancel(id: any) {
  return client.put(`${SERVICE_BASEURL}/cancel?id=${id}`);
}

export function done(id: any) {
  return client.put(`${SERVICE_BASEURL}/done?id=${id}`);
}
