/** @module todo */

import { getConnection } from 'typeorm';
import { Todo, ITodo } from './todo.model';

export const ERROR_ADD_DATA_INVALID = 'data pekerjaan tidak valid';
export const ERROR_ID_INVALID = 'task id tidak valid';
export const ERROR_TODO_NOT_FOUND = 'pekerja tidak ditemukan';

/**
 * add new todo
 * @param data todo detail
 * @returns new todo detail with id
 * @throws {@link ERROR_ADD_DATA_INVALID} when data not contain task property
 */
export async function add(data: ITodo): Promise<ITodo> {
  if (!data.task) {
    throw ERROR_ADD_DATA_INVALID;
  }
  const todoRepo = getConnection().getRepository<Todo>('Todo');
  const todo = new Todo(null, data.task, data.done);
  await todoRepo.save(todo);
  return todo;
}

/**
 * remove a todo by an id
 * @param id todo id
 * @returns removed todo
 * @throws {@link ERROR_TODO_NOT_FOUND} when todo not found in database
 */
export async function remove(id: number): Promise<Todo> {
  const todoRepo = getConnection().getRepository<Todo>('Todo');
  const todo = await todoRepo.findOne(id);
  if (!todo) {
    throw ERROR_TODO_NOT_FOUND;
  }
  await todoRepo.delete(id);
  return todo;
}

/**
 * set todo task to done
 * @param id todo task id
 * @returns set todo task to done with id
 * @throws {@link ERROR_ID_INVALID}  when id are invalid
 * @throws {@link ERROR_TODO_NOT_FOUND}  when todo not found in database
 */
export async function done(id: number): Promise<Todo> {
  if (!id) {
    throw ERROR_ID_INVALID;
  }
  const todoRepo = getConnection().getRepository<Todo>('Todo');
  const todo = await todoRepo.findOne(id);
  if (!todo) {
    throw ERROR_TODO_NOT_FOUND;
  }
  todo.done = true;
  await todoRepo.save(todo);
  return todo;
}

/**
 * set todo task to undone
 * @param id todo task id
 * @returns set todo task to undone with id
 * @throws {string} when id are invalid
 * @throws {string} when todo not found in database
 */
export async function undone(id: number): Promise<Todo> {
  if (!id) {
    throw ERROR_ID_INVALID;
  }
  const todoRepo = getConnection().getRepository<Todo>('Todo');
  const todo = await todoRepo.findOne(id);
  if (!todo) {
    throw ERROR_TODO_NOT_FOUND;
  }
  todo.done = false;
  await todoRepo.save(todo);
  return todo;
}

/**
 * get list of todo
 * @returns list of task to do
 */
export async function list(): Promise<Todo[]> {
  const todoRepo = getConnection().getRepository<Todo>('Todo');
  return todoRepo.find();
}
