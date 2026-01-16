import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <label className="grid gap-2 text-sm text-neutral-700" htmlFor={inputId}>
        {label ? <span className="font-medium">{label}</span> : null}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 ${className}`}
          {...props}
        />
        {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
      </label>
    );
  }
);

Input.displayName = "Input";
