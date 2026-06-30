import { X, ExternalLink } from 'lucide-react';

export default function BannerDrawer({ open, banner, onClose, onEdit, onDelete }) {
  if (!open || !banner) return null;

  const isExternal = banner.link && banner.link.startsWith('http');

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le panneau de details"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:rounded-l-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-400">
              Banniere
            </p>
            <h2 className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-white">
              {banner.title}
            </h2>
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
          {banner.imageUrl && (
            <div className="mb-6 w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-auto object-contain max-h-[70vh] mx-auto"
              />
            </div>
          )}

          {banner.description && (
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <p className="whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                {banner.description}
              </p>
            </div>
          )}

          {banner.link && (
            <div className="mt-4">
              {isExternal ? (
                <a
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  <ExternalLink size={14} />
                  Ouvrir le lien
                </a>
              ) : (
                <a
                  href={banner.link}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Voir la page
                </a>
              )}
            </div>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(banner)}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Modifier
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(banner.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}