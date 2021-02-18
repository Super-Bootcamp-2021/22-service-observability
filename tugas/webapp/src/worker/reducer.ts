import { SERVICE_BASEURL } from './config';

// setup state
export const initialState= {
  loading: false,
  error: null,
  workers: [],
};

export function loading(state) {
  state.loading = true;
  state.error = null;
}

export function error(state, action) {
  state.loading = false;
  state.error = action.payload;
}

export function clearError(state) {
  state.error = null;
}

export function registered(state, action) {
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

export function removed(state, action) {
  const idx = state.workers.findIndex((t) => t.id === action.payload);
  state.workers.splice(idx, 1);
  state.loading = false;
  state.error = null;
  return state;
}

export function workersLoaded(state, action) {
  state.workers = action.payload.map((worker) => ({
    id: worker.id,
    name: worker.name,
    photo: `${SERVICE_BASEURL}/photo/${worker.photo}`,
    bio: worker.bio,
  }));
  state.loading = false;
  state.error = null;
  return state;
}