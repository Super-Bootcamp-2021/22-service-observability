import { loadingAction, errorAction, summaryLoadedAction } from './store';
import * as perfSvc from './performance.client';
import * as Sentry from '@sentry/vue';

export const summary = async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    Sentry.captureException(new Error(err));
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
