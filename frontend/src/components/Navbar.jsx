import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { instance } = useMsal();
  const { dark, toggle } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    instance.logoutRedirect({ onRedirectNavigate: () => false });
  };

  const twitchUrl = 'https://www.twitch.tv/epitechnice';

  const navLinks = [
    { to: '/planning', label: 'Planning' },
    { to: '/memos', label: 'Memos' },
    { to: '/polls', label: 'Sondages' },
  ];

  const isActive = (path) => location.pathname === path;
  const activeClass = 'bg-slate-700 text-white';
  const inactiveClass = 'text-slate-400 hover:bg-slate-800 hover:text-white';

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">

        <Link to="/" className="mr-4 flex items-center gap-2 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
            E
          </div>
          <span className="hidden font-bold sm:block">EpiCenter</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive(to) ? activeClass : inactiveClass}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">

          <a
            href={twitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-400 transition hover:bg-slate-800 hover:text-purple-300"
            title="Notre Twitch"
          >
            <TwitchIcon />
          </a>

          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="mx-1 h-5 w-px bg-slate-700" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <span className="hidden text-xs font-medium text-slate-300 sm:block">
                  {user.name}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold text-indigo-300 bg-indigo-900">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-900 hover:text-red-400"
                title="Deconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <User size={14} />
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;