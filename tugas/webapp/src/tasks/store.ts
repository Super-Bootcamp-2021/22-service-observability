import { createAction, createReducer, configureStore } from '@reduxjs/toolkit';
import {
  initialState,
  error,
  loading,
  added,
  canceled,
  done,
  tasksLoaded,
  workersLoaded,
  clearError,
} from './reducer';
import thunkMiddleware from 'redux-thunk';
import {
  TaskInterface,
  WorkerInterface,
} from '../../../service/src/tasks/task.model';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  ADDED = 'added',
  DONE = 'done',
  CANCELED = 'canceled',
  TASKS_LOADED = 'tasksLoaded',
  WORKERS_LOADED = 'workersLoaded',
  CLEAR_ERROR = 'clearError',
}

export const errorAction = createAction<any>(ActionType.ERROR);
export const loadingAction = createAction<void>(ActionType.LOADING);
export const addedAction = createAction<TaskInterface>(ActionType.ADDED);
export const doneAction = createAction<number>(ActionType.DONE);
export const canceledAction = createAction<number>(ActionType.CANCELED);
export const tasksLoadedAction = createAction<TaskInterface[]>(
  ActionType.TASKS_LOADED
);
export const workersLoadedAction = createAction<WorkerInterface>(
  ActionType.WORKERS_LOADED
);
export const clearErrorAction = createAction<void>(ActionType.CLEAR_ERROR);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.CLEAR_ERROR]: clearError,
  [ActionType.LOADING]: loading,
  [ActionType.DONE]: done,
  [ActionType.ADDED]: added,
  [ActionType.CANCELED]: canceled,
  [ActionType.WORKERS_LOADED]: workersLoaded,
  [ActionType.TASKS_LOADED]: tasksLoaded,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});
