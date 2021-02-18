import {
  loadingAction,
  errorAction,
  doneAction,
  canceledAction,
  tasksLoadedAction,
  workersLoadedAction,
  addedAction,
} from './store';
import * as workerSvc from './worker.client';
import * as taskSvc from './task.client';
import * as Sentry from '@sentry/vue';


export const add = (data: any) => async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    const task = await taskSvc.add(data);
    dispatch(addedAction(task));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction(`gagal menambahkan ${data.job}`));
  }
};

export const done = (id: number) => async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    await taskSvc.done(id);
    dispatch(doneAction(id));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction('gagal menyelesaikan pekerjaan'));
  }
};

export const cancel = (id: number) => async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    await taskSvc.cancel(id);
    dispatch(canceledAction(id));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction('gagal membatalkan pekerjaan'));
  }
};

export const getList = async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    const tasks = await taskSvc.list();
    dispatch(tasksLoadedAction(tasks));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction('gagal memuat daftar pekerjaan'));
  }
};

export const getWorkersList = async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction('gagal membatalkan pekerjaan'));
  }
};
