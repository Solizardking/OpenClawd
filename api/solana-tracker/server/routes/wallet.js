const router = require('express').Router();
const helius = require('../services/helius');

// GET /api/wallet/:address/identity
router.get('/:address/identity', async (req, res, next) => {
  try {
    const data = await helius.getIdentity(req.params.address);
    if (!data) return res.status(404).json({ error: 'No identity found', code: 404 });
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/wallet/batch-identity
router.post('/batch-identity', async (req, res, next) => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'addresses array required' });
    }
    const data = await helius.batchIdentity(addresses.slice(0, 100));
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/wallet/:address/balances
router.get('/:address/balances', async (req, res, next) => {
  try {
    const data = await helius.getBalances(req.params.address, {
      page: req.query.page,
      limit: req.query.limit,
      showNfts: req.query.showNfts === 'true',
      showZeroBalance: req.query.showZeroBalance === 'true',
      showNative: req.query.showNative !== 'false'
    });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/wallet/:address/history
router.get('/:address/history', async (req, res, next) => {
  try {
    const data = await helius.getHistory(req.params.address, {
      before: req.query.before,
      limit: req.query.limit
    });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/wallet/:address/transfers
router.get('/:address/transfers', async (req, res, next) => {
  try {
    const data = await helius.getTransfers(req.params.address, {
      before: req.query.before,
      limit: req.query.limit
    });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/wallet/:address/funded-by
router.get('/:address/funded-by', async (req, res, next) => {
  try {
    const data = await helius.getFundedBy(req.params.address);
    if (!data) return res.status(404).json({ error: 'No funding transaction found', code: 404 });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
