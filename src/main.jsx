import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthContext, { AuthProvider } from './context/AuthContext'
import { cleanLegacyStorage, initializeStorage } from './services/storageService'

// Clean all previous non-bookstack project data on app initialization
cleanLegacyStorage();
initializeStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

export { AuthContext, AuthProvider }
