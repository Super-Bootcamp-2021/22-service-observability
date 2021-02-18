import { createLogger, format, transports, Logger } from 'winston';

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
}

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export function createNodeLogger(level: LogLevel, serviceName: string): Logger {
  const logger = createLogger({
    level: level || 'info',
    format: format.combine(format.timestamp(), myFormat),
    defaultMeta: { service: serviceName },
    transports: [
      new transports.File({
        filename: serviceName + '_error.log',
        level: 'error',
      }),
      new transports.Console({
        format: format.combine(format.timestamp(), myFormat),
      }),
    ],
  });

  return logger;
}
