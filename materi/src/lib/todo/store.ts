import { createAction, createReducer, configureStore } from '@reduxjs/toolkit';
import { initialState, add, done, undone, loadTasks } from './reducer';
import { loggingMiddleware, delayActionMiddleware } from './middleware';
import thunkMiddleware from 'redux-thunk';
import { Task } from './reducer';

enum ActionType {
  ADD = 'add',
  DONE = 'done',
  UNDONE = 'undone',
  LOAD_TASKS = 'loadTasks',
}

/**
 * add action
 */
export const addAction = createAction<Task>(ActionType.ADD);

/**
 * done action
 */
export const doneAction = createAction<number>(ActionType.DONE);
export const undoneAction = createAction<number>(ActionType.UNDONE);
export const loadTasksAction = createAction<Task[]>(ActionType.LOAD_TASKS);

const todoReducer = createReducer(initialState, {
  [ActionType.ADD]: add,
  [ActionType.DONE]: done,
  [ActionType.UNDONE]: undone,
  [ActionType.LOAD_TASKS]: loadTasks,
});

export const store$ = configureStore({
  reducer: todoReducer,
  middleware: [thunkMiddleware, loggingMiddleware, delayActionMiddleware],
});
