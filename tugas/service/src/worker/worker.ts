import { getConnection } from 'typeorm';
import { Worker, WorkerInterface } from './worker.model';
import * as bus from '../lib/bus';

export const ERROR_REGISTER_DATA_INVALID = 'data registrasi pekerja tidak lengkap';
export const ERROR_WORKER_NOT_FOUND = 'pekerja tidak ditemukan';

export async function register(data: any) {
  if (!data.name || !data.age || !data.bio || !data.address || !data.photo) {
    throw ERROR_REGISTER_DATA_INVALID;
  }
  const workerRepo = getConnection().getRepository('Worker');
  const worker = new Worker(
    null,
    data.name,
    parseInt(data.age, 10),
    data.bio,
    data.address,
    data.photo
  );
  await workerRepo.save(worker);
  bus.publish('worker.registered', worker);
  return worker;
}

export function list() {
  const workerRepo = getConnection().getRepository('Worker');
  return workerRepo.find();
}

export async function info(id: string | string[]) {
  const workerRepo = getConnection().getRepository('Worker');
  const worker = await workerRepo.findOne(id);
  if (!worker) {
    throw ERROR_WORKER_NOT_FOUND;
  }
  return worker;
}

export async function remove(id: string | string[]) {
  const workerRepo = getConnection().getRepository('Worker');
  const worker = await workerRepo.findOne(id);
  if (!worker) {
    throw ERROR_WORKER_NOT_FOUND;
  }
  await workerRepo.delete(id);
  bus.publish('worker.removed', worker);
  return worker;
}

// module.exports = {
//   register,
//   list,
//   remove,
//   info,
//   ERROR_REGISTER_DATA_INVALID,
//   ERROR_WORKER_NOT_FOUND,
// };
