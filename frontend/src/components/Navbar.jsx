import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMsal } from '@azure/msal-react';

function Navbar() {
  const { user, logout } = useAuth();
  const { instance } = useMsal();

  const handleLogout = () => {
    logout();
    instance.logoutRedirect({ onRedirectNavigate: () => false });
  };

  return (
    <nav className="flex gap-4 p-4 bg-slate-800 text-white items-center">
      <Link to="/">Home</Link>
      <Link to="/planning">Planning</Link>
      <Link to="/memos">Mémos</Link>
      {user ? (
        <div className="ml-auto flex gap-3 items-center">
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="underline">Déconnexion</button>
        </div>
      ) : (
        <Link to="/login" className="ml-auto">Connexion</Link>
      )}
    </nav>
  );
}

export default Navbar;