const {
  loadingAction,
  errorAction,
  registeredAction,
  removedAction,
  workersLoadedAction,
} = require('./store');
const workerSvc = require('./worker.client');
const { captureException } = require ('@sentry/vue');
import '../lib/sentry';

export const register = (data) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    const worker = await workerSvc.register(data);
    dispatch(registeredAction(worker));
  } catch (err) {
    captureException(new Error('Failed add worker'));
    dispatch(errorAction(`gagal mendaftarkan ${data.name}`));
  }
};

export const remove = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await workerSvc.remove(id);
    dispatch(removedAction(id));
  } catch (err) {
    captureException(new Error('Failed remove worker'));
    dispatch(errorAction('gagal menghapus pekerja'));
  }
};

export const getList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
    captureException(new Error('Failed get worker'));
    dispatch(errorAction('gagal memuat daftar pekerja'));
  }
};
