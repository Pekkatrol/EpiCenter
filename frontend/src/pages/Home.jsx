import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, LogIn, Users } from 'lucide-react';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-4xl">

        {/* HERO */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-10 text-center mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Bienvenue sur votre espace
          </h1>

          <p className="text-slate-600 mt-3">
            Gestion des activités, comptes-rendus et organisation du club
          </p>

          {!user && (
            <p className="mt-4 text-sm text-slate-500">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
          )}

        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Planning */}
          <a
            href="/planning"
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
          >
            <Calendar className="text-slate-700 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900">
              Planning
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Consultez et gérez les activités à venir
            </p>
          </a>

          {/* Memos */}
          <a
            href="/memos"
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
          >
            <FileText className="text-slate-700 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900">
              Comptes-rendus
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Historique des réunions et décisions
            </p>
          </a>

          {/* Login / Users */}
          {!user ? (
            <a
              href="/login"
              className="bg-slate-900 text-white rounded-2xl shadow-md p-6 hover:bg-slate-800 transition"
            >
              <LogIn className="mb-3" />
              <h2 className="text-xl font-semibold">
                Connexion
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                Accéder à votre espace
              </p>
            </a>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <Users className="text-slate-700 mb-3" />
              <h2 className="text-xl font-semibold text-slate-900">
                Espace membre
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Connecté en tant que {user.role}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Home;