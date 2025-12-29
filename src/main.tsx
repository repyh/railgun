import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/electron-setup'; // Patch Electron API
import App from '@/App.tsx'

import { AppLoader } from '@/components/system/AppLoader';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppLoader>
      <App />
    </AppLoader>
  </StrictMode>,
)
