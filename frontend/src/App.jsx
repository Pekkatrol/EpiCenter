import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Planning from './pages/Planning';
import Memos from './pages/Memos';
import Login from './pages/Login';

import { useAuth } from './context/AuthContext';
import { loginRequest } from './auth/msalConfig';
import { apiFetch } from './api/client';

function AuthSync() {
  const { instance, accounts } = useMsal();
  const isMsalAuthenticated = useIsAuthenticated();
  const { token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncBackend() {
      if (isMsalAuthenticated && accounts.length > 0 && !token) {
        const response = await instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] });
        const res = await apiFetch('/api/auth/microsoft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: response.idToken }),
        });
        const data = await res.json();
        if (res.ok) {
          login(data.token, data.user);
          navigate('/');
        }
      }
    }
    syncBackend();
  }, [isMsalAuthenticated, accounts, token]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <Navbar />
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/memos" element={<Memos />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;