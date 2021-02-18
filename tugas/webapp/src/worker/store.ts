import { createAction, createReducer, configureStore } from '@reduxjs/toolkit';
import {
  initialState,
  error,
  loading,
  registered,
  removed,
  workersLoaded,
  clearError,
  Worker,
} from './reducer';
import thunkMiddleware from 'redux-thunk';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  LOADED = 'workersLoaded',
  REGISTERED = 'registered',
  REMOVED = 'removed',
  CLEAR_ERROR = 'clearError',
}

export const errorAction = createAction<string>(ActionType.ERROR);
export const loadingAction = createAction<void>(ActionType.LOADING);
export const registeredAction = createAction<Worker>(ActionType.REGISTERED);
export const removedAction = createAction<number>(ActionType.REMOVED);
export const workersLoadedAction = createAction<Worker[]>(ActionType.LOADED);
export const clearErrorAction = createAction<void>(ActionType.CLEAR_ERROR);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.CLEAR_ERROR]: clearError,
  [ActionType.LOADING]: loading,
  [ActionType.REGISTERED]: registered,
  [ActionType.REMOVED]: removed,
  [ActionType.LOADED]: workersLoaded,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});
