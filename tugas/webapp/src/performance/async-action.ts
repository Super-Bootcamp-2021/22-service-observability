import { loadingAction, errorAction, summaryLoadedAction } from './store';
import * as perfSvc from './performance.client';

export const summary = async (dispatch) => {
  dispatch(loadingAction());
  try {
    const summary = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
