const { summary } = require('./performance');
const { createNodeLogger } = require('../lib/logger');

const logger = createNodeLogger('info', 'Performance Service');

async function summarySvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('performance service');
  const span = tracer.startSpan('get summary', { childOf: parentSpan });
  try {
    const sums = await summary();
    span.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    span2.finish();
    res.end();
    parentSpan.finish();
  } catch (err) {
    span.setTag('error', true);
    span.log({ event: 'error get summary', message: err });
    logger.error('unkown server error');
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
}

module.exports = {
  summarySvc,
};
