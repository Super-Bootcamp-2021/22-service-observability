import { client } from '../lib/http-client';

import { WORKER_SERVICE_BASEURL } from '../config';

export const register = (data: any) => {
  return client.post(`${WORKER_SERVICE_BASEURL}/register`, data);
}

export const list = () => {
  return client.get(`${WORKER_SERVICE_BASEURL}/list`);
}

export const remove = (id: string | number) => {
  return client.del(`${WORKER_SERVICE_BASEURL}/remove?id=${id}`);
}

export const info = (id: string | number) => {
  return client.get(`${WORKER_SERVICE_BASEURL}/info?id=${id}`);
};
