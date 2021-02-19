/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { summary } from './performance';
import { IncomingMessage, ServerResponse } from 'http';
import { JaegerTracer } from 'jaeger-client';

export async function summarySvc(
  req: IncomingMessage,
  res: ServerResponse,
  tracer: JaegerTracer
) {
  const parentSpan = tracer.startSpan('Performance Summary');
  const span = tracer.startSpan('Read from KV', {
    childOf: parentSpan,
  });
  try {
    const sums = await summary();
    span.finish();
    res.setHeader('content-type', 'application/json');
    const span2 = tracer.startSpan('Encode Result', {
      childOf: parentSpan,
    });
    res.write(JSON.stringify(sums));
    span2.finish();
    res.end();
    parentSpan.finish();
  } catch (err) {
    span.setTag('error', true);
    span.log({
      event: 'error read from KV',
      message: 'gagal membaca data',
    });
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
}
