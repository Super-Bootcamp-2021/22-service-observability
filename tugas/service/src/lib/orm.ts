import { createConnection, EntitySchema, ConnectionOptions, } from 'typeorm';


export function connect(entities:EntitySchema[], config:ConnectionOptions) {
  return createConnection({
    ...config,
    synchronize: true,
    entities,
  });
}

