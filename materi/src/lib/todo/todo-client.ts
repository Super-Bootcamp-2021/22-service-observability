import {
  fetchTasksApi,
  addTaskApi,
  doneTaskApi,
  undoneTaskApi,
} from '../api/todo-service';
import { addAction, doneAction, undoneAction, loadTasksAction } from './store';

export const addTaskAsync = (task: string) => async (dispatch: any) => {
  const taskData = await addTaskApi(task);
  dispatch(addAction(taskData));
};

export const loadTasksAsync = async (dispatch) => {
  const tasksAsync = await fetchTasksApi();
  dispatch(loadTasksAction(tasksAsync));
};

export const doneTaskAsync = (id) => {
  return async (dispatch) => {
    await doneTaskApi(id);
    dispatch(doneAction(id));
  };
};

export const undoneTaskAsync = (id) => {
  return async (dispatch) => {
    try {
      await undoneTaskApi(id);
      dispatch(undoneAction(id));
    } catch (err) {
      console.log(err);
    }
  };
};
