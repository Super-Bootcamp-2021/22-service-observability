const { createLogger, format, transports, Logger } = require('winston');

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

function createNodeLogger(level, serviceName) {
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

module.exports = {
  createNodeLogger
}

