/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { client } from '../lib/http-client';

import { SERVICE_BASEURL } from './config';
import {
  TaskInterface,
  WorkerInterface,
} from '../../../service/src/tasks/task.model';

export function add(data: any): Promise<TaskInterface> {
  return client.post(`${SERVICE_BASEURL}/add`, data);
}

export function list(): Promise<TaskInterface[]> {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function cancel(id: number) {
  return client.put(`${SERVICE_BASEURL}/cancel?id=${id}`);
}

export function done(id: number) {
  return client.put(`${SERVICE_BASEURL}/done?id=${id}`);
}
