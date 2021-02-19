import { loadingAction, errorAction, summaryLoadedAction } from './store';
import * as perfSvc from './performance.client';
import {captureMessage} from '@sentry/vue'

export const summary = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    captureMessage(err);
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
