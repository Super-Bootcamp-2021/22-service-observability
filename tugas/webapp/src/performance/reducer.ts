import { performanceResult } from "./performance.client";
import { ActionType } from "./store";

export interface Performances {
  loading: boolean;
  error: any;
  summary: {
    total_task: number;
    task_done: number;
    task_cancelled: number;
    total_worker: number;
  },
}

interface ActionObject {
  type: ActionType;
}

interface ActionObjectError extends ActionObject {
  payload: any;
}

interface ActionObjectLoadTask extends ActionObject{
  payload: performanceResult
}

// setup state
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



export function loading(state: Performances) {
  state.loading = true;
  state.error = null;
}

export function error(state: Performances, action: ActionObjectError) {
  state.loading = false;
  state.error = action.payload;
}

export function summaryLoaded(state: Performances, action: ActionObjectLoadTask): Performances {
  state.summary = action.payload;
  state.loading = false;
  state.error = null;
  return state;
}
