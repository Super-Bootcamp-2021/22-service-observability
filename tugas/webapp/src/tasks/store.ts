import {
  createAction,
  createReducer,
  configureStore,
} from '@reduxjs/toolkit';
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
import { Task } from './reducer' 
import thunkMiddleware from 'redux-thunk';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  ADD = 'added',
  CANCEL = 'canceled',
  DONE = 'done',
  TASKLOADED = 'taskLoaded',
  WORKERLOADED = 'workersLoaded',
  CLEARERROR = 'clearError'
}

export const errorAction = createAction<any>(ActionType.ERROR);
export const loadingAction = createAction(ActionType.LOADING);
export const addedAction = createAction<Task>(ActionType.ADD);
export const doneAction = createAction<number>(ActionType.DONE);
export const canceledAction = createAction<number>(ActionType.CANCEL);
export const tasksLoadedAction = createAction<any>(ActionType.TASKLOADED);
export const workersLoadedAction = createAction<any>(ActionType.WORKERLOADED);
export const clearErrorAction = createAction(ActionType.CLEARERROR);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.CLEARERROR]: clearError,
  [ActionType.LOADING]: loading,
  [ActionType.DONE]: done,
  [ActionType.ADD]: added,
  [ActionType.CANCEL]: canceled,
  [ActionType.WORKERLOADED]: workersLoaded,
  [ActionType.TASKLOADED]: tasksLoaded,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});