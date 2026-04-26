import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SearchBar, AddressLink, timeAgo } from '../components/Shared';

export default function History() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [allTxs, setAllTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);

  const load = useCallback(async (addr, before = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (before) params.before = before;
      const result = await api.wallet.history(addr, params);

      if (before) {
        setAllTxs(prev => [...prev, ...(result.transactions || result || [])]);
      } else {
        const txs = result.transactions || result || [];
        setAllTxs(txs);
      }

      // Handle pagination cursor
      const txList = result.transactions || result || [];
      if (txList.length > 0) {
        const last = txList[txList.length - 1];
        setCursor(last.signature || last.txHash || null);
      } else {
        setCursor(null);
      }

      setData(result);
    } catch (e) {
      setError(e.error || 'Failed to load history');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (paramAddr) {
      setAllTxs([]);
      setCursor(null);
      load(paramAddr);
    }
  }, [paramAddr, load]);

  return (
    <div>
      <h1 className="page-title">Transaction History</h1>
      <p className="page-subtitle">Complete transaction history with balance changes</p>

      <SearchBar onSearch={(addr) => navigate(`/history/${addr}`)} loading={loading} />

      {error && <div className="error-msg">{error}</div>}
      {loading && allTxs.length === 0 && <div className="loading">Loading history...</div>}

      {allTxs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Transactions ({allTxs.length})</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Signature</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allTxs.map((tx, i) => {
                  const sig = tx.signature || tx.txHash || '';
                  const desc = tx.description || tx.type || '—';
                  const ts = tx.timestamp || tx.blockTime;
                  const failed = tx.transactionError || tx.err;

                  return (
                    <tr key={sig + i}>
                      <td>
                        <a href={`https://orbmarkets.io/tx/${sig}?tab=summary`}
                          target="_blank" rel="noopener noreferrer"
                          className="mono" style={{ color: 'var(--sol-purple)', textDecoration: 'none', fontSize: 12 }}>
                          {sig.slice(0, 8)}...{sig.slice(-6)}
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-purple">{tx.type || '—'}</span>
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {desc}
                      </td>
                      <td className="mono dim" style={{ fontSize: 12 }}>{timeAgo(ts)}</td>
                      <td>
                        {failed
                          ? <span className="badge badge-red">Failed</span>
                          : <span className="badge badge-green">Success</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cursor && (
            <button
              className="load-more"
              disabled={loading}
              onClick={() => load(paramAddr, cursor)}
            >
              {loading ? 'Loading...' : 'Load More →'}
            </button>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="icon">◷</div>
          <p>Enter a wallet address to view transaction history.</p>
        </div>
      )}
    </div>
  );
}
