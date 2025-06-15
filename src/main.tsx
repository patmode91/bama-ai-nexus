
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import mobile components for global availability
import MobileNavigation from '@/components/mobile/MobileNavigation'

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
    <MobileNavigation />
  </StrictMode>
);
