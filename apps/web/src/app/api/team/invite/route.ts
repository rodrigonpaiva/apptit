import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { inviteMember } from "@apptit/api";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email");
  const role = formData.get("role");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!role || typeof role !== "string") {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie") ?? undefined;
  const headers = cookieHeader ? { cookie: cookieHeader } : undefined;

  try {
    await inviteMember({ email, role: [role], organizationId: null }, headers);
    return NextResponse.redirect(new URL("/app/team/invite?success=true", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send invite";
    return NextResponse.redirect(
      new URL(`/app/team/invite?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
