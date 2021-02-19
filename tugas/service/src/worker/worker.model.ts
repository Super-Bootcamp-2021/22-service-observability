import { EntitySchema } from 'typeorm';

export interface WorkerData {
  name: string;
  age: string;
  bio: string;
  address: string;
  photo: string;
}

export class Worker {
  public id: number;
  constructor(
    id: number,
    public name: string,
    public age: number,
    public bio: string,
    public address: string,
    public photo: string
  ) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.bio = bio;
    this.address = address;
    this.photo = photo;
  }
}

export const WorkerSchema = new EntitySchema({
  name: 'Worker',
  target: Worker,
  tableName: 'workers',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 255,
    },
    age: {
      type: 'int',
    },
    bio: {
      type: 'text',
    },
    address: {
      type: 'text',
    },
    photo: {
      type: 'varchar',
      length: 255,
    },
  },
});
