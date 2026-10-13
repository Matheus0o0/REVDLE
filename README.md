# REVDLE

Minijogo diário inspirado no Wordle: ouça o som do escape e adivinhe qual é o carro.

## Modos de jogo

| Modo | Descrição |
|---|---|
| **Desafio diário** | 1 rodada por dia · mesmo carro para todo mundo · resultado compartilhável |
| **Desafios anteriores** | Replaye os desafios dos últimos 30 dias |
| **Aspirado ou turbo?** | Ouça e identifique o tipo de alimentação do motor · 5 rodadas |
| **Catálogo** | Explore os 30 carros e ouça os escapes livremente |

## Como funciona

- Você ouve o som do escape de um carro e escolhe entre duas opções
- Acertos em sequência dão bônus de pontuação (combo ×1,5 com 3 seguidos, ×2 com 5)
- O desafio diário é o mesmo para todos os jogadores e muda à meia-noite (horário de Brasília)
- Os resultados ficam salvos no navegador (localStorage), sem login

## Tecnologia

- [Next.js](https://nextjs.org/) com App Router e export estático
- [Tailwind CSS v4](https://tailwindcss.com/)
- Web Audio API para reprodução e preload dos áudios

## Rodar localmente

```bash
npm install
npm run dev
```

## Créditos

Gravações de escape e dados dos carros: **[Exhaust Notes](https://github.com/sathyaram/exhaustnotes)** por [sathyaram](https://github.com/sathyaram) · uso não-comercial.
