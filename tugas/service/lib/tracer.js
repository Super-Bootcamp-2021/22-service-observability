const { initTracer, } = require('jaeger-client')

const connect = (config) => {
  let serviceName = config.serviceName;
  const TracingConfig = {
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
        console.log('INFO', msg);
      },
      error(msg) {
        console.log('ERROR', msg);
      },
    },
  };
  return initTracer(TracingConfig,options);
}

module.exports = { connect };