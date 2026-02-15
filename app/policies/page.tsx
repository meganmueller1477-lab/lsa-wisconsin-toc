"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PoliciesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const q1 = query(collection(db, "pages"), where("type", "==", "policy"), orderBy("title", "asc"));
      const snap = await getDocs(q1);
      setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, []);

  return (
    <main className="space-y-4">
      <header className="rounded-3xl border border-white/20 bg-white/5 p-4">
        <h1 className="text-xl font-extrabold">Policies</h1>
        <p className="text-sm text-white/70 mt-1">Food carry-in, conduct, and event rules.</p>
      </header>

      <div className="space-y-3">
        {items.map(i => (
          <details key={i.id} className="rounded-3xl border border-white/20 bg-white/5 p-4">
            <summary className="cursor-pointer text-lg font-extrabold">{i.title}</summary>
            <div className="mt-3 text-sm text-white/80 whitespace-pre-wrap">{i.body}</div>
          </details>
        ))}
        {items.length === 0 && (
          <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white/70">
            No policies posted yet.
          </div>
        )}
      </div>
    </main>
  );
}
