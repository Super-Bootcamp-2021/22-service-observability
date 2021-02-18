import { AppContext } from '../lib/context';
import { summary } from './performance';

export interface respondOption {
  setHeader: (key: string, val: string) => void;
  write: (data: string) => void;
  end: () => void;
  statusCode: number;
}

export async function summarySvc(
  req: any,
  res: respondOption,
  { tracer, logger }: AppContext
): Promise<void> {
  const parentSpan = tracer.startSpan('Performance_summary');
  const span = tracer.startSpan('Publishing message', {
    childOf: parentSpan,
  });
  try {
    const sums = await summary();
    span.finish();
    const span2 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
    span2.finish();
    parentSpan.finish();
  } catch (err) {
    span.setTag('error', true);
    span.log({
      event: 'error publishing Message',
      message: err.message,
    });
    span.finish();
    res.statusCode = 500;
    logger.error(`${res.statusCode},${err}`);
    const span2 = tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(err.message || err));
    res.end();
    span2.finish();
    parentSpan.finish();
    return;
  }
}
