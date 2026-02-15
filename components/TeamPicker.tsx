"use client";

import { useMemo, useState } from "react";

export default function TeamPicker({
  teams,
  teamId,
  onChange,
  placeholder
}: {
  teams: { id: string; name: string; seed?: number }[];
  teamId: string | null;
  onChange: (id: string | null) => void;
  placeholder: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
    const nq = norm(q);
    if (!nq) return teams;
    return teams.filter(t => norm(t.name).includes(nq));
  }, [teams, q]);

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-2xl border border-white/20 bg-black/30 px-3 py-3 text-base outline-none"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />
      <select
        className="w-full rounded-2xl border border-white/20 bg-black/30 px-3 py-3 text-base outline-none"
        value={teamId || ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">None</option>
        {filtered.map(t => (
          <option key={t.id} value={t.id}>
            {t.seed ? `${t.seed}. ` : ""}{t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
