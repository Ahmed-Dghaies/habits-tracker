import { useMemo } from "react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

const Header = ({ user, onSignOut }: { user: User; onSignOut: () => Promise<void> }) => {
  const userInitials = useMemo(() => {
    const username = user.email?.split("@")[0] || user.id;
    const initials = username
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2);

    return (initials || username.slice(0, 2)).toUpperCase();
  }, [user.email, user.id]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
      </div>
      <div className="flex items-center gap-2">
        <div
          aria-label={`Signed in as ${user.email ?? user.id}`}
          title={user.email ?? user.id}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-card-foreground"
        >
          {userInitials}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => void onSignOut()}
          aria-label="Sign out"
          title="Sign out"
          className="h-9 w-9 rounded-md border border-border text-card-foreground hover:bg-muted"
        >
          <LogOut size={18} aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
