"use client";

import { useMemo } from "react";

export default function BracketView({ games, selectedTeamId }: { games: any[]; selectedTeamId: string | null }) {
  const byRound = useMemo(() => {
    const m: Record<number, any[]> = {};
    for (const g of games) m[g.round] = [...(m[g.round] || []), g];
    Object.keys(m).forEach(r => m[Number(r)].sort((a, b) => a.gameNumber - b.gameNumber));
    return m;
  }, [games]);

  const isHighlighted = (g: any) =>
    !!selectedTeamId && (g.slotA?.teamId === selectedTeamId || g.slotB?.teamId === selectedTeamId);

  return (
    <div className="space-y-5 pb-24">
      {[1,2,3,4].map(round => (
        <section key={round} className="space-y-3">
          <h2 className="text-lg font-extrabold">
            {round === 1 && "Round of 16"}
            {round === 2 && "Quarterfinals"}
            {round === 3 && "Semifinals"}
            {round === 4 && "Championship"}
          </h2>

          <div className="space-y-3">
            {(byRound[round] || []).map(g => (
              <div
                key={g.id}
                className={[
                  "rounded-3xl border p-4 shadow-sm bg-white/5",
                  selectedTeamId ? "opacity-60" : "",
                  isHighlighted(g) ? "opacity-100 border-white ring-2 ring-white" : "border-white/20",
                ].join(" ")}
              >
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-bold">Game {g.gameNumber}</span>
                  <span className="font-semibold">
                    {(g.court || "Court TBD")} • {g.time ? fmtTime(g.time) : "Time TBD"}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <TeamRow team={g.slotA?.teamName || "TBD"} score={g.scoreA} status={g.status} />
                  <TeamRow team={g.slotB?.teamName || "TBD"} score={g.scoreB} status={g.status} />
                </div>
              </div>
            ))}

            {(byRound[round] || []).length === 0 && (
              <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white/70">
                No games posted for this round yet.
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function TeamRow({ team, score, status }: { team: string; score?: number; status?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-3">
      <span className="text-base font-extrabold">{team}</span>
      <span className="text-base font-extrabold">
        {status === "final" || status === "in_progress" ? (typeof score === "number" ? score : "-") : "-"}
      </span>
    </div>
  );
}

function fmtTime(v: any) {
  try {
    const d = new Date(v);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return String(v);
  }
}
