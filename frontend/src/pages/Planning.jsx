import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function toDatetimeLocal(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

function Planning() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '' });
  const { user, token } = useAuth();

  const fetchActivities = () => {
    fetch('http://localhost:3000/api/activities')
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ title: '', description: '', startDate: '', endDate: '', location: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (activity) => {
    setForm({
      title: activity.title,
      description: activity.description || '',
      startDate: toDatetimeLocal(activity.startDate),
      endDate: toDatetimeLocal(activity.endDate),
      location: activity.location || '',
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };

    if (editingId) {
      await fetch(`http://localhost:3000/api/activities/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...payload, createdById: user.id }),
      });
    }

    resetForm();
    fetchActivities();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette activité ?')) return;
    await fetch(`http://localhost:3000/api/activities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchActivities();
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Planning des activités</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={showForm ? resetForm : startCreate} className="bg-slate-800 text-white px-3 py-1.5 rounded">
            {showForm ? 'Annuler' : '+ Nouvelle activité'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2 border rounded p-4 max-w-md">
          <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="border rounded p-2 w-full" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border rounded p-2 w-full" />
          <input name="location" placeholder="Lieu" value={form.location} onChange={handleChange} className="border rounded p-2 w-full" />
          <label className="block text-sm">Début</label>
          <input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required className="border rounded p-2 w-full" />
          <label className="block text-sm">Fin</label>
          <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required className="border rounded p-2 w-full" />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
            {editingId ? 'Enregistrer' : 'Créer'}
          </button>
        </form>
      )}

      {activities.length === 0 ? (
        <p>Aucune activité pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{activity.title}</h2>
                  <p className="text-sm text-gray-600">{new Date(activity.startDate).toLocaleString('fr-FR')}</p>
                  {activity.location && <p className="text-sm">{activity.location}</p>}
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2 text-sm shrink-0 ml-2">
                    <button onClick={() => startEdit(activity)} className="text-blue-600 underline">Modifier</button>
                    <button onClick={() => handleDelete(activity.id)} className="text-red-600 underline">Supprimer</button>
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

export default Planning;