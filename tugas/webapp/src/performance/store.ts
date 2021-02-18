import {
  createAction,
  createReducer,
  configureStore,
} from '@reduxjs/toolkit';
import { initialState, error, loading, summaryLoaded } from './reducer';
import thunkMiddleware from 'redux-thunk';
import { performanceResult } from './performance.client';

export enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  SUUMMARY_LOAD = 'summaryLoaded',
}

export const errorAction = createAction<any>(ActionType.ERROR);
export const loadingAction = createAction(ActionType.LOADING);
export const summaryLoadedAction = createAction<performanceResult>(ActionType.SUUMMARY_LOAD);

export const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.LOADING]: loading,
  [ActionType.SUUMMARY_LOAD]: summaryLoaded,
});

export const store$ = configureStore({
  reducer :reducer,
  middleware: [thunkMiddleware],
});
