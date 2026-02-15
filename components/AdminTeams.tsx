"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Gender = "boys" | "girls";

export default function AdminTeams({ gender }: { gender: Gender }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [seed, setSeed] = useState<number | "">("");

  async function refresh() {
    const q1 = query(collection(db, "teams"), where("gender", "==", gender), orderBy("seed", "asc"));
    const snap = await getDocs(q1);
    setTeams(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => { refresh(); }, [gender]);

  const seedTaken = useMemo(() => {
    const s = new Set<number>();
    for (const t of teams) if (typeof t.seed === "number") s.add(t.seed);
    return s;
  }, [teams]);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-extrabold">Teams ({gender})</div>
        <button className="text-sm underline text-white/80" onClick={refresh}>Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <input
          className="col-span-2 rounded-2xl p-2 text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Team name (ex: St. Paul - Green Bay)"
        />
        <input
          className="col-span-1 rounded-2xl p-2 text-black"
          inputMode="numeric"
          value={seed}
          onChange={(e) => setSeed(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Seed"
        />
      </div>

      <button
        className="rounded-2xl bg-white text-black px-4 py-2 font-extrabold"
        onClick={async () => {
          const trimmed = name.trim();
          if (!trimmed) return alert("Enter a team name.");
          if (seed === "" || !Number.isFinite(seed)) return alert("Enter a seed number.");
          if (seed < 1 || seed > 16) return alert("Seed must be 1–16.");
          if (seedTaken.has(seed)) return alert("That seed is already used. Update the existing team instead.");
          await addDoc(collection(db, "teams"), { gender, name: trimmed, seed });
          setName(""); setSeed("");
          await refresh();
        }}
      >
        Add Team
      </button>

      <div className="space-y-2">
        {teams.map(t => (
          <TeamRow key={t.id} team={t} onChange={refresh} />
        ))}
        {teams.length === 0 && (
          <div className="text-sm text-white/70">No teams yet. Add your 16 seeded teams.</div>
        )}
      </div>

      <p className="text-xs text-white/60">
        Recommended: exactly 16 teams per bracket. Seeds help you keep matchups organized.
      </p>
    </div>
  );
}

function TeamRow({ team, onChange }: { team: any; onChange: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name ?? "");
  const [seed, setSeed] = useState<number | "">(typeof team.seed === "number" ? team.seed : "");

  return (
    <div className="rounded-2xl border border-white/15 bg-black/20 p-3">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-white/70">Seed {team.seed ?? "-"}</div>
            <div className="text-base font-extrabold break-words">{team.name}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="rounded-xl bg-white text-black px-3 py-1 text-sm font-extrabold" onClick={() => setEditing(true)}>Edit</button>
            <button
              className="rounded-xl border border-white/30 px-3 py-1 text-sm font-extrabold"
              onClick={async () => {
                if (!confirm("Delete this team?")) return;
                await deleteDoc(doc(db, "teams", team.id));
                await onChange();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input className="col-span-2 rounded-xl p-2 text-black" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className="col-span-1 rounded-xl p-2 text-black"
              inputMode="numeric"
              value={seed}
              onChange={(e) => setSeed(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-xl bg-white text-black px-3 py-2 text-sm font-extrabold"
              onClick={async () => {
                const trimmed = name.trim();
                if (!trimmed) return alert("Team name required.");
                if (seed === "" || !Number.isFinite(seed)) return alert("Seed required.");
                if (seed < 1 || seed > 16) return alert("Seed must be 1–16.");
                await updateDoc(doc(db, "teams", team.id), { name: trimmed, seed });
                setEditing(false);
                await onChange();
              }}
            >
              Save
            </button>
            <button className="rounded-xl border border-white/30 px-3 py-2 text-sm font-extrabold" onClick={() => { setEditing(false); setName(team.name); setSeed(team.seed); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
