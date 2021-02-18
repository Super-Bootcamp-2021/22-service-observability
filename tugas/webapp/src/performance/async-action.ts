import { loadingAction, errorAction, summaryLoadedAction } from './store';
import * as perfSvc from './performance.client';

export const summary = async (dispatch: any) => {
  dispatch(loadingAction());
  try {
    const summary:perfSvc.performanceResult = await perfSvc.summary();
    dispatch(summaryLoadedAction(summary));
  } catch (err) {
    dispatch(errorAction('gagal memuat informasi kinerja'));
  }
};
