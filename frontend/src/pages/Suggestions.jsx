import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Plus, CheckCircle, Eye, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300', icon: Clock },
  SEEN: { label: 'Vue', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', icon: Eye },
  DONE: { label: 'Traitée', color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300', icon: CheckCircle },
};

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [filter, setFilter] = useState('ALL');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchSuggestions = () => {
    apiFetch('/api/suggestions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setSuggestions(data); setLoading(false); });
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchSuggestions();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiFetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm({ title: '', content: '' });
    setShowForm(false);
    fetchSuggestions();
  };

  const handleLike = async (id) => {
    await apiFetch(`/api/suggestions/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSuggestions();
  };

  const handleStatus = async (id, status) => {
    await apiFetch(`/api/suggestions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchSuggestions();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette suggestion ?')) return;
    await apiFetch(`/api/suggestions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSuggestions();
  };

  const hasLiked = (suggestion) => suggestion.likes.some((l) => l.userId === user?.id);

  const filtered = suggestions.filter((s) => filter === 'ALL' || s.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Suggestions</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Partagez vos idées et retours.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition shadow w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            {showForm ? 'Annuler' : 'Nouvelle suggestion'}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Votre suggestion</h2>
            <input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
            />
            <textarea
              placeholder="Décrivez votre idée ou retour..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={4}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition">
              Envoyer
            </button>
          </form>
        )}

        {/* Filtres — admins seulement */}
        {user?.role === 'ADMIN' && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {['ALL', 'PENDING', 'SEEN', 'DONE'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                  filter === s
                    ? 'bg-slate-900 dark:bg-slate-600 text-white border-transparent'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {s === 'ALL' ? 'Toutes' : STATUS_CONFIG[s].label}
                <span className="ml-1.5 text-xs opacity-70">
                  {s === 'ALL' ? suggestions.length : suggestions.filter((x) => x.status === s).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow">
            <p className="text-slate-500 dark:text-slate-400">Aucune suggestion pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => {
              const liked = hasLiked(s);
              const StatusIcon = STATUS_CONFIG[s.status]?.icon ?? Clock;
              return (
                <article key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">

                      {/* Titre + badge statut */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h2>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[s.status]?.color}`}>
                          <StatusIcon size={10} />
                          {STATUS_CONFIG[s.status]?.label}
                        </span>
                      </div>

                      {/* Contenu */}
                      <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap mb-3">{s.content}</p>

                      {/* Auteur + date */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {s.createdBy.name[0].toUpperCase()}
                          </div>
                          <span>{s.createdBy.name}</span>
                        </div>
                        <span>·</span>
                        <span>{new Date(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Like */}
                    <button
                      onClick={() => handleLike(s.id)}
                      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition shrink-0 ${
                        liked
                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                      }`}
                    >
                      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                      <span className="text-xs font-medium">{s.likes.length}</span>
                    </button>
                  </div>

                  {/* Actions admin */}
                  {user?.role === 'ADMIN' && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                      {['PENDING', 'SEEN', 'DONE'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatus(s.id, status)}
                          disabled={s.status === status}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            s.status === status
                              ? STATUS_CONFIG[status].color + ' opacity-60 cursor-default'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {STATUS_CONFIG[status].label}
                        </button>
                      ))}
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Suggestions;