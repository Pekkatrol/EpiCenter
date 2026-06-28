import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Calendar, MapPin, Pencil, Trash2, Plus, Clock, Upload, X, List, ChevronLeft, ChevronRight } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = 'dqugla5lk';
const CLOUDINARY_UPLOAD_PRESET = 'epicenter';

function toDatetimeLocal(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

function getRelativeLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { label: "Aujourd'hui", color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' };
  if (diff === 1) return { label: 'Demain', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' };
  if (diff > 1 && diff <= 7) return { label: `Dans ${diff} jours`, color: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300' };
  if (diff < 0) return { label: 'Passée', color: 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400' };
  return { label: new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }), color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };
}

function CalendarView({ activities, onEdit, onDelete, onLightbox, user, now }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

  const getActivitiesForDay = (day) => {
    if (!day) return [];
    return activities.filter((a) => {
      const start = new Date(a.startDate);
      return start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate();
    });
  };

  const isToday = (day) => {
    if (!day) return false;
    const t = new Date();
    return day.getDate() === t.getDate() && day.getMonth() === t.getMonth() && day.getFullYear() === t.getFullYear();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayActivities = getActivitiesForDay(day);
          return (
            <div
              key={i}
              className={`min-h-[72px] rounded-xl p-1 ${
                day ? 'bg-slate-50 dark:bg-slate-700/50' : ''
              } ${isToday(day) ? 'ring-2 ring-blue-500' : ''}`}
            >
              {day && (
                <>
                  <p className={`text-xs font-medium text-center mb-1 ${
                    isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayActivities.map((a) => (
                      <div
                        key={a.id}
                        className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 truncate cursor-pointer hover:bg-blue-600 transition"
                        title={a.title}
                      >
                        {a.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Planning() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });
  const { user, token } = useAuth();

  const fetchActivities = () => {
    apiFetch('/api/activities')
      .then((res) => res.json())
      .then((data) => { setActivities(data); setLoading(false); });
  };

  useEffect(() => { fetchActivities(); }, []);

  const now = new Date();
  const filteredActivities = activities
    .filter((a) => showPast || new Date(a.endDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
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
    const payload = { ...form, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() };
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
    await apiFetch(`/api/activities/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Chargement des activités...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition" onClick={() => setLightboxUrl(null)}>
            <X size={24} />
          </button>
          <img src={lightboxUrl} alt="Aperçu" className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Planning des activités</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {filteredActivities.length} activité{filteredActivities.length !== 1 ? 's' : ''} à venir
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle vue liste / calendrier */}
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  view === 'list' ? 'bg-slate-900 dark:bg-slate-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <List size={15} /> Liste
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  view === 'calendar' ? 'bg-slate-900 dark:bg-slate-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Calendar size={15} /> Calendrier
              </button>
            </div>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setShowPast((p) => !p)}
                className={`px-4 py-2 rounded-xl text-sm transition border ${
                  showPast
                    ? 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-700 dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {showPast ? 'Masquer les passées' : 'Voir les passées'}
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button
                onClick={showForm ? resetForm : startCreate}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition shadow"
              >
                <Plus size={18} />
                {showForm ? 'Annuler' : 'Nouvelle activité'}
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? "Modifier l'activité" : 'Créer une activité'}
            </h2>
            <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
            <input name="location" placeholder="Lieu" value={form.location} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image (optionnel)</label>
              <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
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
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Date et heure de début</label>
                <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Date et heure de fin</label>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
              </div>
            </div>

            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition">
              {editingId ? 'Enregistrer' : "Créer l'activité"}
            </button>
          </form>
        )}

        {/* VUE CALENDRIER */}
        {view === 'calendar' && (
          <CalendarView
            activities={activities}
            onEdit={startEdit}
            onDelete={handleDelete}
            onLightbox={setLightboxUrl}
            user={user}
            now={now}
          />
        )}

        {/* VUE LISTE */}
        {view === 'list' && (
          <>
            {filteredActivities.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow">
                <Calendar size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  {showPast ? 'Aucune activité.' : 'Aucune activité à venir.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredActivities.map((activity) => {
                  const isPast = new Date(activity.endDate) < now;
                  const { label, color } = getRelativeLabel(activity.startDate);
                  return (
                    <article key={activity.id} className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition ${isPast ? 'opacity-60' : ''}`}>
                      <div className="p-5 flex justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          {activity.imageUrl && (
                            <img
                              src={activity.imageUrl}
                              alt={activity.title}
                              className="w-16 h-16 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition"
                              onClick={() => setLightboxUrl(activity.imageUrl)}
                              title="Cliquer pour agrandir"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{activity.title}</h2>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                                {label}
                              </span>
                            </div>
                            {activity.description && <p className="mt-1 text-slate-600 dark:text-slate-400">{activity.description}</p>}
                            <div className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
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
                            <button onClick={() => startEdit(activity)} className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
                              <Pencil size={16} /> Modifier
                            </button>
                            <button onClick={() => handleDelete(activity.id)} className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition">
                              <Trash2 size={16} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Planning;