import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function FormField({ label, hint, required, className = '', ...rest }: InputProps) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden>*</span>}
      </label>
      <input id={id} required={required} {...rest} />
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function TextareaField({ label, required, className = '', ...rest }: TextareaProps) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden>*</span>}
      </label>
      <textarea id={id} required={required} {...rest} />
    </div>
  );
}
