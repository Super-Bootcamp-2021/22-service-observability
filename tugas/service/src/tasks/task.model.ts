import { EntitySchema, TableExclusion } from 'typeorm';
export interface WorkerInterface {
  id: number;
  name: string;
  age: number;
  bio: string;
  address: string;
  photo: string;
}
export interface TaskInterface {
  id: number;
  job: string;
  done: boolean;
  cancelled: boolean;
  addedAt: string;
  attachment: string;
  assignee: WorkerInterface;
}
export class Task {
  constructor(
    public id: number,
    public job: string,
    public assignee: WorkerInterface,
    public done: boolean,
    public cancelled: boolean,
    public attachment: string,
    public addedAt: string
  ) {
    this.id = id;
    this.job = job;
    this.done = done;
    this.cancelled = cancelled;
    this.addedAt = addedAt;
    this.attachment = attachment;
    this.assignee = assignee;
  }
}

export const TaskSchema = new EntitySchema<TaskInterface>({
  name: 'Task',
  tableName: 'tasks',
  target: Task,
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    job: {
      type: 'text',
    },
    done: {
      type: 'boolean',
      default: false,
    },
    cancelled: {
      type: 'boolean',
      default: false,
    },
    attachment: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    addedAt: {
      type: 'timestamp',
      name: 'added_at',
      nullable: false,
      default: () => 'NOW()',
    },
  },
  relations: {
    assignee: {
      target: 'Worker',
      type: 'many-to-one',
      onDelete: 'CASCADE',
    },
  },
});
