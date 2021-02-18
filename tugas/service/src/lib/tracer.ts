import { initTracer, JaegerTracer, TracingConfig } from 'jaeger-client';
import { Logger } from 'winston';
import { createNodeLogger, LogLevel } from './logger';

const logger: Logger = createNodeLogger(LogLevel.info, `jaeger`);

export function createTracer(serviceName: string): JaegerTracer {
  const config: TracingConfig = {
    serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  };
  const options = {
    logger: {
      info(msg) {
        logger.info(msg);
      },
      error(msg) {
        logger.error(msg);
      },
    },
  };
  return initTracer(config, options);
}
