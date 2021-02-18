import { EntitySchema } from 'typeorm';

export interface Worker {
  id?: number; // karena id worker otomatis di increment maka kadang id tidak di inisiasi
  name: string;
  age: number;
  bio: string;
  address: string;
  photo: string;
}

export class Worker {
  constructor(
    id: number,
    name: string,
    age: number,
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
