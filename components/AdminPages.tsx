"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PageType = "siteinfo" | "policy";

export default function AdminPages({ type }: { type: PageType }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function refresh() {
    const q1 = query(collection(db, "pages"), where("type", "==", type), orderBy("title", "asc"));
    const snap = await getDocs(q1);
    setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => { refresh(); }, [type]);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-extrabold">{type === "siteinfo" ? "Site Info Sections" : "Policies"}</div>
        <button className="text-sm underline text-white/80" onClick={refresh}>Refresh</button>
      </div>

      <div className="space-y-2">
        <input className="w-full rounded-2xl p-2 text-black" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Section title" />
        <textarea className="w-full rounded-2xl p-2 text-black min-h-[140px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Section body (line breaks allowed)" />
        <button
          className="rounded-2xl bg-white text-black px-4 py-2 font-extrabold"
          onClick={async () => {
            const t = title.trim();
            const b = body.trim();
            if (!t || !b) return alert("Title and body required.");
            await addDoc(collection(db, "pages"), {
              type,
              title: t,
              body: b,
              slug: slugify(t),
              createdAt: Date.now(),
            });
            setTitle(""); setBody("");
            await refresh();
          }}
        >
          Add Section
        </button>
      </div>

      <div className="space-y-2">
        {items.map(i => (
          <PageRow key={i.id} item={i} onChange={refresh} />
        ))}
        {items.length === 0 && <div className="text-sm text-white/70">No sections yet.</div>}
      </div>

      <p className="text-xs text-white/60">
        These appear as expandable sections in the app. Keep titles short for readability.
      </p>
    </div>
  );
}

function PageRow({ item, onChange }: { item: any; onChange: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body ?? "");

  return (
    <div className="rounded-2xl border border-white/15 bg-black/20 p-3 space-y-2">
      {!editing ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-extrabold break-words">{item.title}</div>
              <div className="text-xs text-white/60">{item.slug ?? ""}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="rounded-xl bg-white text-black px-3 py-1 text-sm font-extrabold" onClick={() => setEditing(true)}>Edit</button>
              <button
                className="rounded-xl border border-white/30 px-3 py-1 text-sm font-extrabold"
                onClick={async () => {
                  if (!confirm("Delete this section?")) return;
                  await deleteDoc(doc(db, "pages", item.id));
                  await onChange();
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="text-sm text-white/80 whitespace-pre-wrap line-clamp-4">{item.body}</div>
        </>
      ) : (
        <div className="space-y-2">
          <input className="w-full rounded-xl p-2 text-black" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="w-full rounded-xl p-2 text-black min-h-[140px]" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2">
            <button
              className="rounded-xl bg-white text-black px-3 py-2 text-sm font-extrabold"
              onClick={async () => {
                const t = title.trim();
                const b = body.trim();
                if (!t || !b) return alert("Title and body required.");
                await updateDoc(doc(db, "pages", item.id), { title: t, body: b, slug: slugify(t) });
                setEditing(false);
                await onChange();
              }}
            >
              Save
            </button>
            <button className="rounded-xl border border-white/30 px-3 py-2 text-sm font-extrabold" onClick={() => { setEditing(false); setTitle(item.title); setBody(item.body); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
