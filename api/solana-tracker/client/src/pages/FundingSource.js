import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SearchBar, AddressLink, StatusBadge, getCategoryBadgeType, timeAgo } from '../components/Shared';

export default function FundingSource() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await api.wallet.fundedBy(addr);
      setData(result);
    } catch (e) {
      if (e.status === 404) {
        setNotFound(true);
      } else {
        setError(e.error || 'Failed to load funding source');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (paramAddr) load(paramAddr);
  }, [paramAddr, load]);

  const fundDate = data?.date ? new Date(data.date) : data?.timestamp ? new Date(data.timestamp * 1000) : null;
  const ageInDays = data?.timestamp ? Math.floor((Date.now() / 1000 - data.timestamp) / 86400) : null;

  return (
    <div>
      <h1 className="page-title">Funding Source</h1>
      <p className="page-subtitle">Discover who originally funded a wallet</p>

      <SearchBar onSearch={(addr) => navigate(`/funding/${addr}`)} loading={loading} />

      {error && <div className="error-msg">{error}</div>}
      {loading && <div className="loading">Tracing funding source...</div>}

      {notFound && !loading && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <p style={{ fontSize: 14 }}>No funding transaction found for this wallet.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              This wallet may have never received SOL, or was created via airdrop/program initialization.
            </p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="card">
            <div className="card-header">
              <h2>Funding Details</h2>
              {data.funderType && (
                <StatusBadge type={getCategoryBadgeType(data.funderType)} label={data.funderType} />
              )}
            </div>

            <div className="stat-row">
              <span className="stat-label">Wallet</span>
              <AddressLink address={paramAddr} label={paramAddr} explorer />
            </div>

            <div className="stat-row">
              <span className="stat-label">Funded By</span>
              <span className="stat-value">
                {data.funderName ? (
                  <span className="green" style={{ fontWeight: 600 }}>{data.funderName}</span>
                ) : (
                  <AddressLink address={data.funder} explorer />
                )}
              </span>
            </div>

            {data.funderType && (
              <div className="stat-row">
                <span className="stat-label">Funder Category</span>
                <span className="stat-value">{data.funderType}</span>
              </div>
            )}

            <div className="stat-row">
              <span className="stat-label">Initial Amount</span>
              <span className="stat-value green" style={{ fontWeight: 600 }}>
                {data.amount} {data.symbol}
              </span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Raw Amount (lamports)</span>
              <span className="stat-value mono">{data.amountRaw}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Date</span>
              <span className="stat-value">
                {fundDate?.toLocaleString()} ({timeAgo(data.timestamp)})
              </span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Wallet Age</span>
              <span className="stat-value">{ageInDays != null ? `${ageInDays} days` : '—'}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Slot</span>
              <span className="stat-value mono">{data.slot?.toLocaleString()}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Transaction</span>
              <a href={data.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="mono" style={{ fontSize: 12, color: 'var(--sol-purple)', textDecoration: 'none' }}>
                View on Orb →
              </a>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="card">
            <div className="card-header"><h2>Quick Risk Assessment</h2></div>
            {(() => {
              let score = 0;
              const factors = [];

              if (data.funderType === 'Centralized Exchange') {
                score = 20;
                factors.push({ text: `Funded by known exchange (${data.funderName})`, type: 'good' });
              } else if (!data.funderName) {
                score = 50;
                factors.push({ text: 'Funded by unknown wallet', type: 'neutral' });
              }

              if (data.funderType?.includes('Hack') || data.funderType?.includes('Scam') || data.funderType?.includes('Rug')) {
                score = 90;
                factors.push({ text: `Funded by flagged address (${data.funderType})`, type: 'bad' });
              }

              if (ageInDays != null && ageInDays < 7) {
                score += 20;
                factors.push({ text: 'Wallet is less than 7 days old', type: 'neutral' });
              }

              if (data.amount < 0.01) {
                score += 10;
                factors.push({ text: 'Very small initial funding amount', type: 'neutral' });
              }

              const level = score < 30 ? 'LOW' : score < 60 ? 'MEDIUM' : 'HIGH';
              const color = level === 'LOW' ? 'var(--sol-green)' : level === 'MEDIUM' ? 'var(--orange)' : 'var(--red)';

              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{score}</span>
                    <div>
                      <div style={{ fontWeight: 600, color }}>{level} RISK</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Score out of 100</div>
                    </div>
                  </div>
                  {factors.map((f, i) => (
                    <div key={i} style={{ padding: '4px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ marginRight: 8 }}>
                        {f.type === 'good' ? '✓' : f.type === 'bad' ? '✗' : '•'}
                      </span>
                      {f.text}
                    </div>
                  ))}
                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)' }}>
                    This is a simplified heuristic — not financial or compliance advice.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Look up the funder */}
          {data.funder && (
            <button className="load-more" onClick={() => navigate(`/profile/${data.funder}`)}>
              View Funder's Profile →
            </button>
          )}
        </>
      )}

      {!data && !notFound && !loading && !error && (
        <div className="empty-state">
          <div className="icon">◎</div>
          <p>Enter a wallet address to trace its funding source.</p>
        </div>
      )}
    </div>
  );
}
