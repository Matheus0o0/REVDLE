"use client";

import { useState, useEffect } from "react";
import GamePlayer from "@/components/GamePlayer";
import { generateAspirationSession, type Session } from "@/lib/game";

export default function AspirationPage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(generateAspirationSession());
  }, []);

  if (!session) return null;
  return <GamePlayer session={session} title="ASPIRADO OU TURBO?" />;
}
