import { getConnection } from 'typeorm';
import * as workerClient from './worker.client';
import * as bus from '../lib/bus';

export const ERROR_TASK_DATA_INVALID = 'data pekerjaan baru tidak lengkap';
export const ERROR_TASK_NOT_FOUND = 'pekerjaan tidak ditemukan';
export const ERROR_TASK_ALREADY_DONE = 'pekerjaan sudah selesai';

interface TaskNew {
  id?: number;
  job?: string;
  done?: boolean;
  cancelled?: boolean;
  addedAt?: string;
  attachment?: string;
  assignee?: Worker;
}

interface Task {
  id?: number;
  job?: string;
  done?: boolean;
  cancelled?: boolean;
  addedAt?: string;
  attachment?: string;
  assignee?: Worker;
}

interface TaskInput {
  job?: string;
  attachment?: string;
  assigneeId?: number;
}

interface Worker {
  id?: number;
  name?: string;
}

export async function add(data: TaskInput): Promise<Task> {
  if (!data.job || !data.assigneeId) {
    throw ERROR_TASK_DATA_INVALID;
  }
  await workerClient.info(data.assigneeId);
  const taskRepo = getConnection().getRepository('Task');
  const newTask: TaskNew = await taskRepo.save({
    job: data.job,
    assignee: { id: data.assigneeId },
    attachment: data.attachment,
  });
  const task: Task = await taskRepo.findOne(newTask.id, { relations: ['assignee'] });
  if (!task) {
    throw ERROR_TASK_NOT_FOUND;
  }
  bus.publish('task.added', task);
  return task;
}

export async function done(id: number) {
  const taskRepo = getConnection().getRepository('Task');
  const task: Task = await taskRepo.findOne(id, { relations: ['assignee'] });
  if (!task || task?.cancelled) {
    throw ERROR_TASK_NOT_FOUND;
  }
  if (task.done) {
    throw ERROR_TASK_ALREADY_DONE;
  }
  task.done = true;
  await taskRepo.save(task);
  bus.publish('task.done', task);
  return task;
}

export async function cancel(id: number) {
  const taskRepo = getConnection().getRepository('Task');
  const task: Task = await taskRepo.findOne(id, { relations: ['assignee'] });
  if (!task || task?.cancelled) {
    throw ERROR_TASK_NOT_FOUND;
  }
  task.cancelled = true;
  await taskRepo.save(task);
  bus.publish('task.cancelled', task);
  return task;
}

export function list() {
  const taskRepo = getConnection().getRepository('Task');
  return taskRepo.find({ relations: ['assignee'] });
}
