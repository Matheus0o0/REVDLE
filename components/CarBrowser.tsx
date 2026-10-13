"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "./AudioEngine";
import { cars, fullName, engineLabel, type Car } from "@/lib/cars";
import { asset } from "@/lib/assets";

function PlayButton({ car }: { car: Car }) {
  const { solo, stop, playing, loading } = useAudio();
  const isPlaying = !!playing[car.id];
  const isLoading = !!loading[car.id];

  return (
    <button
      onClick={() => isPlaying ? stop(car.id) : void solo(car.id, car.sound, { loop: true })}
      aria-label={isPlaying ? "Parar" : "Ouvir"}
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-150
        ${isPlaying
          ? "bg-accent text-bg shadow-[0_0_16px_rgba(226,255,0,0.35)]"
          : "border border-border hover:border-accent text-muted hover:text-accent"
        }`}
    >
      {isLoading ? (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : isPlaying ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

function CarRow({ car }: { car: Car }) {
  const { playing } = useAudio();
  const isPlaying = !!playing[car.id];

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-border transition-colors
      ${isPlaying ? "bg-accent/5" : "hover:bg-surface"}`}>
      <div className="relative w-16 h-11 shrink-0 rounded overflow-hidden bg-raised">
        <Image src={asset(car.image)} alt={fullName(car)} fill className="object-cover" unoptimized />
        {isPlaying && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-plate text-white text-base font-bold uppercase leading-tight truncate">
            {car.make} {car.model} {car.trim}
          </span>
          <span className="text-muted text-xs font-mono shrink-0">{car.year}</span>
        </div>
        <div className="text-muted text-xs font-sans mt-0.5 truncate">{engineLabel(car)}</div>
      </div>

      <PlayButton car={car} />
    </div>
  );
}

export default function CarBrowser() {
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? cars.filter((c) => {
        const q = query.trim().toLowerCase();
        return [c.make, c.model, c.trim, c.engine.layout, c.engine.aspiration, ...c.tags]
          .join(" ").toLowerCase().includes(q);
      })
    : cars;

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <Link href="/" className="text-muted hover:text-white text-xs transition-colors uppercase tracking-widest font-sans">
          ← Voltar
        </Link>
        <span className="font-plate text-sm font-bold uppercase text-white tracking-widest">Catálogo</span>
        <span className="text-muted text-xs font-mono">{results.length}/{cars.length}</span>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: V8, turbo, Ferrari, flat-plane…"
          className="w-full bg-surface border border-border focus:border-accent rounded-lg
                     px-4 py-2.5 text-white text-sm placeholder:text-muted font-sans outline-none transition-colors"
        />
      </div>

      {/* List */}
      <div>
        {results.length === 0 ? (
          <p className="py-16 text-center text-muted text-sm font-sans">Nenhum resultado.</p>
        ) : (
          results.map((car) => <CarRow key={car.id} car={car} />)
        )}
      </div>

      <p className="py-6 text-center text-muted/50 text-xs font-sans px-4">
        Gravações usadas de forma não-comercial · créditos: {" "}
        <a href="https://github.com/sathyaram/exhaustnotes" target="_blank" rel="noopener noreferrer"
           className="hover:text-accent transition-colors">Exhaust Notes</a>
      </p>
    </div>
  );
}
