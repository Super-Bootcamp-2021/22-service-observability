const { summary } = require('./performance');

async function summarySvc(req, res, ctx, logger) {
  const span = ctx.startSpan('get_summary_performance');
  try {
    const sums = await summary();
    span.finish();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
  } catch (err) {
    logger.error(err);
    res.statusCode = 500;
    span.setTag('error', true);
    span.finish();
    res.end();
    return;
  }
}

module.exports = {
  summarySvc,
};
