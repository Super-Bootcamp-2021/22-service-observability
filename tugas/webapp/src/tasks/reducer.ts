import { TASK_SERVICE_BASEURL } from '../config';

export interface Task {
  id: number;
  job: string;
  cancelled: boolean;
  assignee: Worker;
  attachment: string;
  done: boolean;
}

export interface Worker {
  id: number;
  name: string;
}

interface ActionObject {
  type: string;
}

interface ActionObjectError extends ActionObject {
  payload: string;
}

interface ActionObjectDone extends ActionObject {
  payload: number;
}

interface ActionObjectLoaded extends ActionObject {
  payload: Task[];
}

interface ActionObjectWorker extends ActionObject {
  payload: Worker[];
}

type ActionObjectCancel = ActionObjectDone;
// setup state
export const initialState: any = {
  loading: false,
  error: null,
  workers: [],
  tasks: [],
};

export function loading(state: any) {
  state.loading = true;
  state.error = null;
}

export function error(state: any, action: ActionObjectError) {
  state.loading = false;
  state.error = action.payload;
}

export function clearError(state: any) {
  state.error = null;
}

export function added(state: any, action) {
  const task = action.payload;
  state.tasks.push({
    id: task.id,
    job: task.job,
    assignee: task.assignee.name,
    attachment: `${TASK_SERVICE_BASEURL}/attachment/${task.attachment}`,
    done: false,
  });
  state.loading = false;
  state.error = null;
  return state;
}

export function done(state: any, action: ActionObjectDone) {
  const idx = state.tasks.findIndex((t) => t.id === action.payload);
  state.tasks[idx].done = true;
  state.loading = false;
  state.error = null;
  return state;
}

export function canceled(state: any, action: ActionObjectCancel) {
  const idx = state.tasks.findIndex((t) => t.id === action.payload);
  state.tasks.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export function tasksLoaded(state: any, action: ActionObjectLoaded) {
  state.tasks = action.payload
    .filter((t) => !t.cancelled)
    .map((task) => ({
      id: task.id,
      job: task.job,
      assignee: task.assignee.name,
      attachment: `${TASK_SERVICE_BASEURL}/attachment/${task.attachment}`,
      done: task.done,
    }));
  state.loading = false;
  state.error = null;
  return state;
}

export function workersLoaded(state: any, action: ActionObjectWorker) {
  state.workers = action.payload.map((worker) => ({
    id: worker.id,
    name: worker.name,
  }));
  state.loading = false;
  state.error = null;
  return state;
}
