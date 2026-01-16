import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
};

export function Card({ title, description, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur ${className}`}
      {...props}
    >
      {title ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
