import {
  createAction,
  createReducer,
  configureStore,
} from '@reduxjs/toolkit';

import { initialState, error, loading, summaryLoaded, Performance } from './reducer';

import thunkMiddleware from 'redux-thunk';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  LOADED = 'summaryLoaded',
}

export const errorAction = createAction<string>(ActionType.ERROR);
export const loadingAction = createAction(ActionType.LOADING);
export const summaryLoadedAction = createAction<Performance>(ActionType.LOADED);

const performReducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.LOADING]: loading,
  [ActionType.LOADED]: summaryLoaded,
});

export const store$ = configureStore({
  reducer: performReducer,
  middleware: [thunkMiddleware],
});
