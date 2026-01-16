import * as React from "react";

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white/80 p-6 backdrop-blur lg:block">
        {sidebar}
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="border-b border-neutral-200 bg-white/70 px-4 py-3 backdrop-blur lg:hidden">
          {sidebar}
        </div>
        {children}
      </div>
    </div>
  );
}
