"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GamePlayer from "@/components/GamePlayer";
import { generateChallengeForDate, dailyDateString, type Session } from "@/lib/game";

const STORAGE_PREFIX = "revdle_archive_v1_";
const DAYS_BACK = 30;

function pastDates(todayStr: string): string[] {
  const dates: string[] = [];
  const today = new Date(todayStr + "T12:00:00Z");
  for (let i = 1; i <= DAYS_BACK; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(y, m - 1, d));
}

function ArchiveList({ todayStr, onPlay }: { todayStr: string; onPlay: (dateStr: string) => void }) {
  const [played, setPlayed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const result: Record<string, boolean> = {};
    for (let i = 1; i <= DAYS_BACK; i++) {
      const d = new Date(todayStr + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      result[key] = !!localStorage.getItem(STORAGE_PREFIX + key);
    }
    setPlayed(result);
  }, [todayStr]);

  const dates = pastDates(todayStr);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/" className="text-muted hover:text-white text-sm transition-colors">←</Link>
        <span className="font-plate text-lg font-black uppercase tracking-widest text-white">Desafios anteriores</span>
        <span className="font-mono text-muted text-xs">{DAYS_BACK}d</span>
      </header>

      <div className="flex-1 flex flex-col items-center py-4 px-4">
        <div className="w-full max-w-sm flex flex-col gap-2">
          {dates.map((date) => {
            const done = played[date];
            return (
              <button
                key={date}
                onClick={() => onPlay(date)}
                className={`w-full flex items-center justify-between px-5 py-4 border-2 transition-all duration-150 text-left
                  ${done
                    ? "border-accent/40 bg-accent/5 hover:bg-accent/10"
                    : "border-border bg-surface hover:border-accent"
                  }`}
              >
                <div>
                  <div className="font-plate text-white text-base font-black uppercase">{formatDate(date)}</div>
                  <div className="text-muted text-xs font-sans mt-0.5">1 rodada · distrator aleatório</div>
                </div>
                {done
                  ? <span className="text-accent font-mono text-xs font-bold">✓ FEITO</span>
                  : <span className="text-muted font-mono text-xs">JOGAR →</span>
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [todayStr, setTodayStr] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setTodayStr(dailyDateString());
  }, []);

  function handlePlay(dateStr: string) {
    setSession(generateChallengeForDate(dateStr, "archive"));
  }

  function handleDone() {
    if (session?.dateStr) {
      localStorage.setItem(STORAGE_PREFIX + session.dateStr, "1");
    }
    setSession(null);
  }

  if (!todayStr) return null;
  if (session) return <GamePlayer session={session} title="DESAFIOS ANTERIORES" onDone={handleDone} />;
  return <ArchiveList todayStr={todayStr} onPlay={handlePlay} />;
}
