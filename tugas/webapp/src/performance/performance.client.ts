import { client } from '../lib/http-client';

import { PERFORMANCE_SERVICE_BASEURL } from '../config';

export function summary() {
  return client.get(`${PERFORMANCE_SERVICE_BASEURL}/summary`);
}
