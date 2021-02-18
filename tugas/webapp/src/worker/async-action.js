/**@module async-action-worker */

const {
  loadingAction,
  errorAction,
  registeredAction,
  removedAction,
  workersLoadedAction,
} = require('./store');
const workerSvc = require('./worker.client');
const { captureException } = require('@sentry/vue');

/**
 * memasukkan data pekerja
 * @function
 * @param {WorkerData} data
 */
exports.register = (data) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    const worker = await workerSvc.register(data);
    dispatch(registeredAction(worker));
  } catch (err) {
		captureException(`gagal mendaftarkan ${data.name}`);
    dispatch(errorAction(`gagal mendaftarkan ${data.name}`));
  }
};

/**
 * menghapus data pekerja dengan id tertentu
 * @function
 * @param {number} id
 */
exports.remove = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await workerSvc.remove(id);
    dispatch(removedAction(id));
  } catch (err) {
		captureException(`gagal menghapus pekerja`);
    dispatch(errorAction('gagal menghapus pekerja'));
  }
};

/**
 * memuat semua data pekerja
 * @function
 */
exports.getList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
		captureException(`gagal memuat daftar pekerja`);
    dispatch(errorAction('gagal memuat daftar pekerja'));
  }
};
