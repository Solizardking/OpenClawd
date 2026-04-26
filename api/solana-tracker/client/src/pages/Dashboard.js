import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [address, setAddress] = useState('');
  const [health, setHealth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
  }, []);

  const go = (e) => {
    e.preventDefault();
    if (address.trim()) navigate(`/profile/${address.trim()}`);
  };

  return (
    <div>
      <h1 className="page-title">Solana Address Tracker</h1>
      <p className="page-subtitle">Powered by Helius Wallet API & DAS</p>

      <form className="search-bar" onSubmit={go}>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter any Solana wallet address to begin..."
          spellCheck={false}
          autoFocus
        />
        <button type="submit" disabled={!address.trim()}>Track Wallet</button>
      </form>

      <div className="card-grid">
        <div className="card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>◉ Wallet Profile</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Full wallet overview — identity, balances, funding source, and NFTs in one view.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/balances')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>◧ Token Balances</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            All SPL tokens and NFTs with USD values, sorted by portfolio weight.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>◷ Transaction History</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Complete transaction history with balance changes and decoded instructions.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/transfers')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>⇌ Token Transfers</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            All incoming and outgoing token transfers with counterparty info.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/funding')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>◎ Funding Source</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Discover who originally funded a wallet — exchange detection & attribution.
          </p>
        </div>

        <div className="card" onClick={() => navigate('/batch')} style={{ cursor: 'pointer' }}>
          <div className="card-header"><h2>▦ Batch Lookup</h2></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Identify up to 100 wallets at once — exchanges, protocols, institutions.
          </p>
        </div>
      </div>

      {health && (
        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          API Status: <span className="green">● online</span> · {health.timestamp}
        </div>
      )}
    </div>
  );
}
