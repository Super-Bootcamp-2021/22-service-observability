import { loadingAction, errorAction, summaryLoadedAction } from './store';
import { captureMessage } from '@sentry/vue';
import perfSvc from './performance.client';

export const summary = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    captureMessage('Failed get performance');
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
