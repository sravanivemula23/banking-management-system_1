import { ChevronLeft, ChevronRight } from 'lucide-react';

/** `page` is 0-based, matching the Spring Data pagination used by the backend. */
export default function Pagination({ page, totalPages, totalElements, onChange }) {
  if (!totalPages || totalPages <= 0) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
      <span>
        Page {page + 1} of {totalPages}
        {totalElements != null && <> &middot; {totalElements} total</>}
      </span>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary px-3 py-1.5" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          className="btn-secondary px-3 py-1.5"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
