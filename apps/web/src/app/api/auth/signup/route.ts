import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authSignupEndpoint =
  process.env.AUTH_SIGNUP_ENDPOINT ??
  process.env.NEXT_PUBLIC_AUTH_SIGNUP_ENDPOINT ??
  "http://localhost:4001/api/auth/sign-up/email";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const orgName = formData.get("orgName");

  if (!name || !email || !password || !orgName) {
    return NextResponse.redirect(
      new URL("/signup?error=All+fields+are+required", request.url)
    );
  }

  try {
    // Step 1: Create user via better-auth
    const signupResponse = await fetch(authSignupEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: String(name),
        email: String(email),
        password: String(password),
      }),
    });

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      let errorMessage = "Failed to create account";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Use default message
      }
      return NextResponse.redirect(
        new URL(`/signup?error=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    // Get cookies from signup response
    const setCookie = signupResponse.headers.get("set-cookie");

    // Step 2: Create organization for the user
    const orgEndpoint = "http://localhost:4001/api/auth/organization/create";
    const orgResponse = await fetch(orgEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(setCookie ? { cookie: setCookie.split(";")[0] } : {}),
      },
      body: JSON.stringify({
        name: String(orgName),
        slug: String(orgName).toLowerCase().replace(/\s+/g, "-"),
      }),
    });

    // Redirect to dashboard
    const response = NextResponse.redirect(
      new URL("/app/dashboard", request.url)
    );

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
