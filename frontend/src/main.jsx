import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './auth/msalConfig';
import { AuthProvider } from './context/AuthContext';

const msalInstance = new PublicClientApplication(msalConfig);

async function startApp() {
  await msalInstance.initialize();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalProvider>
    </React.StrictMode>
  );
}

startApp();