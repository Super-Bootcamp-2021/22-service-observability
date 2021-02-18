import { loadingAction, errorAction, summaryLoadedAction } from './store';
const { captureMessage, captureException } = require ('@sentry/vue');
import perfSvc from './performance.client';
import '../lib/sentry';

export const summary = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    captureException(new Error('Failed get performance'));
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
