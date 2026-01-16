import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@apptit/api";
import { SidebarLayout } from "@apptit/ui";
import { AppSidebar } from "./Sidebar";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await headers()).get("cookie") ?? undefined;
  const me = await getMe(
    cookieHeader ? { cookie: cookieHeader } : undefined
  );

  if (!me) {
    redirect("/login");
  }

  return (
    <SidebarLayout sidebar={<AppSidebar user={me} />}>
      {children}
    </SidebarLayout>
  );
}
