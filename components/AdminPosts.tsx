"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Gender = "boys" | "girls" | "both";

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [gender, setGender] = useState<Gender>("both");
  const [pinned, setPinned] = useState(false);

  async function refresh() {
    const q1 = query(collection(db, "posts"), orderBy("pinned", "desc"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q1);
    setPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-extrabold">Parents’ Corner Posts</div>
        <button className="text-sm underline text-white/80" onClick={refresh}>Refresh</button>
      </div>

      <div className="space-y-2">
        <input className="w-full rounded-2xl p-2 text-black" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea className="w-full rounded-2xl p-2 text-black min-h-[110px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body (line breaks allowed)" />
        <div className="flex items-center gap-2">
          <select className="rounded-2xl p-2 text-black" value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="both">Both</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            Pin to top
          </label>
        </div>

        <button
          className="rounded-2xl bg-white text-black px-4 py-2 font-extrabold"
          onClick={async () => {
            const t = title.trim();
            const b = body.trim();
            if (!t || !b) return alert("Title and body required.");
            await addDoc(collection(db, "posts"), {
              title: t,
              body: b,
              pinned,
              gender: gender === "both" ? null : gender,
              createdAt: Date.now(),
            });
            setTitle(""); setBody(""); setPinned(false); setGender("both");
            await refresh();
          }}
        >
          Publish Post
        </button>
      </div>

      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="rounded-2xl border border-white/15 bg-black/20 p-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-white/60">
                  {(p.gender ?? "both").toString().toUpperCase()} • {p.pinned ? "PINNED" : "normal"} • {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                </div>
                <div className="text-base font-extrabold break-words">{p.title}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="rounded-xl border border-white/30 px-3 py-1 text-sm font-extrabold"
                  onClick={async () => {
                    await updateDoc(doc(db, "posts", p.id), { pinned: !p.pinned });
                    await refresh();
                  }}
                >
                  Toggle Pin
                </button>
                <button
                  className="rounded-xl border border-white/30 px-3 py-1 text-sm font-extrabold"
                  onClick={async () => {
                    if (!confirm("Delete this post?")) return;
                    await deleteDoc(doc(db, "posts", p.id));
                    await refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-sm text-white/80 whitespace-pre-wrap">{p.body}</div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-sm text-white/70">No posts yet.</div>}
      </div>
    </div>
  );
}
