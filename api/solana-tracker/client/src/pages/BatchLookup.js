import React, { useState } from 'react';
import api from '../services/api';
import { AddressLink, StatusBadge, getCategoryBadgeType } from '../components/Shared';

export default function BatchLookup() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = async () => {
    const addresses = input
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => a.length > 30);

    if (addresses.length === 0) {
      setError('Enter at least one valid Solana address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.wallet.batchIdentity(addresses.slice(0, 100));
      setResults({ identities: data, queried: addresses.length });
    } catch (e) {
      setError(e.error || 'Batch lookup failed');
    }
    setLoading(false);
  };

  const knownCount = results?.identities?.length || 0;

  return (
    <div>
      <h1 className="page-title">Batch Identity Lookup</h1>
      <p className="page-subtitle">Identify up to 100 wallet addresses at once</p>

      <div className="card">
        <div className="card-header"><h2>Addresses</h2></div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'Paste wallet addresses (one per line or comma-separated):\n\nHXsKP7wrBWaQ8T2Vtjry3Nj3oUgwYcqq9vrHDM12G664\n2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S\n...'}
          style={{
            width: '100%',
            minHeight: 120,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 12,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            resize: 'vertical',
            outline: 'none'
          }}
        />
        <button
          onClick={lookup}
          disabled={loading || !input.trim()}
          style={{
            marginTop: 12,
            background: 'var(--sol-purple)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Looking up...' : 'Identify Wallets'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {results && !loading && (
        <div className="card">
          <div className="card-header">
            <h2>Results</h2>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {knownCount} identified out of {results.queried} queried
            </span>
          </div>

          {knownCount > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {results.identities.map((id, i) => (
                    <tr key={i}>
                      <td><AddressLink address={id.address} explorer /></td>
                      <td style={{ fontWeight: 600, color: 'var(--sol-green)' }}>{id.name}</td>
                      <td className="dim">{id.type || '—'}</td>
                      <td>
                        <StatusBadge type={getCategoryBadgeType(id.category)} label={id.category || '—'} />
                      </td>
                      <td className="dim" style={{ fontSize: 11 }}>{id.tags?.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: 20, textAlign: 'center' }}>
              None of the queried addresses are in the known entity database.
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="card" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          <p style={{ marginBottom: 8 }}>The batch identity endpoint identifies known wallets including:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {['Centralized Exchange', 'DeFi', 'Market Maker', 'Bridge', 'Validator', 'NFT', 'DAO', 'Oracle', 'Treasury'].map(cat => (
              <span key={cat} className="badge badge-purple">{cat}</span>
            ))}
          </div>
          <p style={{ marginTop: 12 }}>5100+ tagged accounts and 1900+ programs in the identity database.</p>
        </div>
      )}
    </div>
  );
}
