const { summary } = require('./performance');

const { createTracer } = require('../lib/tracer');
const tracer = createTracer('performance.service');

async function summarySvc(req, res) {
  const parentSpan = tracer.startSpan('GET /summary');
  const span1 = tracer.startSpan('get performance summary', {
    childOf: parentSpan,
  });
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
    span1.setTag('info', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'get performance summary',
      message: 'success',
    });
    span1.finish();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    span1.setTag('error', true);
    span1.setTag('statusCode', res.statusCode);
    span1.log({
      event: 'error get performance summary',
      message: err,
    });
    span1.finish();
    return;
  }
  parentSpan.finish();
}

module.exports = {
  summarySvc,
};
