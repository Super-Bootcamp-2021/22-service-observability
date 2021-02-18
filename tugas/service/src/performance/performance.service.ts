import { summary } from './performance';
import { IncomingMessage, ServerResponse } from 'http';

export async function summarySvc(req: IncomingMessage, res: ServerResponse) {
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    return;
  }
}


