import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const describedBy = [helperText ? `${inputId}-helper` : null, error ? `${inputId}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {helperText ? <small id={`${inputId}-helper`}>{helperText}</small> : null}
      {error ? (
        <small id={`${inputId}-error`} role="alert">
          {error}
        </small>
      ) : null}
    </label>
  );
}
