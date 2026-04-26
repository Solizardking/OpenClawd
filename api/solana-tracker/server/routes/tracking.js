const router = require('express').Router();
const helius = require('../services/helius');

// GET /api/tracking/:address/profile  — aggregated wallet profile
router.get('/:address/profile', async (req, res, next) => {
  try {
    const address = req.params.address;

    const [identity, balances, fundedBy, solBalance] = await Promise.allSettled([
      helius.getIdentity(address),
      helius.getBalances(address, { showNfts: true, limit: 20 }),
      helius.getFundedBy(address),
      helius.getBalance(address)
    ]);

    const profile = {
      address,
      identity: identity.status === 'fulfilled' ? identity.value : null,
      balances: balances.status === 'fulfilled' ? balances.value : null,
      fundedBy: fundedBy.status === 'fulfilled' ? fundedBy.value : null,
      solLamports: solBalance.status === 'fulfilled' ? solBalance.value?.value : null,
      fetchedAt: new Date().toISOString()
    };

    res.json(profile);
  } catch (err) { next(err); }
});

// GET /api/tracking/:address/activity  — recent activity summary
router.get('/:address/activity', async (req, res, next) => {
  try {
    const address = req.params.address;
    const limit = parseInt(req.query.limit) || 25;

    const [history, transfers] = await Promise.allSettled([
      helius.getHistory(address, { limit }),
      helius.getTransfers(address, { limit })
    ]);

    res.json({
      address,
      history: history.status === 'fulfilled' ? history.value : null,
      transfers: transfers.status === 'fulfilled' ? transfers.value : null,
      fetchedAt: new Date().toISOString()
    });
  } catch (err) { next(err); }
});

// POST /api/tracking/batch-profile  — profile multiple wallets
router.post('/batch-profile', async (req, res, next) => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'addresses array required' });
    }

    const limited = addresses.slice(0, 10); // cap at 10 for performance

    const profiles = await Promise.all(
      limited.map(async (addr) => {
        const [identity, balances] = await Promise.allSettled([
          helius.getIdentity(addr),
          helius.getBalances(addr, { limit: 5 })
        ]);
        return {
          address: addr,
          identity: identity.status === 'fulfilled' ? identity.value : null,
          balances: balances.status === 'fulfilled' ? balances.value : null
        };
      })
    );

    res.json({ profiles, fetchedAt: new Date().toISOString() });
  } catch (err) { next(err); }
});

module.exports = router;
