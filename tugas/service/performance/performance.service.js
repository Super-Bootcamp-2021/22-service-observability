const { summary } = require('./performance');
const { createNodeLogger } = require('../lib/logger');
const {createTracer } = require('../lib/tracer');

const logger = createNodeLogger('info', 'Performance Service');
const tracer = createTracer('Performance-Service');

async function summarySvc(req, res) {
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    span2.finish();
    res.end();
    parentSpan.finish();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    parentSpan.finish();
    return;
  }
}

module.exports = {
  summarySvc,
};
