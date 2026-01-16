import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authLoginEndpoint =
  process.env.AUTH_LOGIN_ENDPOINT ??
  process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT;

export async function POST(request: NextRequest) {
  if (!authLoginEndpoint) {
    return NextResponse.json(
      { error: "AUTH_LOGIN_ENDPOINT is not configured" },
      { status: 500 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "application/json";
  const body = await request.text();

  const upstream = await fetch(authLoginEndpoint, {
    method: "POST",
    headers: {
      "content-type": contentType
    },
    body
  });

  const responseBody = await upstream.text();

  if (upstream.ok) {
    const response = NextResponse.redirect(
      new URL("/app/dashboard", request.url)
    );
    const setCookie = upstream.headers.get("set-cookie");

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  }

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/plain"
    }
  });
}
