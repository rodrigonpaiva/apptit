import { Button, Card, Input } from "@apptit/ui";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Card
          title="Welcome back"
          description="Sign in to your Apptit workspace"
        >
          <form
            action="/api/auth/login"
            method="post"
            className="grid gap-4"
          >
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-neutral-900 underline">
              Sign up
            </a>
          </p>
        </Card>
      </div>
    </main>
  );
}
