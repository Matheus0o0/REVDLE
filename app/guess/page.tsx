"use client";

import { useState, useEffect } from "react";
import GamePlayer from "@/components/GamePlayer";
import { generateGuessSession, type Session } from "@/lib/game";

export default function GuessPage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(generateGuessSession());
  }, []);

  if (!session) return null;
  return <GamePlayer session={session} title="QUAL É O CARRO?" />;
}
