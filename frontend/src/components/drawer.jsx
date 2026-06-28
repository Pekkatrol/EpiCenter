import { Calendar, Clock, MapPin, X } from 'lucide-react';

function formatDateTime(value) {
  if (!value) return 'Date indisponible';
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Drawer({ open, activity, onClose, onEdit, onDelete }) {
  if (!open || !activity) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le panneau de détails"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:rounded-l-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Détails de l'activité
            </p>
            <h2 className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-white">
              {activity.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Créée le {formatDateTime(activity.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activity.imageUrl && (
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="mb-6 h-56 w-full rounded-3xl object-cover"
            />
          )}

          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Période</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Du {formatDateTime(activity.startDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Au {formatDateTime(activity.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {activity.location && (
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Lieu</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activity.location}</p>
                  </div>
                </div>
              </div>
            )}

            {activity.description && (
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Description</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(activity)}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}