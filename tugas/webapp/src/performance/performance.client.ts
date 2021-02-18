import { client } from '../lib/http-client';
import { SERVICE_BASEURL } from './config';

export interface performanceResult {
  total_task: number;
  task_done: number;
  task_cancelled: number;
  total_worker:number;
}

export function summary(): Promise<performanceResult>{
  return client.get(`${SERVICE_BASEURL}/summary`);
}
