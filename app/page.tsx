"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPref, setPref } from "@/lib/prefs";
import TeamPicker from "@/components/TeamPicker";

type Gender = "boys" | "girls";

export default function HomePage() {
  const [settings, setSettings] = useState<{ year: number; logoUrl?: string } | null>(null);
  const [gender, setGender] = useState<Gender>(() => (getPref("gender") as Gender) || "boys");
  const [teams, setTeams] = useState<{ id: string; name: string; seed?: number; gender: Gender }[]>([]);
  const [teamId, setTeamId] = useState<string | null>(() => getPref("teamId"));

  useEffect(() => {
    (async () => {
      const s = await getDoc(doc(db, "settings", "current"));
      if (s.exists()) setSettings(s.data() as any);
      const tq = query(collection(db, "teams"), where("gender", "==", gender), orderBy("seed", "asc"));
      const snap = await getDocs(tq);
      setTeams(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [gender]);

  useEffect(() => {
    setPref("gender", gender);
  }, [gender]);

  useEffect(() => {
    setPref("teamId", teamId);
  }, [teamId]);

  const logo = settings?.logoUrl || "/logo-placeholder.png";

  return (
    <main className="space-y-5">
      <header className="rounded-3xl border border-white/20 bg-white/5 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-black/30">
            <Image src={logo} alt="Tournament logo" fill className="object-contain p-1" />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white/70">{settings?.year ? `${settings.year} • ` : ""}LSA Wisconsin</div>
            <h1 className="text-xl font-extrabold leading-tight">Tournament of Champions</h1>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
        <div className="text-sm font-semibold text-white/80">Choose Gender</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={btnClass(gender === "boys")}
            onClick={() => { setGender("boys"); setTeamId(null); }}
          >
            Boys
          </button>
          <button
            className={btnClass(gender === "girls")}
            onClick={() => { setGender("girls"); setTeamId(null); }}
          >
            Girls
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/80">Choose Team (optional)</div>
          <button
            className="text-sm underline text-white/80"
            onClick={() => setTeamId(null)}
          >
            Clear
          </button>
        </div>

        <TeamPicker
          teams={teams}
          teamId={teamId}
          onChange={setTeamId}
          placeholder="Search team name…"
        />

        <p className="text-xs text-white/60">
          Tip: picking your team highlights your games in the bracket.
        </p>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/5 p-4">
        <p className="text-sm text-white/80">
          Use the tabs below to view brackets, tournament updates, and site info.
        </p>
      </section>
    </main>
  );
}

function btnClass(active: boolean) {
  return [
    "rounded-2xl px-4 py-4 text-lg font-extrabold border shadow-sm",
    active
      ? "bg-white text-black border-white"
      : "bg-black/30 text-white border-white/30 hover:border-white/60"
  ].join(" ");
}
