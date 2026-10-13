"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GamePlayer from "@/components/GamePlayer";
import {
  generateDailyChallenge,
  computeScore,
  makeShareText,
  type Session,
  type ScoreResult,
} from "@/lib/game";

const STORAGE_KEY = "redline_daily_v1";

type Saved = { dateStr: string; result: ScoreResult };

function AlreadyDoneScreen({ saved, total }: { saved: Saved; total: number }) {
  const [copied, setCopied] = useState(false);
  const { result, dateStr } = saved;
  const pct = Math.round((result.correct / total) * 100);

  function copy() {
    const text = makeShareText(result, total, dateStr);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-ember font-plate text-xs tracking-widest mb-2">DESAFIO DIÁRIO</div>
        <div className="text-zinc-400 text-sm mb-1">{dateStr}</div>
        <h2 className="font-plate text-4xl text-white mb-2">JÁ CONCLUÍDO HOJE</h2>
        <p className="text-zinc-500 text-sm mb-8">Volte amanhã para um novo desafio.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-well border border-smoke p-4">
            <div className="text-zinc-500 text-[10px] tracking-widest mb-1">ACERTOS</div>
            <div className="font-plate text-4xl text-white">
              {result.correct}
              <span className="text-zinc-500 text-2xl">/{total}</span>
            </div>
          </div>
          <div className="bg-well border border-smoke p-4">
            <div className="text-zinc-500 text-[10px] tracking-widest mb-1">PONTUAÇÃO</div>
            <div className="font-plate text-4xl text-ember">{result.total}</div>
          </div>
          <div className="bg-well border border-smoke p-4">
            <div className="text-zinc-500 text-[10px] tracking-widest mb-1">ACURÁCIA</div>
            <div className="font-plate text-4xl text-white">{pct}%</div>
          </div>
          <div className="bg-well border border-smoke p-4">
            <div className="text-zinc-500 text-[10px] tracking-widest mb-1">MELHOR COMBO</div>
            <div className="font-plate text-4xl text-white">{result.bestCombo}{result.bestCombo >= 3 && <span className="text-ember"> 🔥</span>}</div>
          </div>
        </div>

        <div className="flex gap-1 mb-8">
          {result.breakdown.map((b, i) => (
            <div key={i} className={`h-2 flex-1 rounded-sm ${b.pts > 0 ? "bg-ember" : "bg-smoke"}`} />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={copy}
            className="flex-1 bg-ember hover:bg-ember-dark text-white font-plate py-3 text-sm tracking-widest transition-colors"
          >
            {copied ? "COPIADO!" : "COMPARTILHAR"}
          </button>
          <Link
            href="/"
            className="flex-1 border border-smoke hover:border-ember text-white font-plate py-3 text-sm tracking-widest text-center transition-colors"
          >
            INÍCIO
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DailyPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = generateDailyChallenge();
    setSession(s);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Saved;
        if (parsed.dateStr === s.dateStr) {
          setSaved(parsed);
        }
      }
    } catch {
      // localStorage unavailable or corrupt — just play
    }
    setReady(true);
  }, []);

  function handleDone(result: ScoreResult) {
    const data: Saved = { dateStr: session?.dateStr ?? "", result };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // non-fatal
    }
    setSaved(data);
  }

  if (!ready || !session) return null;
  if (saved) return <AlreadyDoneScreen saved={saved} total={session.questions.length} />;

  return (
    <GamePlayer session={session} title="DESAFIO DIÁRIO" onDone={handleDone} />
  );
}
