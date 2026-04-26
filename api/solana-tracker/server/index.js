require('dotenv').config();
const express = require('express');
const cors = require('cors');

const walletRoutes = require('./routes/wallet');
const dasRoutes = require('./routes/das');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/das', dasRoutes);
app.use('/api/tracking', trackingRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.status || 500
  });
});

app.listen(PORT, () => {
  console.log(`\n🟢 Solana Tracker API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
