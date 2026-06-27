import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Calendar, MapPin, Pencil, Trash2, Plus, Clock, Upload } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = 'dqugla5lk';
const CLOUDINARY_UPLOAD_PRESET = 'epicenter';

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
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });
  const { user, token } = useAuth();

  const fetchActivities = () => {
    apiFetch('/api/activities')
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });
    const json = await res.json();
    setForm((prev) => ({ ...prev, imageUrl: json.secure_url }));
    setUploading(false);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => { resetForm(); setShowForm(true); };

  const startEdit = (activity) => {
    setForm({
      title: activity.title,
      description: activity.description || '',
      startDate: toDatetimeLocal(activity.startDate),
      endDate: toDatetimeLocal(activity.endDate),
      location: activity.location || '',
      imageUrl: activity.imageUrl || '',
    });
    setEditingId(activity.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };
    if (editingId) {
      await apiFetch(`/api/activities/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/api/activities', {
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
    await apiFetch(`/api/activities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500 animate-pulse">Chargement des activités...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Planning des activités</h1>
            <p className="text-slate-600 mt-2">Retrouvez toutes les activités du club.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={showForm ? resetForm : startCreate}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow"
            >
              <Plus size={18} />
              {showForm ? 'Annuler' : 'Nouvelle activité'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Modifier l'activité" : 'Créer une activité'}
            </h2>
            <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3" />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-slate-300 rounded-xl p-3" />
            <input name="location" placeholder="Lieu" value={form.location} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3" />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Image (optionnel)</label>
              <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition">
                <Upload size={16} />
                <span className="text-sm">{uploading ? 'Upload en cours...' : 'Choisir une image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
              {form.imageUrl && (
                <div className="relative w-fit">
                  <img src={form.imageUrl} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Début</label>
                <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Fin</label>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3" />
              </div>
            </div>

            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition">
              {editingId ? 'Enregistrer' : "Créer l'activité"}
            </button>
          </form>
        )}

        {activities.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <Calendar size={40} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">Aucune activité programmée.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <article key={activity.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                <div className="p-5 flex justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {activity.imageUrl && (
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{activity.title}</h2>
                      {activity.description && <p className="mt-1 text-slate-600">{activity.description}</p>}
                      <div className="mt-3 space-y-1 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{new Date(activity.startDate).toLocaleString('fr-FR')}</span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button onClick={() => startEdit(activity)} className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                        <Pencil size={16} /> Modifier
                      </button>
                      <button onClick={() => handleDelete(activity.id)} className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Planning;