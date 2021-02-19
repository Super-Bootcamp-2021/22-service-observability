import {
  loadingAction,
  errorAction,
  registeredAction,
  removedAction,
  workersLoadedAction,
} from './store';

import { WorkerData } from './reducer';
import {captureMessage} from '@sentry/vue'
import * as workerSvc from './worker.client';

export const register = (data: WorkerData) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    const worker = await workerSvc.register(data);
    dispatch(registeredAction(worker));
  } catch (err) {
    captureMessage(err);
    dispatch(errorAction(`gagal mendaftarkan ${data.name}`));
  }
};

export const remove = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await workerSvc.remove(id);
    dispatch(removedAction(id));
  } catch (err) {
    captureMessage(err);
    dispatch(errorAction('gagal menghapus pekerja'));
  }
};

export const getList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
    captureMessage(err);
    dispatch(errorAction('gagal memuat daftar pekerja'));
  }
};
