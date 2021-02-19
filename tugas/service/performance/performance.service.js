const { summary } = require('./performance');

async function summarySvc(req, res, logger) {
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
  } catch (err) {
    logger.error(err);
    res.statusCode = 500;
    res.end();
    return;
  }
}

module.exports = {
  summarySvc,
};
