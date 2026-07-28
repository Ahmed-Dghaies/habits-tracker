import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { Dashboard } from "@/pages/Dashboard";

import type { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(hasSupabaseConfig);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError(null);
      setAuthMessage(null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (email: string, password: string, mode: "signIn" | "signUp") => {
    if (!supabase) return;

    setAuthError(null);
    setAuthMessage(null);

    if (mode === "signIn") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        return;
      }

      setSession(data.session);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.session) {
      setSession(data.session);
      return;
    }

    setAuthMessage("Check your email to confirm your account, then sign in.");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!hasSupabaseConfig) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to use authentication.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {authLoading ? (
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading session...
          </div>
        </div>
      ) : session ? (
        <Dashboard
          userId={session.user.id}
          userEmail={session.user.email}
          onSignOut={handleSignOut}
        />
      ) : (
        <AuthScreen
          onSubmit={handleAuthSubmit}
          loading={authLoading}
          error={authError}
          message={authMessage}
        />
      )}
    </main>
  );
}
