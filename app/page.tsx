import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { asset } from "@/lib/assets";

export const metadata: Metadata = {
  title: "REVDLE",
  description: "Adivinhe o carro pelo som.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src={asset("/logo.png")} alt="REVDLE" width={140} height={40} unoptimized priority />
          <p className="text-muted text-sm font-sans">Adivinhe o carro pelo som do escape</p>
        </div>

        {/* Game modes */}
        <div className="w-full flex flex-col gap-3">

          {/* Daily challenge — first */}
          <Link href="/daily"
            className="group w-full border-2 border-accent bg-accent/5 hover:bg-accent/10
                       flex items-center gap-4 px-5 py-5 transition-all duration-150">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0
                            group-hover:bg-accent transition-colors">
              <span className="text-accent group-hover:text-white text-base transition-colors">◎</span>
            </div>
            <div className="flex-1">
              <div className="font-plate text-accent text-lg font-black uppercase leading-tight">
                Desafio diário
              </div>
              <div className="text-muted text-xs font-sans mt-0.5">1 rodada · mesmo para todos · compartilhável</div>
            </div>
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Archive mode */}
          <Link href="/archive"
            className="group w-full border-2 border-border hover:border-accent bg-surface
                       flex items-center gap-4 px-5 py-5 transition-all duration-150">
            <div className="w-10 h-10 rounded-full bg-raised flex items-center justify-center shrink-0
                            group-hover:bg-accent transition-colors">
              <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-plate text-white text-lg font-black uppercase leading-tight
                              group-hover:text-accent transition-colors">
                Desafios anteriores
              </div>
              <div className="text-muted text-xs font-sans mt-0.5">Replaye os últimos 30 dias · 1 rodada cada</div>
            </div>
            <span className="text-muted group-hover:text-accent transition-colors font-mono text-xs">01</span>
          </Link>

          {/* Aspiration mode */}
          <Link href="/aspiration"
            className="group w-full border-2 border-border hover:border-accent bg-surface
                       flex items-center gap-4 px-5 py-5 transition-all duration-150">
            <div className="w-10 h-10 rounded-full bg-raised flex items-center justify-center shrink-0
                            group-hover:bg-accent transition-colors">
              <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-plate text-white text-lg font-black uppercase leading-tight
                              group-hover:text-accent transition-colors">
                Aspirado ou turbo?
              </div>
              <div className="text-muted text-xs font-sans mt-0.5">Identifique a aspiração · 5 rodadas</div>
            </div>
            <span className="text-muted group-hover:text-accent transition-colors font-mono text-xs">02</span>
          </Link>

        </div>

        {/* Catalog link */}
        <Link href="/garage"
          className="text-muted hover:text-white text-xs font-sans uppercase tracking-widest transition-colors">
          Ver catálogo de carros →
        </Link>

        {/* Credits */}
        <p className="text-muted/40 text-xs font-sans text-center leading-relaxed">
          Gravações e dados:{" "}
          <a
            href="https://github.com/sathyaram/exhaustnotes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted transition-colors underline underline-offset-2"
          >
            Exhaust Notes
          </a>{" "}
          por sathyaram · uso não-comercial
        </p>

      </div>
    </main>
  );
}
