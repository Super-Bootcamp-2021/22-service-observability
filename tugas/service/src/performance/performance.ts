import { read, save } from '../lib/kv';

const TASK_TOTAL_KEY = 'task.total';
const TASK_DONE_KEY = 'task.done';
const TASK_CANCELLED_KEY = 'task.cancelled';
const WORKER_TOTAL_KEY = 'worker.total';

export interface performanceResult {
  total_task: number;
  task_done: number;
  task_cancelled: number;
  total_worker: number;
}

export async function summary(): Promise<performanceResult> {
  const data = {
    total_task: parseInt(await read(TASK_TOTAL_KEY), 10),
    task_done: parseInt(await read(TASK_DONE_KEY), 10),
    task_cancelled: parseInt(await read(TASK_CANCELLED_KEY), 10),
    total_worker: parseInt(await read(WORKER_TOTAL_KEY), 10),
  };
  return data;
}

export async function increaseTotalTask(): Promise<void> {
  const raw = await read(TASK_TOTAL_KEY);
  let val = parseInt(raw || '0', 10);
  val++;
  await save(TASK_TOTAL_KEY, val);
}

export async function increaseDoneTask(): Promise<void> {
  const raw = await read(TASK_DONE_KEY);
  let val = parseInt(raw || '0', 10);
  val++;
  await save(TASK_DONE_KEY, val);
}

export async function increaseCancelledTask(): Promise<void> {
  const raw = await read(TASK_CANCELLED_KEY);
  let val = parseInt(raw || '0', 10);
  val++;
  await save(TASK_CANCELLED_KEY, val);
}

export async function increaseTotalWorker(): Promise<void> {
  const raw = await read(WORKER_TOTAL_KEY);
  let val = parseInt(raw || '0', 10);
  val++;
  await save(WORKER_TOTAL_KEY, val);
}

export async function decreaseTotalWorker(): Promise<void> {
  const raw = await read(WORKER_TOTAL_KEY);
  let val = parseInt(raw || '0', 10);
  if (val > 0) {
    val--;
  }
  await save(WORKER_TOTAL_KEY, val);
}
