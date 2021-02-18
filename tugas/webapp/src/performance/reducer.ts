// setup state
export interface State {
  loading: boolean,
  error: string | null,
  summary: PerformanceSummary
}

export interface PerformanceSummary {
  total_task: number,
  task_done: number,
  task_cancelled: number,
  total_worker: number,
}

interface ActionObject {
  type: string
}

interface ActionObjectError extends ActionObject {
  payload: string;
}

interface ActionObjectLoadData extends ActionObject {
  payload: PerformanceSummary;
}


export const initialState: State = {
  loading: false,
  error: null,
  summary: {
    total_task: 0,
    task_done: 0,
    task_cancelled: 0,
    total_worker: 0,
  },
};

export function loading(state: State): void{
  state.loading = true;
  state.error = null;
}

export function error(state: State, action: ActionObjectError): void {
  state.loading = false;
  state.error = action.payload;
}

export function summaryLoaded(state: State, action: ActionObjectLoadData ): State {
  state.summary = action.payload;
  state.loading = false;
  state.error = null;
  return state;
}
