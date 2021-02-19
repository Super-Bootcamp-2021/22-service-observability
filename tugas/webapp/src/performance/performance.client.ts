import { httpClient as client } from '../lib/http-client';
import { SERVICE_BASEURL } from  './config';
import { Summary } from './reducer';

export function summary(): Promise<Summary> {
  return client.get(`${SERVICE_BASEURL}/summary`);
}

