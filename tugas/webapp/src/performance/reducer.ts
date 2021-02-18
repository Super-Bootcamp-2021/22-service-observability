// setup state
export interface Performance {
  loading: boolean;
  error: any;
  summary: {
    total_task: number,
    task_done: number,
    task_cancelled: number,
    total_worker: number,
  }
}

export interface Summary {
  total_task: number,
  task_done: number,
  task_cancelled: number,
  total_worker: number,
}

interface ActionObject {
  type: string;
}

interface ErrorAction extends ActionObject {
  payload: Performance;
}

interface SummaryLoaded extends ActionObject {
  payload: Summary;
}

export const initialState: Performance = {
  loading: false,
  error: null,
  summary: {
    total_task: 0,
    task_done: 0,
    task_cancelled: 0,
    total_worker: 0,
  },
};

export function loading(state: Performance) {
  state.loading = true;
  state.error = null;
}

export function error(state: Performance, action: ErrorAction) {
  state.loading = false;
  state.error = action?.payload;
}

export function summaryLoaded(state: Performance, action: SummaryLoaded) {
  state.summary = action?.payload;
  state.loading = false;
  state.error = null;
  return state;
}
