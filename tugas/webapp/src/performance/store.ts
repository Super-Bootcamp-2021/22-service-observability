import {
  createAction,
  createReducer,
  configureStore,
} from '@reduxjs/toolkit';
import  { initialState, error, loading, summaryLoaded, PerformanceSummary } from './reducer';
import thunkMiddleware from 'redux-thunk';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  LOADED = 'summaryLoaded',
}

export const errorAction = createAction<string>(ActionType.ERROR);
export const loadingAction = createAction<void>(ActionType.LOADING);
export const summaryLoadedAction = createAction<PerformanceSummary>(ActionType.LOADED);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.LOADING]: loading,
  [ActionType.LOADED]: summaryLoaded,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});


