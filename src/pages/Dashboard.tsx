import { useState } from "react";

import { Plus } from "lucide-react";

import { AddHabitModal } from "@/components/AddHabit";
import HabitsList from "@/components/HabitsList";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";

import type { User } from "@supabase/supabase-js";

interface DashboardProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const { addHabit } = useHabits(user.id);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Header user={user} onSignOut={onSignOut} />
      <HabitsList user={user} openAddHabitModal={() => setModalOpen(true)} />

      <Button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Add habit"
        size="icon"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 h-14 w-14 rounded-full bg-(--color-primary) text-primary-foreground shadow-lg shadow-black/40 transition-transform active:scale-90 sm:right-[max(1.25rem,calc(50vw-20rem+1.25rem))]"
      >
        <Plus size={26} aria-hidden="true" />
      </Button>

      <AddHabitModal
        key={modalOpen ? "open" : "closed"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        createAction={addHabit}
      />
    </div>
  );
}
