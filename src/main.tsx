
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

// Ensure React is properly loaded before initializing
if (typeof React === 'undefined' || !React.useState) {
  console.error('React is not properly loaded');
  throw new Error('React is not properly loaded');
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

try {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering without StrictMode
  root.render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
