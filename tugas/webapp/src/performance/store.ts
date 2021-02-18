import { createAction, createReducer, configureStore } from '@reduxjs/toolkit';
import {
  initialState,
  error,
  loading,
  summaryLoaded,
  Summary,
} from './reducer';
import thunkMiddleware from 'redux-thunk';

enum ActionType {
  ERROR = 'error',
  LOADING = 'loading',
  SUMMARY_LOADED = 'summaryLoaded',
}

export const errorAction = createAction<string>(ActionType.ERROR);
export const loadingAction = createAction(ActionType.LOADING);
export const summaryLoadedAction = createAction<Summary>(
  ActionType.SUMMARY_LOADED
);

const reducer = createReducer(initialState, {
  [ActionType.ERROR]: error,
  [ActionType.LOADING]: loading,
  [ActionType.SUMMARY_LOADED]: summaryLoaded,
});

export const store$ = configureStore({
  reducer,
  middleware: [thunkMiddleware],
});
