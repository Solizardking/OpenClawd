import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SearchBar({ onSearch, placeholder, loading, navigateTo }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const addr = value.trim();
    if (!addr) return;
    if (navigateTo) {
      navigate(`${navigateTo}/${addr}`);
    }
    if (onSearch) onSearch(addr);
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Enter Solana wallet address...'}
        spellCheck={false}
      />
      <button type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Loading...' : 'Search'}
      </button>
    </form>
  );
}

export function AddressLink({ address, label, explorer }) {
  if (!address) return <span className="dim">—</span>;
  const short = label || `${address.slice(0, 4)}...${address.slice(-4)}`;
  const url = explorer
    ? `https://orbmarkets.io/address/${address}`
    : `/profile/${address}`;

  return explorer ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="mono" style={{ color: 'var(--sol-purple)', textDecoration: 'none' }}>
      {short}
    </a>
  ) : (
    <span className="mono" style={{ color: 'var(--sol-purple)' }}>{short}</span>
  );
}

export function StatusBadge({ type, label }) {
  const colors = {
    exchange: 'badge-blue',
    defi: 'badge-purple',
    danger: 'badge-red',
    success: 'badge-green',
    warning: 'badge-orange',
    default: 'badge-purple'
  };
  return <span className={`badge ${colors[type] || colors.default}`}>{label}</span>;
}

export function formatUsd(val) {
  if (val == null) return '—';
  return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatSol(lamports) {
  if (lamports == null) return '—';
  return (lamports / 1e9).toFixed(4) + ' SOL';
}

export function timeAgo(ts) {
  if (!ts) return '—';
  const date = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function getCategoryBadgeType(category) {
  if (!category) return 'default';
  const c = category.toLowerCase();
  if (c.includes('exchange')) return 'exchange';
  if (c.includes('defi') || c.includes('swap')) return 'defi';
  if (c.includes('hack') || c.includes('scam') || c.includes('rug') || c.includes('exploit')) return 'danger';
  if (c.includes('bridge') || c.includes('oracle')) return 'warning';
  return 'default';
}
