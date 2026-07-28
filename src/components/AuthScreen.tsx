import { useState } from "react";

import { LockKeyhole, Mail } from "lucide-react";

type AuthMode = "signIn" | "signUp";

interface AuthScreenProps {
  onSubmit: (email: string, password: string, mode: AuthMode) => Promise<void>;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export function AuthScreen({ onSubmit, loading, error, message }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password, mode);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/20">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-(--color-primary)">Private habit tracking</p>
            <h1 className="text-3xl font-semibold tracking-tight text-card-foreground">
              Sign in to your habits
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Use Supabase auth to keep each user&apos;s habits isolated by their own account.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`h-10 rounded-full text-sm font-medium transition-colors ${
                mode === "signIn"
                  ? "bg-(--color-primary) text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={`h-10 rounded-full text-sm font-medium transition-colors ${
                mode === "signUp"
                  ? "bg-(--color-primary) text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
              <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 focus-within:border-(--color-primary)">
                <Mail size={16} className="text-muted-foreground" aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </span>
              <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 focus-within:border-(--color-primary)">
                <LockKeyhole size={16} className="text-muted-foreground" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting || loading}
              className="h-11 w-full rounded-md bg-(--color-primary) font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {submitting || loading
                ? "Working..."
                : mode === "signIn"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          {(error || message) && (
            <div
              className={`mt-4 rounded-md border p-3 text-sm ${
                error
                  ? "border-destructive/40 bg-destructive/10 text-foreground"
                  : "border-border bg-muted text-card-foreground"
              }`}
            >
              {error ?? message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
