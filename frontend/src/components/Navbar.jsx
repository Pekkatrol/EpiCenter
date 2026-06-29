import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { instance } = useMsal();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    instance.logoutRedirect({ onRedirectNavigate: () => false });
  };

  const twitchUrl = 'https://www.twitch.tv/epitechnice';
  const githubUrl = 'https://github.com/Pekkatrol/EpiCenter';

  const navLinks = [
    { to: '/planning', label: 'Planning' },
    { to: '/memos', label: 'Memos' },
    { to: '/polls', label: 'Sondages' },
    { to: '/suggestions', label: 'Suggestions' },
  ];

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">

        <Link to="/" className="mr-4 flex items-center gap-2 text-white" onClick={closeMenu}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
            E
          </div>
          <span className="font-bold">EpiCenter</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive(to) ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
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

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="GitHub"
          >
            <GithubIcon />
          </a>

          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="hidden md:block mx-1 h-5 w-px bg-slate-700" />

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <span className="text-xs font-medium text-slate-300">
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
              className="hidden md:flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <User size={14} />
              Connexion
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900 px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeMenu}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(to) ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="my-2 h-px bg-slate-700" />

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <GithubIcon />
            GitHub
          </a>

          <a
            href={twitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition"
          >
            <TwitchIcon />
            Twitch
          </a>

          <div className="my-2 h-px bg-slate-700" />

          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  {user.role === 'ADMIN' && (
                    <p className="text-xs text-indigo-400">Administrateur</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); closeMenu(); }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900 transition"
              >
                <LogOut size={15} />
                Deconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <User size={15} />
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;