"use client";

import { useState } from "react";
import { finalizeGameAndAdvance } from "@/lib/bracketLogic";

export default function AdminGameEditor({ game, onSave }: { game: any; onSave: (patch: any) => Promise<void> }) {
  const [court, setCourt] = useState<string>(game.court ?? "");
  const [time, setTime] = useState<string>(game.time ?? "");
  const [scoreA, setScoreA] = useState<number | "">(typeof game.scoreA === "number" ? game.scoreA : "");
  const [scoreB, setScoreB] = useState<number | "">(typeof game.scoreB === "number" ? game.scoreB : "");
  const [status, setStatus] = useState<string>(game.status ?? "scheduled");

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
      <div className="text-sm text-white/70">
        Round {game.round} • Game {game.gameNumber}
      </div>

      <div className="text-base font-extrabold">
        {game.slotA?.teamName || "TBD"} vs {game.slotB?.teamName || "TBD"}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Court
          <input className="mt-1 w-full rounded-2xl p-2 text-black" value={court} onChange={(e) => setCourt(e.target.value)} />
        </label>
        <label className="text-sm">
          Time (ISO)
          <input className="mt-1 w-full rounded-2xl p-2 text-black" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="text-sm col-span-1">
          Status
          <select className="mt-1 w-full rounded-2xl p-2 text-black" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="scheduled">scheduled</option>
            <option value="in_progress">in_progress</option>
            <option value="final">final</option>
          </select>
        </label>
        <label className="text-sm col-span-1">
          Score A
          <input
            className="mt-1 w-full rounded-2xl p-2 text-black"
            inputMode="numeric"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
        <label className="text-sm col-span-1">
          Score B
          <input
            className="mt-1 w-full rounded-2xl p-2 text-black"
            inputMode="numeric"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          className="rounded-2xl bg-white text-black px-4 py-2 font-extrabold"
          onClick={async () => {
            await onSave({ court, time, status, scoreA: scoreA === "" ? null : scoreA, scoreB: scoreB === "" ? null : scoreB });
            alert("Saved.");
          }}
        >
          Save
        </button>

        <button
          className="rounded-2xl border border-white/40 px-4 py-2 font-extrabold"
          onClick={async () => {
            await onSave({ court, time, status: "final", scoreA, scoreB });
            await finalizeGameAndAdvance(game.id);
            alert("Finalized + winner advanced.");
          }}
        >
          Finalize + Advance
        </button>
      </div>

      <p className="text-xs text-white/60">
        Finalize will set the winner and place them into the next round automatically.
      </p>
    </div>
  );
}
