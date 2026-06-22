import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function toDatetimeLocal(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

function Memos() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', meetingDate: '', content: '', visibility: 'ADMIN_ONLY' });
  const { user, token } = useAuth();

  const fetchMemos = () => {
    fetch('http://localhost:3000/api/memos', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setMemos(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMemos();
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ title: '', meetingDate: '', content: '', visibility: 'ADMIN_ONLY' });
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (memo) => {
    setForm({
      title: memo.title,
      meetingDate: toDatetimeLocal(memo.meetingDate),
      content: memo.content,
      visibility: memo.visibility,
    });
    setEditingId(memo.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, meetingDate: new Date(form.meetingDate).toISOString() };

    if (editingId) {
      await fetch(`http://localhost:3000/api/memos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('http://localhost:3000/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...payload, createdById: user.id }),
      });
    }

    resetForm();
    fetchMemos();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce mémo ?')) return;
    await fetch(`http://localhost:3000/api/memos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMemos();
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Comptes-rendus de réunion</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={showForm ? resetForm : startCreate} className="bg-slate-800 text-white px-3 py-1.5 rounded">
            {showForm ? 'Annuler' : '+ Nouveau mémo'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2 border rounded p-4 max-w-md">
          <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="border rounded p-2 w-full" />
          <label className="block text-sm">Date de la réunion</label>
          <input name="meetingDate" type="datetime-local" value={form.meetingDate} onChange={handleChange} required className="border rounded p-2 w-full" />
          <textarea name="content" placeholder="Contenu du compte-rendu" value={form.content} onChange={handleChange} required rows={5} className="border rounded p-2 w-full" />
          <select name="visibility" value={form.visibility} onChange={handleChange} className="border rounded p-2 w-full">
            <option value="ADMIN_ONLY">Réservé au bureau</option>
            <option value="PUBLIC">Visible par tous les membres</option>
          </select>
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
            {editingId ? 'Enregistrer' : 'Créer'}
          </button>
        </form>
      )}

      {memos.length === 0 ? (
        <p>Aucun mémo pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {memos.map((memo) => (
            <li key={memo.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{memo.title}</h2>
                  <p className="text-sm text-gray-600">{new Date(memo.meetingDate).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm mt-1">{memo.content}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2 text-sm shrink-0 ml-2">
                    <button onClick={() => startEdit(memo)} className="text-blue-600 underline">Modifier</button>
                    <button onClick={() => handleDelete(memo.id)} className="text-red-600 underline">Supprimer</button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Memos;