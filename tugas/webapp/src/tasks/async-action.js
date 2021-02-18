const {
  loadingAction,
  errorAction,
  doneAction,
  canceledAction,
  tasksLoadedAction,
  workersLoadedAction,
  addedAction,
} = require('./store');
const workerSvc = require('./worker.client');
const taskSvc = require('./task.client');
const { captureException } = require ('@sentry/vue');
import '../lib/sentry';

export const add = (data) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    const task = await taskSvc.add(data);
    dispatch(addedAction(task));
  } catch (err) {
    captureException(new Error('Failed add task'));
    dispatch(errorAction(`gagal menambahkan ${data.job}`));
  }
};

export const done = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await taskSvc.done(id);
    dispatch(doneAction(id));
  } catch (err) {
    captureException(new Error('Failed done task'));
    dispatch(errorAction('gagal menyelesaikan pekerjaan'));
  }
};

export const cancel = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await taskSvc.cancel(id);
    dispatch(canceledAction(id));
  } catch (err) {
    captureException(new Error('Failed cancel task'));
    dispatch(errorAction('gagal membatalkan pekerjaan'));
  }
};

export const getList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const tasks = await taskSvc.list();
    dispatch(tasksLoadedAction(tasks));
  } catch (err) {
    captureException(new Error('Failed list task'));
    dispatch(errorAction('gagal memuat daftar pekerjaan'));
  }
};

export const getWorkersList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
    captureException(new Error('Failed list worker'));
    dispatch(errorAction('gagal memuat daftar pekerja'));
  }
};
