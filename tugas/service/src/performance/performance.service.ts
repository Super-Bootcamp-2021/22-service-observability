import { summary } from './performance';
import { AppContext } from '../lib/context';

export async function summarySvc(req, res, { tracer, logger }: AppContext) {
  const parentSpan = tracer.startSpan('get_summary_performance');
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    const span = tracer.startSpan('parsing_body', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(sums));
    res.end();
    span.finish();
  } catch (err) {
    logger.error('failed parsing body to get summary of performance');
    const span = tracer.startSpan('get error', {
      childOf: parentSpan,
    });
    span.setTag('error', true);
    span.log({
      event: 'error parsing body',
      message: 'internal server error',
    });
    res.statusCode = 500;
    res.end();
    span.finish();
    parentSpan.finish();
    return;
  }
}
