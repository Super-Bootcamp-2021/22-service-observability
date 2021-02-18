const { createLogger, format, transports } = require('winston');

const logFormat = format.printf(({ label, level, message, timestamp }) => {
  return `${level.toUpperCase()}: ${message}  |  SERVICE: ${label}  |  TIME: ${timestamp}.`;
});

function createLogConsole(level, serviceName) {
  const logger = createLogger({
    level: level || 'info',
    format: format.json(),
    defaultMeta: { service: serviceName },
    transports: [
      // new transports.Console({
      //   format: format.json(),
      // }),
      new transports.Console({
        format: format.combine(
          format.label({ label: serviceName || 'UNKNOWN' }),
          format.timestamp(),
          logFormat
        ),
      }),
    ],
  });

  return logger;
}

function createLogFile(level, serviceName) {
  const logger = createLogger({
    level: level || 'info',
    format: format.combine(
      format.label({ label: serviceName || 'UNKNOWN' }),
      format.timestamp(),
      logFormat
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new transports.File({
        filename: `${serviceName}_error.log`,
        level: 'error',
      }),
      new transports.Console({
        format: format.combine(
          format.label({ label: serviceName || 'UNKNOWN' }),
          format.timestamp(),
          logFormat
        ),
      }),
    ],
  });

  return logger;
}

module.exports = {
  createLogConsole,
  createLogFile,
};
