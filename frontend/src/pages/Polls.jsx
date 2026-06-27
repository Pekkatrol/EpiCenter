import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Plus, Trash2, X, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchPolls = () => {
    apiFetch('/api/polls', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setPolls(data); setLoading(false); });
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const filtered = options.filter((o) => o.trim() !== '');
    if (filtered.length < 2) return;
    await apiFetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question, options: filtered }),
    });
    setQuestion('');
    setOptions(['', '']);
    setShowForm(false);
    fetchPolls();
  };

  const handleVote = async (pollId, optionId) => {
    const res = await apiFetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ optionId }),
    });
    if (res.ok) fetchPolls();
  };

  const handleClose = async (pollId) => {
    await apiFetch(`/api/polls/${pollId}/close`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPolls();
  };

  const handleDelete = async (pollId) => {
    if (!confirm('Supprimer ce sondage ?')) return;
    await apiFetch(`/api/polls/${pollId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPolls();
  };

  const hasVoted = (poll) => poll.votes.some((v) => v.userId === user?.id);
  const totalVotes = (poll) => poll.votes.length;
  const optionVotes = (option) => option.votes.length;
  const optionPercent = (poll, option) => {
    const total = totalVotes(poll);
    if (total === 0) return 0;
    return Math.round((optionVotes(option) / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Chargement des sondages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Sondages</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Votez et donnez votre avis.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition shadow"
            >
              <Plus size={18} />
              {showForm ? 'Annuler' : 'Nouveau sondage'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Créer un sondage</h2>
            <input
              placeholder="Question (ex: Qui veut des pizzas ?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                    className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-500 hover:text-red-700">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                + Ajouter une option
              </button>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition">
              Créer le sondage
            </button>
          </form>
        )}

        {polls.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow">
            <p className="text-slate-500 dark:text-slate-400">Aucun sondage pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => {
              const voted = hasVoted(poll);
              const total = totalVotes(poll);
              return (
                <article key={poll.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{poll.question}</h2>
                      {poll.closed && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                          <Lock size={10} /> Fermé
                        </span>
                      )}
                    </div>
                    {user?.role === 'ADMIN' && (
                      <div className="flex gap-2 shrink-0">
                        {!poll.closed && (
                          <button onClick={() => handleClose(poll.id)} className="text-xs px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition">
                            Fermer
                          </button>
                        )}
                        <button onClick={() => handleDelete(poll.id)} className="p-1.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{total} vote{total !== 1 ? 's' : ''}</p>

                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percent = optionPercent(poll, option);
                      const votes = optionVotes(option);
                      return (
                        <div key={option.id}>
                          {voted || poll.closed ? (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-700 dark:text-slate-300">{option.text}</span>
                                <span className="text-slate-500 dark:text-slate-400">{votes} ({percent}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                <div
                                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleVote(poll.id, option.id)}
                              className="w-full text-left px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-400 transition text-slate-700 dark:text-slate-300"
                            >
                              {option.text}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {voted && !poll.closed && (
                    <p className="mt-3 flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={14} /> Vous avez voté
                    </p>
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

export default Polls;