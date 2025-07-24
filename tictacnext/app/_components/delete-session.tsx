"use client";
import { deleteGameSession } from "@/server/actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameSession } from "@/lib/types";

export default function DeleteSession({ session }: { session: GameSession }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    if (!session._id) {
      toast.error("Session ID is missing");
      setConfirming(false);
      return;
    }
    startTransition(async () => {
      const res = await deleteGameSession(session._id as string);
      if (res && "error" in res) {
        toast.error(res?.error || "Failed to delete session");
      }
      setConfirming(false);
    });
  };
  return (
    <Button
      variant="destructive"
      className="px-4 py-2 rounded-lg text-md font-medium transition-all duration-200 hover:scale-105 active:scale-95"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : confirming ? "Confirm?" : "Delete"}
    </Button>
  );
}
