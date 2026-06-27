import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Twitch } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const { instance } = useMsal();
  const { dark, toggle } = useTheme();

  const handleLogout = () => {
    logout();
    instance.logoutRedirect({ onRedirectNavigate: () => false });
  };

  const twitchUrl = 'https://www.twitch.tv/epitechnice';

  return (
    <nav className="flex gap-4 p-4 bg-slate-800 dark:bg-slate-950 text-white items-center">
      <Link to="/" className="font-bold text-lg">Home</Link>
      <Link to="/planning" className="hover:text-slate-300">Planning</Link>
      <Link to="/memos" className="hover:text-slate-300">Memos</Link>

      <div className="ml-auto flex items-center gap-3">
        <a href={twitchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition">
          <Twitch size={20} />
        </a>

        <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-700 transition">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex gap-3 items-center">
            <span className="text-sm">{user.name} ({user.role})</span>
            <button onClick={handleLogout} className="underline text-sm">Deconnexion</button>
          </div>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;