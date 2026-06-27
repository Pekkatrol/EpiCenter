import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  );
}

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
      <Link to="/" className="font-bold text-lg">EpiCenter</Link>
      <Link to="/planning" className="hover:text-slate-300">Planning</Link>
      <Link to="/memos" className="hover:text-slate-300">Memos</Link>

      <div className="ml-auto flex items-center gap-3">
        <a href={twitchUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">
          <TwitchIcon />
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