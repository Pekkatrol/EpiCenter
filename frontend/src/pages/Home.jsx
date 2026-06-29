import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Calendar, FileText, LogIn, Users, Plus, Pencil, Trash2, Upload, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLOUDINARY_CLOUD_NAME = 'dqugla5lk';
const CLOUDINARY_UPLOAD_PRESET = 'epicenter';

function Home() {
  const { user, token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', link: '' });

  const fetchBanners = () => {
    apiFetch('/api/banners')
      .then((res) => res.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchBanners(); }, []);

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
    setForm({ title: '', description: '', imageUrl: '', link: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (banner) => {
    setForm({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      link: banner.link || '',
    });
    setEditingId(banner.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await apiFetch(`/api/banners/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
    } else {
      await apiFetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    fetchBanners();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette bannière ?')) return;
    await apiFetch(`/api/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchBanners();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        {/* Hero */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-8 sm:p-10 text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Bienvenue sur EpiCenter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            Gestion des activités, comptes-rendus et organisation du BDE
          </p>
          {!user && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
          )}
        </div>

        {/* Bannières */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">À la une</h2>
            {user?.role === 'ADMIN' && (
              <button
                onClick={showForm ? resetForm : () => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition text-sm"
              >
                <Plus size={16} />
                {showForm ? 'Annuler' : 'Ajouter une bannière'}
              </button>
            )}
          </div>

          {/* Formulaire bannière */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Modifier la bannière' : 'Nouvelle bannière'}
              </h3>
              <input
                name="title"
                placeholder="Titre"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
              />
              <textarea
                name="description"
                placeholder="Description (optionnel)"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
              />
              <input
                name="link"
                placeholder="Lien (optionnel, ex: /planning ou https://...)"
                value={form.link}
                onChange={handleChange}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image (optionnel)</label>
                <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <Upload size={16} />
                  <span className="text-sm">{uploading ? 'Upload en cours...' : 'Choisir une image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                {form.imageUrl && (
                  <div className="relative w-fit">
                    <img src={form.imageUrl} alt="preview" className="h-24 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition">
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </form>
          )}

          {/* Grille bannières */}
          {banners.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow">
              <p className="text-slate-500 dark:text-slate-400">Aucune bannière pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => {
                const isExternal = banner.link && banner.link.startsWith('http');
                const CardWrapper = ({ children }) => banner.link ? (
                  isExternal ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block group">
                      {children}
                    </a>
                  ) : (
                    <Link to={banner.link} className="block group">
                      {children}
                    </Link>
                  )
                ) : (
                  <div className="block">{children}</div>
                );

                return (
                  <div key={banner.id} className="relative">
                    <CardWrapper>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                        {banner.imageUrl && (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{banner.title}</h3>
                            {banner.link && <ExternalLink size={14} className="text-slate-400 shrink-0" />}
                          </div>
                          {banner.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{banner.description}</p>
                          )}
                        </div>
                      </div>
                    </CardWrapper>

                    {/* Actions admin */}
                    {user?.role === 'ADMIN' && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => startEdit(banner)}
                          className="flex items-center justify-center w-7 h-7 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg shadow hover:bg-blue-50 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="flex items-center justify-center w-7 h-7 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 rounded-lg shadow hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link to="/planning" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">
            <Calendar className="text-slate-700 dark:text-slate-300 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Planning</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Consultez et gérez les activités à venir</p>
          </Link>
          <Link to="/memos" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">
            <FileText className="text-slate-700 dark:text-slate-300 mb-3" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Comptes-rendus</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Historique des réunions et décisions</p>
          </Link>
          {!user ? (
            <Link to="/login" className="bg-slate-900 dark:bg-slate-700 text-white rounded-2xl shadow-md p-6 hover:bg-slate-800 transition">
              <LogIn className="mb-3" />
              <h2 className="text-xl font-semibold">Connexion</h2>
              <p className="text-sm text-slate-300 mt-2">Accéder à votre espace</p>
            </Link>
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