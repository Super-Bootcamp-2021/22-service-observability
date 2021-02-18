/** @module todoReducer */

/**
 * Task type definition
 */
export interface Task {
  /**
   * id of a task
   */
  id: number;
  /**
   * task description
   */
  task: string;
  /**
   * true when task are finished
   */
  done: boolean;
}

interface ActionObject {
  type: string;
}

interface ActionObjectAdd extends ActionObject {
  payload: Task;
}

interface ActionObjectDone extends ActionObject {
  payload: number;
}

type ActionObjectUndone = ActionObjectDone;

type ActionObjectLoadTask = {
  payload: Task[];
};

// setup state
export const initialState: Task[] = [
  { id: 1, task: 'main', done: false },
  { id: 2, task: 'minum', done: true },
];

/**
 * menmbahkan task ke dalam daftar todo
 * @param state state sebelumnya
 * @param action aksi
 */
export function add(state: Task[], action: ActionObjectAdd): Task[] {
  state.push({
    id: action?.payload?.id,
    task: action?.payload?.task,
    done: false,
  });
  return state;
}

/**
 * mendandakan sebuah task sudah selesai
 * @param state state sebelumnya
 * @param action aksi
 */
export function done(state: Task[], action: ActionObjectDone): Task[] {
  const task = state.find((t) => t.id === action?.payload);
  if (!task) {
    // handle error
    return state;
  }
  task.done = true;
  return state;
}

/**
 * menandakan sebuah task tidak jadi selesai
 * @param state state sebelumnya
 * @param action aksi
 */
export function undone(state: Task[], action: ActionObjectUndone): Task[] {
  const task = state.find((t) => t.id === action?.payload);
  if (task) {
    task.done = false;
    return state;
  }

  return state;
}

/**
 * memuat daftar pekerjaan
 * @param state state sebelumnya
 * @param action aksi
 */
export function loadTasks(state: Task[], action: ActionObjectLoadTask): Task[] {
  state = action?.payload;
  return state;
}
