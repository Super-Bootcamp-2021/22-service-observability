import { client } from '../lib/http-client';

import { SERVICE_BASEURL } from './config';

export function register(data) {
  return client.post(`${SERVICE_BASEURL}/register`, data);
}

export function list() {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function remove(id:number) {
  return client.del(`${SERVICE_BASEURL}/remove?id=${id}`);
}

export function info(id:number) {
  return client.get(`${SERVICE_BASEURL}/info?id=${id}`);
}