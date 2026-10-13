"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "./AudioEngine";
import { carById, fullName, engineLabel, type Car } from "@/lib/cars";
import { asset } from "@/lib/assets";
import {
  type Session,
  type Question,
  type GuessQuestion,
  type AspirationQuestion,
  type ScoreResult,
  computeScore,
  makeShareText,
  POINTS_CORRECT,
} from "@/lib/game";

function comboMult(streak: number) {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

// ── Audio Button ──────────────────────────────────────────────────────────────

function AudioButton({ carId, sound }: { carId: string; sound: string }) {
  const audio = useAudio();
  const isPlaying = !!audio.playing[carId];
  const isLoading = !!audio.loading[carId];

  function toggle() {
    if (isPlaying) audio.stop(carId);
    else void audio.solo(carId, sound, { loop: false });
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={isPlaying ? "Parar" : "Ouvir som"}
      className={`flex items-center gap-4 px-8 py-4 border-2 transition-all duration-200
        disabled:opacity-40 active:scale-[0.98]
        ${isPlaying
          ? "bg-accent border-accent"
          : "bg-surface border-border hover:border-accent"
        }`}
    >
      {/* icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
        ${isPlaying ? "bg-white/20" : "bg-raised"}`}>
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-muted ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>

      <div className="text-left">
        <div className={`font-plate text-lg font-black uppercase tracking-wide leading-none
          ${isPlaying ? "text-white" : "text-white"}`}>
          {isLoading ? "Carregando…" : isPlaying ? "Tocando…" : "Ouvir o som"}
        </div>
        <div className={`text-xs font-sans mt-0.5 ${isPlaying ? "text-white/60" : "text-muted"}`}>
          {isPlaying ? "clique para parar" : "clique para ouvir o escape"}
        </div>
      </div>

      {/* waveform */}
      <div className="flex items-center gap-[3px] ml-2">
        {[5, 12, 8, 16, 6, 14, 10].map((h, i) => (
          <div key={i}
            className={`w-[3px] rounded-full transition-all ${isPlaying ? "bg-white/50 animate-pulse" : "bg-border"}`}
            style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </button>
  );
}

// ── Guess tile ────────────────────────────────────────────────────────────────

function GuessTile({
  car, isCorrect, isSelected, isAnswered, onClick,
}: {
  car: Car; isCorrect: boolean; isSelected: boolean; isAnswered: boolean; onClick: () => void;
}) {
  let border = "border-border hover:border-accent/60";
  let bg = "bg-surface";
  if (isAnswered) {
    if (isCorrect)       { border = "border-correct"; bg = "bg-correct/10"; }
    else if (isSelected) { border = "border-wrong";   bg = "bg-wrong/10"; }
    else                 { border = "border-border opacity-30"; }
  }

  return (
    <button
      onClick={onClick}
      disabled={isAnswered}
      className={`flex-1 border-2 ${border} ${bg} overflow-hidden flex flex-col
                  transition-all duration-200 active:scale-[0.98] disabled:cursor-default text-left`}
    >
      {/* image */}
      <div className="relative w-full" style={{ paddingBottom: "75%" }}>
        <Image src={asset(car.image)} alt={fullName(car)} fill className="object-cover" unoptimized />
        {isAnswered && (isCorrect || isSelected) && (
          <div className={`absolute inset-0 flex items-center justify-center
            ${isCorrect ? "bg-correct/30" : "bg-wrong/30"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isCorrect ? "bg-correct text-white" : "bg-wrong text-white"}`}>
              {isCorrect
                ? <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" /></svg>
                : <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
              }
            </div>
          </div>
        )}
      </div>
      {/* label */}
      <div className="px-3 py-3">
        <div className="text-accent text-[15px] tracking-widest uppercase font-sans font-semibold">{car.make}</div>
        <div className="font-plate text-white text-[21px] font-black uppercase leading-tight mt-0.5">
          {car.model} {car.trim}
        </div>
        <div className="text-accent text-[17px] font-mono mt-0.5">{car.year}</div>
      </div>
    </button>
  );
}

// ── Guess Options ─────────────────────────────────────────────────────────────

function GuessOptions({ question, selected, isAnswered, onAnswer }: {
  question: GuessQuestion; selected: string | null; isAnswered: boolean; onAnswer: (id: string) => void;
}) {
  const leftId  = question.correctPosition === 0 ? question.correctId : question.distractorId;
  const rightId = question.correctPosition === 1 ? question.correctId : question.distractorId;
  return (
    <div className="flex gap-3">
      <GuessTile car={carById(leftId)!}  isCorrect={leftId  === question.correctId} isSelected={selected === leftId}  isAnswered={isAnswered} onClick={() => onAnswer(leftId)} />
      <GuessTile car={carById(rightId)!} isCorrect={rightId === question.correctId} isSelected={selected === rightId} isAnswered={isAnswered} onClick={() => onAnswer(rightId)} />
    </div>
  );
}

// ── Aspiration Options ────────────────────────────────────────────────────────

function AspirationOptions({ question, selected, isAnswered, onAnswer }: {
  question: AspirationQuestion; selected: string | null; isAnswered: boolean; onAnswer: (v: string) => void;
}) {
  const opts = [
    { label: "Aspirado", sub: "sem turbo / compressor", value: "NA", icon: "◇" },
    { label: "Turbo", sub: "turboalimentado ou biturbo", value: "Turbo", icon: "◈" },
  ];
  return (
    <div className="flex gap-3">
      {opts.map(({ label, sub, value, icon }) => {
        const isCorrect  = value === question.answer;
        const isSelected = selected === value;
        let border = "border-border hover:border-accent/60 bg-surface";
        if (isAnswered) {
          if (isCorrect)       border = "border-correct bg-correct/10";
          else if (isSelected) border = "border-wrong bg-wrong/10";
          else                 border = "border-border opacity-30 bg-surface";
        }
        return (
          <button key={value} onClick={() => onAnswer(value)} disabled={isAnswered}
            className={`flex-1 border-2 ${border} flex flex-col items-center justify-center
                        py-10 gap-2 transition-all duration-200 active:scale-[0.98] disabled:cursor-default`}>
            <span className={`text-2xl ${isAnswered && isCorrect ? "text-correct" : isAnswered && isSelected ? "text-wrong" : "text-muted"}`}>{icon}</span>
            <span className="font-plate text-white text-xl font-black uppercase">{label}</span>
            <span className="text-muted text-xs font-sans text-center px-2">{sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Reveal banner ─────────────────────────────────────────────────────────────

function RevealBanner({ carId, correct, question }: { carId: string; correct: boolean; question: Question }) {
  const car = carById(carId)!;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-l-4
      ${correct ? "border-correct bg-correct/5" : "border-wrong bg-wrong/5"}`}>
      <span className={`font-plate text-2xl font-black ${correct ? "text-correct" : "text-wrong"}`}>
        {correct ? "✓" : "✗"}
      </span>
      <div>
        <div className="font-plate text-white text-sm font-bold uppercase">{fullName(car)}</div>
        <div className="text-muted text-xs font-sans mt-0.5">
          {engineLabel(car)} · {car.redline.toLocaleString()} rpm
          {question.type === "aspiration" && ` · ${question.answer === "NA" ? "aspiração natural" : "turboalimentado"}`}
        </div>
      </div>
    </div>
  );
}

// ── Result Screen ─────────────────────────────────────────────────────────────

function ResultScreen({ result, total, session, onRestart }: {
  result: ScoreResult; total: number; session: Session; onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const pct = Math.round((result.correct / total) * 100);

  function copy() {
    const text = makeShareText(result, total, session.dateStr);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const headline = pct === 100 ? "PERFEITO!" : pct >= 80 ? "MUITO BOM!" : pct >= 50 ? "QUASE LÁ!" : "PODE MAIS!";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* title */}
        <div className="text-center mb-8">
          <div className="text-muted text-xs tracking-widest uppercase font-sans mb-2">REVDLE</div>
          <div className="font-plate text-5xl font-black text-white uppercase">{headline}</div>
          <div className="text-muted text-sm font-sans mt-2">
            {result.correct} de {total} acertos · {pct}%
          </div>
        </div>

        {/* breakdown squares */}
        <div className="flex justify-center gap-1.5 mb-8">
          {result.breakdown.map((b, i) => (
            <div key={i}
              title={b.pts > 0 ? `+${b.pts}` : "✗"}
              className={`w-9 h-9 flex items-center justify-center text-xs font-mono font-bold
                ${b.pts > 0 ? "bg-accent text-white" : "bg-surface border border-border text-muted"}`}>
              {b.pts > 0 ? "✓" : "✗"}
            </div>
          ))}
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { label: "Pontuação", value: String(result.total), accent: true },
            { label: "Acertos", value: `${result.correct}/${total}` },
            { label: "Acurácia", value: `${pct}%` },
            { label: "Melhor combo", value: result.bestCombo >= 3 ? `${result.bestCombo} 🔥` : String(result.bestCombo) },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-surface border border-border p-4 text-center">
              <div className="text-muted text-[10px] tracking-widest uppercase font-sans mb-1">{label}</div>
              <div className={`font-plate text-3xl font-black ${accent ? "text-accent" : "text-white"}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="flex flex-col gap-2">
          <button onClick={copy}
            className="w-full bg-accent hover:bg-accent-dim text-white font-plate font-black uppercase
                       py-4 tracking-widest transition-colors active:scale-[0.99]">
            {copied ? "COPIADO!" : "COMPARTILHAR"}
          </button>
          {session.mode !== "daily" && (
            <button onClick={onRestart}
              className="w-full border border-border hover:border-accent text-white font-plate font-bold uppercase
                         py-3 tracking-widest transition-colors active:scale-[0.99]">
              JOGAR DE NOVO
            </button>
          )}
          <Link href="/"
            className="w-full border border-border hover:border-accent text-muted hover:text-white font-plate
                       font-bold uppercase py-3 tracking-widest transition-colors text-center">
            INÍCIO
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── GamePlayer ────────────────────────────────────────────────────────────────

type Phase = "idle" | "answered" | "done";

export default function GamePlayer({
  session: initialSession, title, onDone,
}: {
  session: Session; title: string; onDone?: (result: ScoreResult) => void;
}) {
  const [session, setSession] = useState(initialSession);
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const audio = useAudio();

  const total    = session.questions.length;
  const question = session.questions[roundIdx] ?? session.questions[total - 1];
  const carId    = question.type === "guess" ? question.correctId : question.carId;
  const car      = carById(carId)!;

  useEffect(() => {
    if (phase === "answered" && roundIdx + 1 < total) {
      const next   = session.questions[roundIdx + 1];
      const nextId = next.type === "guess" ? next.correctId : next.carId;
      const nc     = carById(nextId);
      if (nc) audio.preload(nc.sound);
    }
  }, [phase, roundIdx, session, total, audio]);

  function handleAnswer(answer: string) {
    if (phase !== "idle") return;
    const correct = question.type === "guess"
      ? answer === question.correctId
      : answer === question.answer;
    audio.stop(carId);
    setSelected(answer);
    setPhase("answered");
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (correct) {
      const nc = combo + 1;
      setCombo(nc);
      setScore((s) => s + Math.round(POINTS_CORRECT * comboMult(nc)));
    } else {
      setCombo(0);
    }
  }

  function handleNext() {
    audio.stopAll();
    const nextIdx = roundIdx + 1;
    if (nextIdx >= total) {
      const r = computeScore(answers);
      setResult(r);
      setPhase("done");
      onDone?.(r);
    } else {
      setRoundIdx(nextIdx);
      setPhase("idle");
      setSelected(null);
    }
  }

  function handleRestart() {
    audio.stopAll();
    setRoundIdx(0); setPhase("idle"); setSelected(null);
    setAnswers([]); setCombo(0); setScore(0); setResult(null);
    import("@/lib/game").then(({ generateGuessSession, generateAspirationSession }) => {
      if (session.mode === "guess") setSession(generateGuessSession());
      else if (session.mode === "aspiration") setSession(generateAspirationSession());
    });
  }

  if (phase === "done" && result) {
    return <ResultScreen result={result} total={total} session={session} onRestart={handleRestart} />;
  }

  const isAnswered = phase === "answered";

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href="/" className="text-muted hover:text-white text-sm transition-colors" aria-label="Voltar">
          ←
        </Link>
        <span className="font-plate text-lg font-black uppercase tracking-widest text-white">REVDLE</span>
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span className="bg-accent text-white font-mono text-[10px] font-bold px-1.5 py-0.5">
              ×{combo}🔥
            </span>
          )}
          <span className="font-mono text-white text-xs font-bold">{score}pts</span>
        </div>
      </header>

      {/* ─── Game board — centered ─── */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        <div className="w-full max-w-xl flex flex-col gap-5">

          {/* Progress squares */}
          <div className="flex justify-center gap-1.5">
            {session.questions.map((_, i) => (
              <div key={i} className={`w-7 h-7 flex items-center justify-center text-xs font-mono font-bold transition-colors duration-300
                ${i < roundIdx
                  ? (answers[i] ? "bg-accent text-white" : "bg-wrong/80 text-white")
                  : i === roundIdx
                  ? "border-2 border-accent text-accent"
                  : "border border-border text-muted/40"
                }`}>
                {i < roundIdx ? (answers[i] ? "✓" : "✗") : i + 1}
              </div>
            ))}
          </div>

          {/* Round label */}
          <div className="text-center">
            <div className="text-muted text-[10px] tracking-widest uppercase font-sans">
              {question.type === "guess" ? "Qual é o carro?" : "Aspirado ou turbo?"}
            </div>
            <div className="text-muted text-xs font-sans mt-0.5">
              Rodada <span className="text-white font-bold">{roundIdx + 1}</span> de {total}
              {combo >= 2 && <span className="text-accent ml-2">combo ×{combo}</span>}
            </div>
          </div>

          {/* Audio */}
          <div className="flex justify-center">
            <AudioButton carId={carId} sound={car.sound} />
          </div>

          {/* Options */}
          {question.type === "guess"
            ? <GuessOptions question={question} selected={selected} isAnswered={isAnswered} onAnswer={handleAnswer} />
            : <AspirationOptions question={question} selected={selected} isAnswered={isAnswered} onAnswer={handleAnswer} />
          }

          {/* Reveal + next */}
          {isAnswered && (
            <div className="flex flex-col gap-3">
              <RevealBanner carId={carId} correct={answers[answers.length - 1]} question={question} />
              <button onClick={handleNext}
                className="w-full bg-accent hover:bg-accent-dim text-white font-plate font-black uppercase
                           py-4 tracking-widest transition-colors active:scale-[0.99]">
                {roundIdx + 1 >= total ? "VER RESULTADO →" : "PRÓXIMA →"}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
