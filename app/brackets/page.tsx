"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPref, setPref } from "@/lib/prefs";
import TeamPicker from "@/components/TeamPicker";
import BracketView from "@/components/BracketView";

type Gender = "boys" | "girls";

export default function BracketsPage() {
  const [gender, setGender] = useState<Gender>(() => (getPref("gender") as Gender) || "boys");
  const [teamId, setTeamId] = useState<string | null>(() => getPref("teamId"));
  const [teams, setTeams] = useState<{ id: string; name: string; seed?: number; gender: Gender }[]>([]);
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    setPref("gender", gender);
  }, [gender]);

  useEffect(() => {
    setPref("teamId", teamId);
  }, [teamId]);

  useEffect(() => {
    (async () => {
      const tq = query(collection(db, "teams"), where("gender", "==", gender), orderBy("seed", "asc"));
      const ts = await getDocs(tq);
      const t = ts.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setTeams(t);

      const gq = query(collection(db, "games"), where("gender", "==", gender), orderBy("round", "asc"), orderBy("gameNumber", "asc"));
      const gs = await getDocs(gq);
      const raw = gs.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      // Join team names for rendering
      const teamById = new Map(t.map(x => [x.id, x]));
      const withNames = raw.map(g => ({
        ...g,
        slotA: g.slotA?.teamId ? { ...g.slotA, teamName: teamById.get(g.slotA.teamId)?.name } : g.slotA,
        slotB: g.slotB?.teamId ? { ...g.slotB, teamName: teamById.get(g.slotB.teamId)?.name } : g.slotB,
      }));

      setGames(withNames);
    })();
  }, [gender]);

  return (
    <main className="space-y-4">
      <header className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Brackets</h1>
          <div className="flex gap-2">
            <button className={chip(gender === "boys")} onClick={() => setGender("boys")}>Boys</button>
            <button className={chip(gender === "girls")} onClick={() => setGender("girls")}>Girls</button>
          </div>
        </div>

        <TeamPicker teams={teams} teamId={teamId} onChange={setTeamId} placeholder="Highlight a team…" />
        <p className="text-xs text-white/60">Games show time + court. Scores appear after games are final.</p>
      </header>

      <BracketView games={games} selectedTeamId={teamId} />
    </main>
  );
}

function chip(active: boolean) {
  return [
    "rounded-full px-3 py-1 text-sm font-bold border",
    active ? "bg-white text-black border-white" : "bg-black/30 text-white border-white/30"
  ].join(" ");
}
