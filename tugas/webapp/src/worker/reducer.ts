import { WORKER_SERVICE_BASEURL } from '../config';

export interface Worker {
  id: number;
  name: string;
  photo: string;
  bio: string;
}

interface initial_state  {
  loading: boolean;
  error: null | string;
  workers: Worker[]
}

interface ActionObject {
  type: string;
}

interface ActionObjectError extends ActionObject {
  payload: string
}

type ActionObjectRegister = {
  payload: Worker
}

type ActionObjectRemove = {
  payload: number
}

type ActionObjectLoadWorker = {
  payload: Worker[]
}

// setup state
export const initialState: initial_state = {
  loading: false,
  error: null,
  workers: [],
};

export const loading = (state: initial_state) => {
  state.loading = true;
  state.error = null;
}

export const error = (state: initial_state, action: ActionObjectError) => {
  state.loading = false;
  state.error = action?.payload;
}

export const clearError = (state: initial_state) => {
  state.error = null;
}

export const registered = (state: initial_state, action: ActionObjectRegister) => {
  const worker = action?.payload;
  state.workers.push({
    id: worker.id,
    name: worker.name,
    photo: `${WORKER_SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
  });
  state.loading = false;
  state.error = null;
  return state;
}

export const removed = (state: initial_state, action: ActionObjectRemove) => {
  const idx = state.workers.findIndex((t) => t.id === action?.payload);
  state.workers.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export const workersLoaded = (state: initial_state, action: ActionObjectLoadWorker) => {
  state.workers = action?.payload.map((worker) => ({
    id: worker.id,
    name: worker.name,
    photo: `${WORKER_SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
  }));
  state.loading = false;
  state.error = null;
  return state;
};
