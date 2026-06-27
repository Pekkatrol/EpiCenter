import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, LogIn, Users } from 'lucide-react';

function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Bienvenue sur votre espace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            Gestion des activités, comptes-rendus et organisation du club
          </p>
          {!user && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <a href="/planning" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">
            <Calendar className="text-slate-700 dark:text-slate-300 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Planning</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Consultez et gérez les activités à venir</p>
          </a>
          <a href="/memos" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">
            <FileText className="text-slate-700 dark:text-slate-300 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Comptes-rendus</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Historique des réunions et décisions</p>
          </a>
          {!user ? (
            <a href="/login" className="bg-slate-900 dark:bg-slate-700 text-white rounded-2xl shadow-md p-6 hover:bg-slate-800 dark:hover:bg-slate-600 transition">
              <LogIn className="mb-3" />
              <h2 className="text-xl font-semibold">Connexion</h2>
              <p className="text-sm text-slate-300 mt-2">Accéder à votre espace</p>
            </a>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <Users className="text-slate-700 dark:text-slate-300 mb-3" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Espace membre</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Connecté en tant que {user.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;