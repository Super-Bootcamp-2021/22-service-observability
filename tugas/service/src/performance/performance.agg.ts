import * as bus from '../lib/bus';
import {
  increaseTotalTask,
  increaseDoneTask,
  increaseCancelledTask,
  increaseTotalWorker,
  decreaseTotalWorker,
} from './performance';

let increaseTotalTaskSub: number;
let increaseDoneTaskSub: number;
let increaseCancelledTaskSub: number;
let increaseTotalWorkerSub: number;
let decreaseTotalWorkerSub: number;

export function run(): void {
  increaseTotalTaskSub = bus.subscribe('task.added', increaseTotalTask);
  increaseDoneTaskSub = bus.subscribe('task.done', increaseDoneTask);
  increaseCancelledTaskSub = bus.subscribe(
    'task.cancelled',
    increaseCancelledTask
  );
  increaseTotalWorkerSub = bus.subscribe(
    'worker.registered',
    increaseTotalWorker
  );
  decreaseTotalWorkerSub = bus.subscribe('worker.removed', decreaseTotalWorker);
}

export function stop(): void {
  if (increaseTotalTaskSub) {
    bus.unsubscribe(increaseTotalTaskSub);
  }
  if (increaseDoneTaskSub) {
    bus.unsubscribe(increaseDoneTaskSub);
  }
  if (increaseCancelledTaskSub) {
    bus.unsubscribe(increaseCancelledTaskSub);
  }
  if (increaseTotalWorkerSub) {
    bus.unsubscribe(increaseTotalWorkerSub);
  }
  if (decreaseTotalWorkerSub) {
    bus.unsubscribe(decreaseTotalWorkerSub);
  }
}
