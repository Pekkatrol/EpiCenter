import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

function toDatetimeLocal(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

import {
  FileText,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Shield,
  Users,
} from "lucide-react";

function Memos() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', meetingDate: '', content: '', visibility: 'ADMIN_ONLY' });
  const { user, token } = useAuth();

  const fetchMemos = () => {
    apiFetch('/api/memos', {
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
      await apiFetch(`/api/memos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/api/memos', {
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
    await apiFetch(`/api/memos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMemos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500 animate-pulse">
          Chargement des activités...
        </p>
      </div>
    );
  }

  return ( <div className="min-h-screen bg-slate-100"> <div className="max-w-6xl mx-auto p-6"> <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8"> <div> <h1 className="text-4xl font-bold text-slate-900"> Comptes-rendus de réunion </h1> <p className="text-slate-600 mt-2"> Historique des réunions et décisions. </p> </div> {user?.role === "ADMIN" && ( <button onClick={showForm ? resetForm : startCreate} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow" > <Plus size={18} /> {showForm ? "Annuler" : "Nouveau mémo"} </button> )} </div> {showForm && ( <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4" > <h2 className="text-xl font-semibold"> {editingId ? "Modifier le compte-rendu" : "Créer un compte-rendu"} </h2> <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3" /> <div> <label className="block mb-1 text-sm font-medium"> Date de la réunion </label> <input name="meetingDate" type="datetime-local" value={form.meetingDate} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3" /> </div> <textarea name="content" placeholder="Contenu du compte-rendu" value={form.content} onChange={handleChange} required rows={8} className="w-full border border-slate-300 rounded-xl p-3" /> <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3" > <option value="ADMIN_ONLY"> Réservé au bureau </option> <option value="PUBLIC"> Visible par tous les membres </option> </select> <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition" > {editingId ? "Enregistrer" : "Créer"} </button> </form> )} {memos.length === 0 ? ( <div className="bg-white rounded-2xl p-10 text-center shadow"> <FileText size={40} className="mx-auto text-slate-400 mb-3" /> <p className="text-slate-500"> Aucun compte-rendu disponible. </p> </div> ) : ( <div className="grid gap-5"> {memos.map((memo) => ( <article key={memo.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition" > <div className="flex justify-between gap-4"> <div className="flex-1"> <div className="flex flex-wrap items-center gap-3 mb-3"> <h2 className="text-xl font-semibold text-slate-900"> {memo.title} </h2> {memo.visibility === "PUBLIC" ? ( <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"> <Users size={12} /> Public </span> ) : ( <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"> <Shield size={12} /> Bureau </span> )} </div> <div className="flex items-center gap-2 text-sm text-slate-500 mb-4"> <Calendar size={16} /> <span> {new Date( memo.meetingDate ).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", })} </span> </div> <div className="prose prose-slate max-w-none"> <p className="whitespace-pre-wrap text-slate-700"> {memo.content} </p> </div> </div> {user?.role === "ADMIN" && ( <div className="flex flex-col sm:flex-row gap-2"> <button onClick={() => startEdit(memo)} className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition" > <Pencil size={16} /> Modifier </button> <button onClick={() => handleDelete(memo.id)} className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition" > <Trash2 size={16} /> Supprimer </button> </div> )} </div> </article> ))} </div> )} </div> </div> );
}

export default Memos;