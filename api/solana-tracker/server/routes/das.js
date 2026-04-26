const router = require('express').Router();
const helius = require('../services/helius');

// GET /api/das/assets/:owner
router.get('/assets/:owner', async (req, res, next) => {
  try {
    const data = await helius.dasGetAssetsByOwner(req.params.owner, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/das/asset/:id
router.get('/asset/:id', async (req, res, next) => {
  try {
    const data = await helius.dasGetAsset(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/das/search
router.post('/search', async (req, res, next) => {
  try {
    const data = await helius.dasSearchAssets(req.body);
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/das/token-accounts/:owner
router.get('/token-accounts/:owner', async (req, res, next) => {
  try {
    const data = await helius.dasGetTokenAccounts(req.params.owner);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
