const { loadingAction, errorAction, summaryLoadedAction } = require('./store');
const perfSvc = require('./performance.client');
const { captureException } = require('@sentry/vue');

/**
 * @async
 * @method
 * @param {Function} dispatch
 */
exports.summary = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    captureException('gagal memuat informasi kinerja');
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
