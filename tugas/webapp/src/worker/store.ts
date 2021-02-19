import {
  createAction,
  createReducer,
  configureStore,
} from '@reduxjs/toolkit';
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
  REGISTERED = 'registered',
  REMOVED = 'removed',
  WORKERS_LOADED = 'workersLoaded',
  CLEAR_ERROR = 'clearError',
}

export const errorAction = createAction<string>(ActionType.ERROR);
export const loadingAction = createAction(ActionType.LOADING);
export const registeredAction = createAction<Worker>(ActionType.REGISTERED);
export const removedAction = createAction<number>(ActionType.REMOVED);
export const workersLoadedAction = createAction<Worker[]>(ActionType.WORKERS_LOADED);
export const clearErrorAction = createAction(ActionType.CLEAR_ERROR);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.LOADING]: loading,
  [ActionType.REGISTERED]: registered,
  [ActionType.REMOVED]: removed,
  [ActionType.WORKERS_LOADED]: workersLoaded,
  [ActionType.CLEAR_ERROR]: clearError,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});
