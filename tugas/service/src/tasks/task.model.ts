import { EntitySchema, Timestamp } from 'typeorm';

export interface TaskData {
  job: string;
  assignee: number;
  attachment: string;
}

export class Task {
  public id: number;
  constructor(
    id: number,
    public job: string,
    public assignee: number,
    public done: boolean,
    public cancelled: boolean,
    public attachment: string,
    public addedAt: Timestamp
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

export const TaskSchema = new EntitySchema<any>({
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
