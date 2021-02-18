import { EntitySchema } from 'typeorm';

export interface WorkerInterface {
  id: number;
  name: string;
  age: any;
  bio: string;
  address: string;
  photo: string;
}

export class Worker implements WorkerInterface {
  public id: number;
  public name: string;
  public age: any;
  public bio: string;
  public address: string;
  public photo: string;
  constructor(
    id: number,
    name: string,
    age: any,
    bio: string,
    address: string,
    photo: string
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
