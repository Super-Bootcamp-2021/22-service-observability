import { createConnection, EntitySchema } from 'typeorm';

export function connect(entities:EntitySchema[], config:any) {
  return createConnection({
    ...config,
    synchronize: true,
    timezone: 'Asia/Jakarta',
    entities,
  });
}
