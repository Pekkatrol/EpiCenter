import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Calendar, FileText, LogIn, Users, Plus, Pencil, Trash2, Upload, MessageSquare, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import BannerDrawer from '../components/BannerDrawer';

const CLOUDINARY_CLOUD_NAME = 'dqugla5lk';
const CLOUDINARY_UPLOAD_PRESET = 'epicenter';

function Home() {
  const { user, token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [sideBanners, setSideBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', link: '', position: 'TOP' });

  const fetchBanners = () => {
    apiFetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setBanners(data.filter((b) => b.position !== 'SIDE'));
        setSideBanners(data.filter((b) => b.position === 'SIDE'));
      });
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
    setForm({ title: '', description: '', imageUrl: '', link: '', position: 'TOP' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (banner) => {
    setForm({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      link: banner.link || '',
      position: banner.position || 'TOP',
    });
    setEditingId(banner.id);
    setShowForm(true);
    setSelectedBanner(null);
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
    if (!confirm('Supprimer cette banniere ?')) return;
    await apiFetch(`/api/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedBanner(null);
    fetchBanners();
  };

  const dashboardLinks = [
    { to: '/planning', icon: Calendar, label: 'Planning', desc: 'Consultez et gerez les activites a venir' },
    { to: '/memos', icon: FileText, label: 'Comptes-rendus', desc: 'Historique des reunions et decisions' },
    { to: '/polls', icon: Vote, label: 'Sondages', desc: 'Votez et donnez votre avis' },
    { to: '/suggestions', icon: MessageSquare, label: 'Suggestions', desc: 'Partagez vos idees et retours' },
  ];

  const leftBanners = sideBanners.filter((_, i) => i % 2 === 0);
  const rightBanners = sideBanners.filter((_, i) => i % 2 === 1);

  const TallBanner = ({ banner }) => (
    <div className="relative h-full">
      <button
        type="button"
        onClick={() => setSelectedBanner(banner)}
        className="block h-full w-full text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group"
      >
        <div className="relative h-full w-full">
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-600 to-indigo-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-semibold text-white text-sm drop-shadow">{banner.title}</h3>
            {banner.description && (
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-2 drop-shadow">{banner.description}</p>
            )}
          </div>
        </div>
      </button>
      {user?.role === 'ADMIN' && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); startEdit(banner); }} className="w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 text-blue-600 rounded-lg shadow hover:bg-blue-50 transition">
            <Pencil size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(banner.id); }} className="w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 text-red-600 rounded-lg shadow hover:bg-red-50 transition">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );

  const SideColumn = ({ items, side }) => (
    <aside
      className={`hidden 2xl:flex flex-col gap-3 w-52 fixed top-20 bottom-4 ${side === 'left' ? 'left-4' : 'right-4'} z-10`}
    >
      {items.map((b) => (
        <div key={b.id} className="flex-1 min-h-0">
          <TallBanner banner={b} />
        </div>
      ))}
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <SideColumn items={leftBanners} side="left" />
      <SideColumn items={rightBanners} side="right" />

      <BannerDrawer
        open={Boolean(selectedBanner)}
        banner={selectedBanner}
        onClose={() => setSelectedBanner(null)}
        onEdit={user?.role === 'ADMIN' ? startEdit : undefined}
        onDelete={user?.role === 'ADMIN' ? handleDelete : undefined}
      />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-8 text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Bienvenue sur EpiCenter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            Gestion des activites, comptes-rendus et organisation du BDE
          </p>
          {!user && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour acceder a toutes les fonctionnalites
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">A la une</h2>
            {user?.role === 'ADMIN' && (
              <button
                onClick={showForm ? resetForm : () => setShowForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition text-sm"
              >
                <Plus size={14} />
                {showForm ? 'Annuler' : 'Ajouter'}
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-4 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Modifier la banniere' : 'Nouvelle banniere'}
              </h3>
              <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
              <textarea name="description" placeholder="Description (optionnel)" value={form.description} onChange={handleChange} rows={2} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />
              <input name="link" placeholder="Lien (optionnel, ex: /planning ou https://...)" value={form.link} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3" />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Position</label>
                <select name="position" value={form.position} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-3">
                  <option value="TOP">Au centre (grille)</option>
                  <option value="SIDE">Sur le flanc</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image (optionnel)</label>
                <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <Upload size={16} />
                  <span className="text-sm">{uploading ? 'Upload en cours...' : 'Choisir une image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                {form.imageUrl && (
                  <div className="relative w-fit">
                    <img src={form.imageUrl} alt="preview" className="h-20 rounded-xl object-cover" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">X</button>
                  </div>
                )}
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition">
                {editingId ? 'Enregistrer' : 'Creer'}
              </button>
            </form>
          )}

          {banners.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune banniere pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((banner) => {
                const isExternal = banner.link && banner.link.startsWith('http');
                return (
                  <div key={banner.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedBanner(banner)}
                      className="block w-full text-left bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                    >
                      {banner.imageUrl && (
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-36 object-cover" />
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{banner.description}</p>
                        )}
                      </div>
                    </button>
                    {user?.role === 'ADMIN' && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => startEdit(banner)} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 text-blue-600 rounded-lg shadow hover:bg-blue-50 transition">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(banner.id)} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 text-red-600 rounded-lg shadow hover:bg-red-50 transition">
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

        <div className="grid grid-cols-2 gap-4">
          {dashboardLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition">
              <Icon className="text-slate-700 dark:text-slate-300 mb-3" size={22} />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{label}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{desc}</p>
            </Link>
          ))}
          {!user ? (
            <Link to="/login" className="bg-slate-900 dark:bg-slate-700 text-white rounded-2xl shadow-md p-5 hover:bg-slate-800 transition">
              <LogIn className="mb-3" size={22} />
              <h2 className="text-base font-semibold">Connexion</h2>
              <p className="text-sm text-slate-300 mt-1">Acceder a votre espace</p>
            </Link>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <Users className="text-slate-700 dark:text-slate-300 mb-3" size={22} />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Espace membre</h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Connecte en tant que {user.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;