import { SERVICE_BASEURL } from './config';

export interface State {
  loading: boolean;
  error: string | null;
  workers: Worker[];
}

export interface Worker {
  id: number;
  name: string;
  photo: string;
  bio: string;
  age: string | number;
  address: string;
}

export interface WorkerData {
  name: string;
  photo: any;
  bio: string;
  age: string | number;
  address: string;
}

interface ActionObject {
  type: string;
}

interface ActionObjectError extends ActionObject {
  payload: string;
}

interface ActionObjectRegistered extends ActionObject {
  payload: Worker;
}

interface ActionObjectRemoved extends ActionObject {
  payload: number | string;
}

interface ActionObjecLoaded extends ActionObject {
  payload: Worker[];
}
// setup state
export const initialState: State = {
  loading: false,
  error: null,
  workers: [],
};

export function loading(state: State): void {
  state.loading = true;
  state.error = null;
}

export function error(state: State, action: ActionObjectError): void {
  state.loading = false;
  state.error = action.payload;
}

export function clearError(state: State): void {
  state.error = null;
}

export function registered(
  state: State,
  action: ActionObjectRegistered
): State {
  const worker = action.payload;
  state.workers.push({
    id: worker.id,
    name: worker.name,
    photo: `${SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
    age: worker.age,
    address: worker.address,
  });
  state.loading = false;
  state.error = null;
  return state;
}

export function removed(state: State, action: ActionObjectRemoved): State {
  const idx = state.workers.findIndex((t) => t.id === action.payload);
  state.workers.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export function workersLoaded(state: State, action: ActionObjecLoaded): State {
  state.workers = action.payload.map((worker) => ({
    id: worker.id,
    name: worker.name,
    photo: `${SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
    age: worker.age,
    address: worker.address,
  }));
  state.loading = false;
  state.error = null;
  return state;
}
