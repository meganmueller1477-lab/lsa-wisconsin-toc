// src/lib/bracketTemplate.ts
export type Gender = "boys" | "girls";

export type GameSeedRef =
  | { kind: "seed"; seed: number }                 // e.g., seed 1
  | { kind: "winner"; gameKey: string }            // winner of another game
  | { kind: "loser"; gameKey: string };            // loser of another game

export type BracketGameTemplate = {
  key: string;              // stable id like "R16-1", "QF-1", "C-2", etc.
  sort: number;             // for dropdown ordering
  bracket: "championship" | "consolation" | "third" | "fifth";
  roundLabel: string;       // for UI
  home: GameSeedRef;
  away: GameSeedRef;
};

export const TOC_16_CONSOLATION_TEMPLATE = (): BracketGameTemplate[] => {
  // 16-team round (8), quarterfinals (4), semis (2), championship (1) => 15
  // consolation for round-of-16 losers: 4 + 2 + 1 => 7  (total 22)
  // 3rd place: 1 => 23
  // 5th place: 2 semis + final => 3 (total 26)

  const t: BracketGameTemplate[] = [];

  // --- Round of 16 (Friday): seeds 1-16 (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
  const r16Pairs: [number, number][] = [
    [1, 16],
    [8, 9],
    [5, 12],
    [4, 13],
    [6, 11],
    [3, 14],
    [7, 10],
    [2, 15],
  ];
  r16Pairs.forEach(([a, b], idx) => {
    t.push({
      key: `R16-${idx + 1}`,
      sort: idx + 1,
      bracket: "championship",
      roundLabel: "Round of 16",
      home: { kind: "seed", seed: a },
      away: { kind: "seed", seed: b },
    });
  });

  // --- Quarterfinals (Saturday): winners of R16
  // QF-1: W(R16-1) vs W(R16-2)
  // QF-2: W(R16-3) vs W(R16-4)
  // QF-3: W(R16-5) vs W(R16-6)
  // QF-4: W(R16-7) vs W(R16-8)
  const qf = [
    ["R16-1", "R16-2"],
    ["R16-3", "R16-4"],
    ["R16-5", "R16-6"],
    ["R16-7", "R16-8"],
  ] as const;

  qf.forEach(([g1, g2], idx) => {
    t.push({
      key: `QF-${idx + 1}`,
      sort: 100 + idx + 1,
      bracket: "championship",
      roundLabel: "Quarterfinal",
      home: { kind: "winner", gameKey: g1 },
      away: { kind: "winner", gameKey: g2 },
    });
  });

  // --- Semifinals
  t.push({
    key: "SF-1",
    sort: 200 + 1,
    bracket: "championship",
    roundLabel: "Semifinal",
    home: { kind: "winner", gameKey: "QF-1" },
    away: { kind: "winner", gameKey: "QF-2" },
  });
  t.push({
    key: "SF-2",
    sort: 200 + 2,
    bracket: "championship",
    roundLabel: "Semifinal",
    home: { kind: "winner", gameKey: "QF-3" },
    away: { kind: "winner", gameKey: "QF-4" },
  });

  // --- Championship
  t.push({
    key: "CHAMP",
    sort: 300,
    bracket: "championship",
    roundLabel: "State Championship",
    home: { kind: "winner", gameKey: "SF-1" },
    away: { kind: "winner", gameKey: "SF-2" },
  });

  // --- Consolation (for R16 losers)
  // Consolation Round 1 (4 games): losers paired in the same “pods”
  // C1: L(R16-1) vs L(R16-2)
  // C2: L(R16-3) vs L(R16-4)
  // C3: L(R16-5) vs L(R16-6)
  // C4: L(R16-7) vs L(R16-8)
  const cPods = [
    ["R16-1", "R16-2"],
    ["R16-3", "R16-4"],
    ["R16-5", "R16-6"],
    ["R16-7", "R16-8"],
  ] as const;

  cPods.forEach(([g1, g2], idx) => {
    t.push({
      key: `C1-${idx + 1}`,
      sort: 400 + idx + 1,
      bracket: "consolation",
      roundLabel: "Consolation Round 1",
      home: { kind: "loser", gameKey: g1 },
      away: { kind: "loser", gameKey: g2 },
    });
  });

  // Consolation Semis (2)
  t.push({
    key: "C-SF-1",
    sort: 500 + 1,
    bracket: "consolation",
    roundLabel: "Consolation Semifinal",
    home: { kind: "winner", gameKey: "C1-1" },
    away: { kind: "winner", gameKey: "C1-2" },
  });
  t.push({
    key: "C-SF-2",
    sort: 500 + 2,
    bracket: "consolation",
    roundLabel: "Consolation Semifinal",
    home: { kind: "winner", gameKey: "C1-3" },
    away: { kind: "winner", gameKey: "C1-4" },
  });

  // Consolation Championship
  t.push({
    key: "CONSOL",
    sort: 600,
    bracket: "consolation",
    roundLabel: "Consolation Championship",
    home: { kind: "winner", gameKey: "C-SF-1" },
    away: { kind: "winner", gameKey: "C-SF-2" },
  });

  // --- 3rd place: losers of SF
  t.push({
    key: "THIRD",
    sort: 700,
    bracket: "third",
    roundLabel: "3rd Place",
    home: { kind: "loser", gameKey: "SF-1" },
    away: { kind: "loser", gameKey: "SF-2" },
  });

  // --- 5th place: losers of QF (2 semis + final)
  t.push({
    key: "FIFTH-SF-1",
    sort: 800 + 1,
    bracket: "fifth",
    roundLabel: "5th Place Semi",
    home: { kind: "loser", gameKey: "QF-1" },
    away: { kind: "loser", gameKey: "QF-2" },
  });
  t.push({
    key: "FIFTH-SF-2",
    sort: 800 + 2,
    bracket: "fifth",
    roundLabel: "5th Place Semi",
    home: { kind: "loser", gameKey: "QF-3" },
    away: { kind: "loser", gameKey: "QF-4" },
  });
  t.push({
    key: "FIFTH",
    sort: 900,
    bracket: "fifth",
    roundLabel: "5th Place",
    home: { kind: "winner", gameKey: "FIFTH-SF-1" },
    away: { kind: "winner", gameKey: "FIFTH-SF-2" },
  });

  return t;
};
