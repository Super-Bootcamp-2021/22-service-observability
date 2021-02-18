import { SERVICE_BASEURL } from './config';

export interface Worker {
  [propName: string]: any;
}
export interface Task {
  [propName: string]: any;
}
export interface State {
  loading: boolean;
  error: string | null;
  workers: Worker[];
  tasks: Task[];
}

interface ActionObject {
  type: string;
}
interface ActionObjectAdd extends ActionObject {
  payload: Task;
}
interface ActionObjectError extends ActionObject {
  payload: string;
}
interface ActionObjectDone extends ActionObject {
  payload: number;
}
type ActionObjectCancel = ActionObjectDone;
interface ActionObjectTasks extends ActionObject {
  payload: Task[];
}
interface ActionObjectWorkers extends ActionObject {
  payload: Worker[];
}

// setup state
export const initialState: State = {
  loading: false,
  error: null,
  workers: [],
  tasks: [],
};

export function loading(state: State) {
  state.loading = true;
  state.error = null;
}

export function error(state: State, action: ActionObjectError) {
  state.loading = false;
  state.error = action.payload;
}

export function clearError(state: State) {
  state.error = null;
}

export function added(state: State, action: ActionObjectAdd): State {
  const task = action.payload;
  state.tasks.push({
    id: task.id,
    job: task.job,
    assignee: task.assignee.name,
    attachment: `${SERVICE_BASEURL}/attachment/${task.attachment}`,
    done: false,
  });
  state.loading = false;
  state.error = null;
  return state;
}

export function done(state: State, action: ActionObjectDone): State {
  const idx = state.tasks.findIndex((t) => t.id === action.payload);
  state.tasks[idx].done = true;
  state.loading = false;
  state.error = null;
  return state;
}

export function canceled(state: State, action: ActionObjectCancel): State {
  const idx = state.tasks.findIndex((t) => t.id === action.payload);
  state.tasks.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export function tasksLoaded(state: State, action: ActionObjectTasks): State {
  state.tasks = action.payload
    .filter((t) => !t.cancelled)
    .map((task) => ({
      id: task.id,
      job: task.job,
      assignee: task.assignee.name,
      attachment: `${SERVICE_BASEURL}/attachment/${task.attachment}`,
      done: task.done,
    }));
  state.loading = false;
  state.error = null;
  return state;
}

export function workersLoaded(
  state: State,
  action: ActionObjectWorkers
): State {
  state.workers = action.payload.map((worker) => ({
    id: worker.id,
    name: worker.name,
  }));
  state.loading = false;
  state.error = null;
  return state;
}
