import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-neutral-800 focus-visible:ring-neutral-500",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 focus-visible:ring-neutral-300",
  ghost:
    "bg-transparent text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-300",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        variantClasses[variant]
      } ${className}`}
      {...props}
    />
  );
}
