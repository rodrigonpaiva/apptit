import * as React from "react";

type PageShellProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {(title || actions) && (
        <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white/70 px-6 py-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {title ? (
                <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
          </div>
        </header>
      )}
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
