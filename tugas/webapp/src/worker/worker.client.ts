import { httpClient as client } from '../lib/http-client';
import { SERVICE_BASEURL } from './config';
import { Worker } from './reducer'

export function register(data: any):Promise<Worker> {
  return client.post(`${SERVICE_BASEURL}/register`, data);
}

export function list():Promise<Worker[]> {
  return client.get(`${SERVICE_BASEURL}/list`);
}

export function remove(id: number):Promise<Worker> {
  return client.del(`${SERVICE_BASEURL}/remove?id=${id}`);
}

export function info(id: number):Promise<Worker> {
  return client.get(`${SERVICE_BASEURL}/info?id=${id}`);
}
