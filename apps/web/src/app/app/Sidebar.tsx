"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/inventory", label: "Inventory" },
  { href: "/app/products", label: "Products" }
];

type UserSummary = {
  userId: string;
  tenantId: string;
  role: string;
};

type SidebarProps = {
  user: UserSummary;
};

export function AppSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Apptit
        </p>
        <h2 className="mt-2 text-lg font-semibold text-neutral-900">
          Workspace
        </h2>
        <p className="mt-2 text-xs text-neutral-500">
          Tenant {user.tenantId}
        </p>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-neutral-200 bg-white/70 p-4 text-xs text-neutral-600">
        <div className="font-semibold text-neutral-800">Session</div>
        <div className="mt-2 grid gap-1">
          <span>User {user.userId}</span>
          <span>Role {user.role}</span>
        </div>
      </div>
    </div>
  );
}
