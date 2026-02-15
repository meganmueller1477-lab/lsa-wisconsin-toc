"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPref } from "@/lib/prefs";

type Gender = "boys" | "girls";

export default function ParentsPage() {
  const [gender] = useState<Gender>(() => (getPref("gender") as Gender) || "boys");
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const q1 = query(collection(db, "posts"), where("gender", "in", [gender, null]), orderBy("pinned", "desc"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q1);
      setPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [gender]);

  return (
    <main className="space-y-4">
      <header className="rounded-3xl border border-white/20 bg-white/5 p-4">
        <h1 className="text-xl font-extrabold">Parents’ Corner</h1>
        <p className="text-sm text-white/70 mt-1">Updates, reminders, and announcements.</p>
      </header>

      <div className="space-y-3 pb-24">
        {posts.map(p => (
          <article key={p.id} className="rounded-3xl border border-white/20 bg-white/5 p-4">
            {p.pinned && <div className="text-xs font-bold text-white/70">PINNED</div>}
            <h2 className="text-lg font-extrabold mt-1">{p.title}</h2>
            <p className="text-sm text-white/80 mt-2 whitespace-pre-wrap">{p.body}</p>
            {p.createdAt && <div className="text-xs text-white/50 mt-3">{new Date(p.createdAt).toLocaleString()}</div>}
          </article>
        ))}
        {posts.length === 0 && (
          <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white/70">
            No updates yet.
          </div>
        )}
      </div>
    </main>
  );
}
