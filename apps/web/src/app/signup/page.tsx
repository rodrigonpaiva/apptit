import { Button, Card, Input } from "@apptit/ui";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Card
          title="Create Account"
          description="Sign up for your Apptit workspace"
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <form
            action="/api/auth/signup"
            method="post"
            className="grid gap-4"
          >
            <Input
              label="Name"
              name="name"
              type="text"
              autoComplete="name"
              required
            />
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
              autoComplete="new-password"
              required
            />
            <Input
              label="Organization Name"
              name="orgName"
              type="text"
              placeholder="My Company"
              required
            />
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <a href="/login" className="text-neutral-900 underline">
              Sign in
            </a>
          </p>
        </Card>
      </div>
    </main>
  );
}
