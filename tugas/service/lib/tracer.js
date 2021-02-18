const { initTracer } = require('jaeger-client');

exports.createTracer = (serviceName) => {
  const config = {
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
  return initTracer(config, options);
}
