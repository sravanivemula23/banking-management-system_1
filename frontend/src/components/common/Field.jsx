import { forwardRef, useId } from 'react';

/** Label + input + error message. `right` renders an element inside the input (e.g. password toggle). */
export const Input = forwardRef(function Input({ label, error, hint, right, className = '', ...props }, ref) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`input ${error ? 'input-error' : ''} ${right ? 'pr-11' : ''}`}
          {...props}
        />
        {right && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{right}</div>}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
});

export function Select({ label, error, hint, children, className = '', ...props }) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <select id={id} aria-invalid={Boolean(error)} className={`input ${error ? 'input-error' : ''}`} {...props}>
        {children}
      </select>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}
