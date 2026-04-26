import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SearchBar, AddressLink, StatusBadge, formatUsd, formatSol, getCategoryBadgeType, timeAgo } from '../components/Shared';

export default function WalletProfile() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState(paramAddr || '');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.tracking.profile(addr);
      setProfile(data);
      setAddress(addr);
    } catch (e) {
      setError(e.error || 'Failed to load wallet profile');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (paramAddr) load(paramAddr);
  }, [paramAddr, load]);

  const handleSearch = (addr) => {
    navigate(`/profile/${addr}`);
  };

  const identity = profile?.identity;
  const balances = profile?.balances;
  const funding = profile?.fundedBy;

  return (
    <div>
      <h1 className="page-title">Wallet Profile</h1>
      <p className="page-subtitle">Complete wallet overview — identity, balances, funding source</p>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && <div className="error-msg">{error}</div>}
      {loading && <div className="loading">Loading wallet profile...</div>}

      {profile && !loading && (
        <>
          {/* Identity */}
          <div className="card">
            <div className="card-header">
              <h2>Identity</h2>
              {identity && <StatusBadge type={getCategoryBadgeType(identity.category)} label={identity.category} />}
            </div>
            {identity ? (
              <div>
                <div className="stat-row">
                  <span className="stat-label">Name</span>
                  <span className="stat-value green">{identity.name}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Type</span>
                  <span className="stat-value">{identity.type}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Category</span>
                  <span className="stat-value">{identity.category}</span>
                </div>
                {identity.tags?.length > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">Tags</span>
                    <span className="stat-value">{identity.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                No identity data — this wallet is not in the known entity database.
              </div>
            )}
            <div className="stat-row" style={{ marginTop: 8 }}>
              <span className="stat-label">Address</span>
              <AddressLink address={address} label={address} explorer />
            </div>
          </div>

          {/* Balances Summary */}
          <div className="card">
            <div className="card-header">
              <h2>Portfolio</h2>
              {balances?.totalUsdValue != null && (
                <span className="mono green" style={{ fontSize: 16, fontWeight: 700 }}>
                  {formatUsd(balances.totalUsdValue)}
                </span>
              )}
            </div>
            {balances?.balances?.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th style={{ textAlign: 'right' }}>Balance</th>
                      <th style={{ textAlign: 'right' }}>USD Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.balances.slice(0, 15).map((t, i) => (
                      <tr key={i}>
                        <td>
                          <div className="token-row">
                            {t.logoUri && <img className="token-logo" src={t.logoUri} alt="" onError={(e) => e.target.style.display = 'none'} />}
                            <div className="token-info">
                              <div className="symbol">{t.symbol || '???'}</div>
                              <div className="name">{t.name || t.mint?.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="mono" style={{ textAlign: 'right' }}>{Number(t.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                        <td className="mono" style={{ textAlign: 'right', color: t.usdValue ? 'var(--sol-green)' : 'var(--text-dim)' }}>
                          {formatUsd(t.usdValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {balances.balances.length > 15 && (
                  <button className="load-more" onClick={() => navigate(`/balances/${address}`)}>
                    View all {balances.balances.length}+ tokens →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No token balances found.</div>
            )}
          </div>

          {/* NFTs */}
          {balances?.nfts?.length > 0 && (
            <div className="card">
              <div className="card-header"><h2>NFTs ({balances.nfts.length})</h2></div>
              <div className="card-grid">
                {balances.nfts.slice(0, 8).map((nft, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                    {nft.imageUri && (
                      <img src={nft.imageUri} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: 'var(--bg-hover)' }}
                        onError={(e) => e.target.style.display = 'none'} />
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{nft.name || 'Unnamed'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{nft.collectionName || 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funding Source */}
          <div className="card">
            <div className="card-header"><h2>Funding Source</h2></div>
            {funding ? (
              <div>
                <div className="stat-row">
                  <span className="stat-label">Funder</span>
                  <span className="stat-value">
                    {funding.funderName ? (
                      <span className="green">{funding.funderName}</span>
                    ) : (
                      <AddressLink address={funding.funder} explorer />
                    )}
                  </span>
                </div>
                {funding.funderType && (
                  <div className="stat-row">
                    <span className="stat-label">Type</span>
                    <StatusBadge type={getCategoryBadgeType(funding.funderType)} label={funding.funderType} />
                  </div>
                )}
                <div className="stat-row">
                  <span className="stat-label">Initial Amount</span>
                  <span className="stat-value green">{funding.amount} {funding.symbol}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Date</span>
                  <span className="stat-value">{new Date(funding.date || funding.timestamp * 1000).toLocaleDateString()} ({timeAgo(funding.timestamp)})</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Transaction</span>
                  <a href={funding.explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="mono" style={{ fontSize: 12, color: 'var(--sol-purple)', textDecoration: 'none' }}>
                    View on Orb →
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No funding transaction found for this wallet.</div>
            )}
          </div>

          {/* Quick Links */}
          <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="load-more" style={{ flex: 1, minWidth: 150 }} onClick={() => navigate(`/balances/${address}`)}>View Full Balances</button>
            <button className="load-more" style={{ flex: 1, minWidth: 150 }} onClick={() => navigate(`/history/${address}`)}>View History</button>
            <button className="load-more" style={{ flex: 1, minWidth: 150 }} onClick={() => navigate(`/transfers/${address}`)}>View Transfers</button>
          </div>
        </>
      )}

      {!profile && !loading && !error && (
        <div className="empty-state">
          <div className="icon">◉</div>
          <p>Enter a Solana wallet address to see its full profile.</p>
        </div>
      )}
    </div>
  );
}
