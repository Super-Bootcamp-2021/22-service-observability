/** @module orm */

import {
  Connection,
  ConnectionOptions,
  createConnection,
  EntitySchema,
} from 'typeorm';

/**
 * connect to database
 * @deprecated
 * @param entities model entitites schemas
 * @param config additional [`typeorm`](https://typeorm.io) connection config
 *
 * @example
 *
 * here is a simple usage
 * ```
 * async function init() {
 *  await connect([MySchema], {
 *    type: 'postgres',
 *    host: 'localhost',
 *    port: 5432,
 *    username: 'postgres',
 *    password: 'postgres',
 *    database:
 *    'sanbercode1',
 *  });
 * }
 * ```
 */
export function connect(
  entities: EntitySchema[],
  config: ConnectionOptions
): Promise<Connection> {
  return createConnection({
    ...config,
    synchronize: true,
    entities,
  });
}
