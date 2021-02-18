import { client } from '../lib/http-client';

import { TASK_SERVICE_BASEURL } from '../config';

export function add(data) {
  return client.post(`${TASK_SERVICE_BASEURL}/add`, data);
}

export function list() {
  return client.get(`${TASK_SERVICE_BASEURL}/list`);
}

export function cancel(id: number) {
  return client.put(`${TASK_SERVICE_BASEURL}/cancel?id=${id}`);
}

export function done(id: number) {
  return client.put(`${TASK_SERVICE_BASEURL}/done?id=${id}`);
}
