import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WalletProfile from './pages/WalletProfile';
import Balances from './pages/Balances';
import History from './pages/History';
import Transfers from './pages/Transfers';
import FundingSource from './pages/FundingSource';
import BatchLookup from './pages/BatchLookup';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>SOL TRACKER</h1>
            <div className="sub">Helius Wallet API</div>
          </div>
          <nav>
            <NavLink to="/" end><span className="icon">◈</span> Dashboard</NavLink>
            <NavLink to="/profile"><span className="icon">◉</span> Wallet Profile</NavLink>
            <NavLink to="/balances"><span className="icon">◧</span> Balances</NavLink>
            <NavLink to="/history"><span className="icon">◷</span> History</NavLink>
            <NavLink to="/transfers"><span className="icon">⇌</span> Transfers</NavLink>
            <NavLink to="/funding"><span className="icon">◎</span> Funding Source</NavLink>
            <NavLink to="/batch"><span className="icon">▦</span> Batch Lookup</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<WalletProfile />} />
            <Route path="/profile/:address" element={<WalletProfile />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/balances/:address" element={<Balances />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:address" element={<History />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/transfers/:address" element={<Transfers />} />
            <Route path="/funding" element={<FundingSource />} />
            <Route path="/funding/:address" element={<FundingSource />} />
            <Route path="/batch" element={<BatchLookup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
