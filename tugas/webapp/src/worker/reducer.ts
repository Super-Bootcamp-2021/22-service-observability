import { SERVICE_BASEURL } from './config';

export interface Worker {
  id: number;
  name: string;
  photo: string;
  bio: string;
}

interface ActionObject {
  type: string;
}

interface ActionObjectError extends ActionObject {
  payload: string;
}

interface ActionObjectReg extends ActionObject {
  payload: Worker;
}

interface ActionObjectDel extends ActionObject {
  payload: number;
}

interface ActionObjectLoaded extends ActionObject {
  payload: Worker[];
}

// setup state
export const initialState = {
  loading: false,
  error: null,
  workers: [],
};

export function loading(state: any) {
  state.loading = true;
  state.error = null;
}

export function error(state: any, action:ActionObjectError) {
  state.loading = false;
  state.error = action.payload;
}

export function clearError(state: any) {
  state.error = null;
}

export function registered(state: any, action: ActionObjectReg) {
  const worker = action.payload;
  state.workers.push({
    id: worker.id,
    name: worker.name,
    photo: `${SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
  });
  state.loading = false;
  state.error = null;
  return state;
}

export function removed(state: any, action: ActionObjectDel) {
  const idx = state.workers.findIndex((t) => t.id === action.payload);
  state.workers.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export function workersLoaded(state: any, action: ActionObjectLoaded) {
  state.workers = action?.payload?.map((worker) => ({
    id: worker.id,
    name: worker.name,
    photo: `${SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
  }));
  state.loading = false;
  state.error = null;
  return state;
}
