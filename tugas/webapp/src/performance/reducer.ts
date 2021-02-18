import { SERVICE_BASEURL } from './config';

export interface Summary {
  total_task: number;
  task_done: number;
  task_cancelled: number;
  total_worker: number;
}

interface ActionObject {
  type: string;
}

interface ActionObjectError extends ActionObject {
  payload: string;
}

interface ActionObjectSummary extends ActionObject {
  payload: Summary;
}

export const initialState = {
  loading: false,
  error: null,
  summary: {
    total_task: 0,
    task_done: 0,
    task_cancelled: 0,
    total_worker: 0,
  },
};

export function loading(state: any) {
  state.loading = true;
  state.error = null;
}

export function error(state: any, action: ActionObjectError) {
  state.loading = false;
  state.error = action.payload;
}

export function summaryLoaded(state: any, action: ActionObjectSummary) {
  state.summary = action.payload;
  state.loading = false;
  state.error = null;
  return state;
}

