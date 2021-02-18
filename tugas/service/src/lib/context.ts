import { JaegerTracer } from 'jaeger-client';
import { Logger } from 'winston';

export interface AppContext {
  logger: Logger;
  tracer: JaegerTracer;
}