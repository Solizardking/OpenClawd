import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SearchBar, AddressLink, formatUsd, timeAgo } from '../components/Shared';

export default function Transfers() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate();
  const [allTransfers, setAllTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasData, setHasData] = useState(false);

  const load = useCallback(async (addr, before = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (before) params.before = before;
      const result = await api.wallet.transfers(addr, params);

      const transfers = result.transfers || result || [];

      if (before) {
        setAllTransfers(prev => [...prev, ...transfers]);
      } else {
        setAllTransfers(transfers);
      }

      if (transfers.length > 0) {
        const last = transfers[transfers.length - 1];
        setCursor(last.signature || last.txHash || null);
      } else {
        setCursor(null);
      }

      setHasData(true);
    } catch (e) {
      setError(e.error || 'Failed to load transfers');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (paramAddr) {
      setAllTransfers([]);
      setCursor(null);
      setHasData(false);
      load(paramAddr);
    }
  }, [paramAddr, load]);

  return (
    <div>
      <h1 className="page-title">Token Transfers</h1>
      <p className="page-subtitle">All incoming and outgoing token transfers</p>

      <SearchBar onSearch={(addr) => navigate(`/transfers/${addr}`)} loading={loading} />

      {error && <div className="error-msg">{error}</div>}
      {loading && allTransfers.length === 0 && <div className="loading">Loading transfers...</div>}

      {allTransfers.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Transfers ({allTransfers.length})</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Direction</th>
                  <th>Token</th>
                  <th>Amount</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Time</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {allTransfers.map((t, i) => {
                  const isIncoming = t.to?.toLowerCase() === paramAddr?.toLowerCase() ||
                    t.toUserAccount?.toLowerCase() === paramAddr?.toLowerCase();
                  const from = t.from || t.fromUserAccount || '';
                  const to = t.to || t.toUserAccount || '';
                  const sig = t.signature || t.txHash || '';

                  return (
                    <tr key={sig + i}>
                      <td>
                        {isIncoming
                          ? <span className="badge badge-green">IN</span>
                          : <span className="badge badge-red">OUT</span>
                        }
                      </td>
                      <td>
                        <div className="token-info">
                          <div className="symbol">{t.symbol || t.tokenSymbol || '???'}</div>
                          <div className="name" style={{ fontSize: 10 }}>{t.tokenName || ''}</div>
                        </div>
                      </td>
                      <td className="mono" style={{ color: isIncoming ? 'var(--sol-green)' : 'var(--red)' }}>
                        {isIncoming ? '+' : '-'}{Number(t.amount || t.tokenAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td><AddressLink address={from} explorer /></td>
                      <td><AddressLink address={to} explorer /></td>
                      <td className="mono dim" style={{ fontSize: 11 }}>{timeAgo(t.timestamp || t.blockTime)}</td>
                      <td>
                        <a href={`https://orbmarkets.io/tx/${sig}?tab=summary`}
                          target="_blank" rel="noopener noreferrer"
                          className="mono" style={{ color: 'var(--sol-purple)', textDecoration: 'none', fontSize: 11 }}>
                          {sig.slice(0, 6)}...
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cursor && (
            <button className="load-more" disabled={loading} onClick={() => load(paramAddr, cursor)}>
              {loading ? 'Loading...' : 'Load More →'}
            </button>
          )}
        </div>
      )}

      {hasData && allTransfers.length === 0 && !loading && (
        <div className="empty-state">
          <div className="icon">⇌</div>
          <p>No transfers found for this wallet.</p>
        </div>
      )}

      {!hasData && !loading && !error && (
        <div className="empty-state">
          <div className="icon">⇌</div>
          <p>Enter a wallet address to view token transfers.</p>
        </div>
      )}
    </div>
  );
}
