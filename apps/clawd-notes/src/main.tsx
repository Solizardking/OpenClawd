import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { App } from './App';
import './styles.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

function Root() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const convex = useMemo(() => (convexUrl ? new ConvexReactClient(convexUrl) : null), []);

  if (convex) {
    return (
      <ConvexProvider client={convex}>
        <App backend="convex" selectedId={selectedId} setSelectedId={setSelectedId} />
      </ConvexProvider>
    );
  }

  return <App backend="local" selectedId={selectedId} setSelectedId={setSelectedId} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
