import { createLogger, format, transports, Logger } from 'winston';
export enum LogLevel {
    error = 'error',
    warn = 'warn',
    info = 'info'
}
const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });

export function createNodeLogger(Level: LogLevel): Logger {
    const logger = createLogger({
        level: Level || 'info',
        format: format.combine(format.timestamp(),myFormat),
        defaultMeta: { service: 'main-service'},
        transports: [
            new transports.File({ filename: 'error.log', level: 'error'}),
            new transports.Console({
                format: format.combine(format.timestamp(),myFormat)
            }),
        ],
    });
     
    return logger;
}