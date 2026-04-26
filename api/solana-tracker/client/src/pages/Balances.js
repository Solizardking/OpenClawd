import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SearchBar, formatUsd } from '../components/Shared';

export default function Balances() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showNfts, setShowNfts] = useState(false);

  const load = useCallback(async (addr, pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.wallet.balances(addr, {
        page: pg,
        limit: 100,
        showNfts: showNfts && pg === 1 ? 'true' : 'false'
      });
      setData(result);
      setPage(pg);
    } catch (e) {
      setError(e.error || 'Failed to load balances');
    }
    setLoading(false);
  }, [showNfts]);

  useEffect(() => {
    if (paramAddr) load(paramAddr, 1);
  }, [paramAddr, load]);

  return (
    <div>
      <h1 className="page-title">Token Balances</h1>
      <p className="page-subtitle">All SPL tokens sorted by USD value</p>

      <SearchBar onSearch={(addr) => navigate(`/balances/${addr}`)} loading={loading} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={showNfts} onChange={(e) => setShowNfts(e.target.checked)} />
          Include NFTs
        </label>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading && <div className="loading">Loading balances...</div>}

      {data && !loading && (
        <>
          <div className="card">
            <div className="card-header">
              <h2>Holdings (Page {data.pagination?.page || page})</h2>
              <span className="mono green" style={{ fontSize: 18, fontWeight: 700 }}>
                {formatUsd(data.totalUsdValue)}
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <th>Mint</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                    <th>Program</th>
                  </tr>
                </thead>
                <tbody>
                  {data.balances?.map((t, i) => (
                    <tr key={i}>
                      <td className="dim">{(page - 1) * 100 + i + 1}</td>
                      <td>
                        <div className="token-row">
                          {t.logoUri && <img className="token-logo" src={t.logoUri} alt="" onError={(e) => e.target.style.display = 'none'} />}
                          <div className="token-info">
                            <div className="symbol">{t.symbol || '???'}</div>
                            <div className="name">{t.name || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono addr" title={t.mint}>{t.mint?.slice(0, 6)}...{t.mint?.slice(-4)}</td>
                      <td className="mono" style={{ textAlign: 'right' }}>
                        {Number(t.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="mono dim" style={{ textAlign: 'right' }}>{t.pricePerToken ? formatUsd(t.pricePerToken) : '—'}</td>
                      <td className="mono" style={{ textAlign: 'right', color: t.usdValue ? 'var(--sol-green)' : 'var(--text-dim)' }}>
                        {formatUsd(t.usdValue)}
                      </td>
                      <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{t.tokenProgram || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination?.hasMore && (
              <button className="load-more" onClick={() => load(paramAddr, page + 1)}>
                Load Page {page + 1} →
              </button>
            )}
            {page > 1 && (
              <button className="load-more" onClick={() => load(paramAddr, page - 1)} style={{ marginTop: 6 }}>
                ← Page {page - 1}
              </button>
            )}
          </div>

          {/* NFTs section */}
          {data.nfts?.length > 0 && (
            <div className="card">
              <div className="card-header"><h2>NFTs ({data.nfts.length})</h2></div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Collection</th>
                      <th>Mint</th>
                      <th>Compressed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.nfts.map((nft, i) => (
                      <tr key={i}>
                        <td>
                          {nft.imageUri && (
                            <img src={nft.imageUri} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }}
                              onError={(e) => e.target.style.display = 'none'} />
                          )}
                        </td>
                        <td>{nft.name || 'Unnamed'}</td>
                        <td className="dim">{nft.collectionName || '—'}</td>
                        <td className="mono addr" title={nft.mint}>{nft.mint?.slice(0, 6)}...{nft.mint?.slice(-4)}</td>
                        <td>{nft.compressed ? <span className="green">Yes</span> : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="icon">◧</div>
          <p>Enter a wallet address to view token balances.</p>
        </div>
      )}
    </div>
  );
}
