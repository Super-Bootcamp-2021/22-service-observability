const { summary } = require('./performance');

async function summarySvc(req, res, tracer) {
  const parentSpan = tracer.startSpan('performance service');
  const span = tracer.startSpan('get summary', { childOf: parentSpan });
  try {
    const sums = await summary();
    span.finish();
    parentSpan.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
  } catch (err) {
    span.setTag('error', true);
    span.log({ event: 'error get summary', message: err });
    res.statusCode = 500;
    res.end();
    return;
  }
}

module.exports = {
  summarySvc,
};
