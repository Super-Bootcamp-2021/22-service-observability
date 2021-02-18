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
const { captureMessage } = require ('@sentry/vue');

exports.add = (data) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    const task = await taskSvc.add(data);
    dispatch(addedAction(task));
  } catch (err) {
    captureMessage('Failed add task');
    dispatch(errorAction(`gagal menambahkan ${data.job}`));
  }
};

exports.done = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await taskSvc.done(id);
    dispatch(doneAction(id));
  } catch (err) {
    captureMessage('Failed done task');
    dispatch(errorAction('gagal menyelesaikan pekerjaan'));
  }
};

exports.cancel = (id) => async (dispatch) => {
  dispatch(loadingAction());
  try {
    await taskSvc.cancel(id);
    dispatch(canceledAction(id));
  } catch (err) {
    captureMessage('Failed cancel task');
    dispatch(errorAction('gagal membatalkan pekerjaan'));
  }
};

exports.getList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const tasks = await taskSvc.list();
    dispatch(tasksLoadedAction(tasks));
  } catch (err) {
    captureMessage('Failed list task');
    dispatch(errorAction('gagal memuat daftar pekerjaan'));
  }
};

exports.getWorkersList = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const workers = await workerSvc.list();
    dispatch(workersLoadedAction(workers));
  } catch (err) {
    captureMessage('Failed list worker');
    dispatch(errorAction('gagal memuat daftar pekerja'));
  }
};
