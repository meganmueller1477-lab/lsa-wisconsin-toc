"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getPref, setPref } from "@/lib/prefs";
import AdminGameEditor from "@/components/AdminGameEditor";
import AdminTeams from "@/components/AdminTeams";
import AdminPosts from "@/components/AdminPosts";
import AdminPages from "@/components/AdminPages";
import AdminSettings from "@/components/AdminSettings";

type Gender = "boys" | "girls";
type AdminSection = "settings" | "logo" | "teams" | "bracket" | "posts" | "siteinfo" | "policies";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const [gender, setGender] = useState<Gender>(() => (getPref("gender") as Gender) || "boys");
  const [section, setSection] = useState<AdminSection>(() => ((getPref("adminSection") as any) || "bracket"));
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const a = await getDoc(doc(db, "admins", u.uid));
        setRole(a.exists() ? (a.data() as any).role : null);
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => setPref("gender", gender), [gender]);
  useEffect(() => setPref("adminSection", section), [section]);

  // Load games/teams for bracket editor only
  useEffect(() => {
    (async () => {
      if (!user || !role) return;
      const tq = query(collection(db, "teams"), where("gender", "==", gender), orderBy("seed", "asc"));
      const ts = await getDocs(tq);
      const t = ts.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setTeams(t);

      const gq = query(collection(db, "games"), where("gender", "==", gender), orderBy("round", "asc"), orderBy("gameNumber", "asc"));
      const gs = await getDocs(gq);
      const raw = gs.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      const teamById = new Map(t.map(x => [x.id, x]));
      setGames(raw.map(g => ({
        ...g,
        slotA: g.slotA?.teamId ? { ...g.slotA, teamName: teamById.get(g.slotA.teamId)?.name } : g.slotA,
        slotB: g.slotB?.teamId ? { ...g.slotB, teamName: teamById.get(g.slotB.teamId)?.name } : g.slotB,
      })));
    })();
  }, [user, role, gender, section]);

  const selectedGame = useMemo(() => games.find(g => g.id === selectedGameId) || null, [games, selectedGameId]);

  return (
    <main className="space-y-4">
      <header className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Admin</h1>
          {user ? (
            <button className="text-sm underline text-white/80" onClick={() => signOut(auth)}>Sign out</button>
          ) : null}
        </div>

        {!user ? (
          <button
            className="rounded-2xl bg-white text-black px-4 py-3 font-extrabold"
            onClick={async () => {
              const provider = new GoogleAuthProvider();
              await signInWithPopup(auth, provider);
            }}
          >
            Sign in with Google
          </button>
        ) : (
          <div className="text-sm text-white/70">
            Signed in as <span className="font-semibold">{user.email}</span>{" "}
            {role ? `(role: ${role})` : "(not authorized yet)"}
          </div>
        )}
      </header>

      {user && !role && (
        <div className="rounded-3xl border border-white/20 bg-white/5 p-4 text-sm text-white/70">
          Your account isn’t authorized as an admin yet. In Firestore, create <code className="text-white">admins/{`{uid}`}</code> with field{" "}
          <code className="text-white">role</code> = <code className="text-white">super</code>.
        </div>
      )}

      {user && role && (
        <>
          <section className="rounded-3xl border border-white/20 bg-white/5 p-3">
            <div className="flex flex-wrap gap-2">
              <SectionButton label="Settings" active={section==="settings"} onClick={() => setSection("settings")} />
              <SectionButton label="Logo" active={section==="logo"} onClick={() => setSection("logo")} />
              <SectionButton label="Teams" active={section==="teams"} onClick={() => setSection("teams")} />
              <SectionButton label="Bracket" active={section==="bracket"} onClick={() => setSection("bracket")} />
              <SectionButton label="Posts" active={section==="posts"} onClick={() => setSection("posts")} />
              <SectionButton label="Site Info" active={section==="siteinfo"} onClick={() => setSection("siteinfo")} />
              <SectionButton label="Policies" active={section==="policies"} onClick={() => setSection("policies")} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-extrabold">Gender</div>
              <div className="flex gap-2">
                <button className={chip(gender==="boys")} onClick={() => setGender("boys")}>Boys</button>
                <button className={chip(gender==="girls")} onClick={() => setGender("girls")}>Girls</button>
              </div>
            </div>
            <p className="text-xs text-white/60">
              Gender affects Teams + Bracket editing. Posts/Site Info/Policies can be shared across both genders.
            </p>
          </section>

          {section === "settings" && <AdminSettings />}

          {section === "logo" && (
            <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
              <div className="font-extrabold">Tournament Logo</div>
              <LogoUploader />
              <p className="text-xs text-white/60">
                Upload a new logo each year—no code changes needed.
              </p>
            </div>
          )}

          {section === "teams" && <AdminTeams gender={gender} />}

          {section === "bracket" && (
            <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
              <div className="font-extrabold">Bracket Editor</div>

              <label className="block text-sm">
                Select Game
                <select
                  className="mt-1 w-full rounded-2xl p-2 text-black"
                  value={selectedGameId || ""}
                  onChange={(e) => setSelectedGameId(e.target.value || null)}
                >
                  <option value="">Choose…</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>
                      R{g.round} G{g.gameNumber}: {g.slotA?.teamName || "TBD"} vs {g.slotB?.teamName || "TBD"}
                    </option>
                  ))}
                </select>
              </label>

              {selectedGame ? (
                <AdminGameEditor
                  game={selectedGame}
                  onSave={async (patch) => {
                    await updateDoc(doc(db, "games", selectedGame.id), patch);
                  }}
                />
              ) : (
                <div className="text-sm text-white/70">
                  Choose a game to edit its court, time, and scores.
                </div>
              )}

              <p className="text-xs text-white/60">
                Tip: Seed your games first (creates 15 games per gender). Then assign Round 1 teams, times, and courts.
              </p>
            </div>
          )}

          {section === "posts" && <AdminPosts />}

          {section === "siteinfo" && <AdminPages type="siteinfo" />}

          {section === "policies" && <AdminPages type="policy" />}
        </>
      )}
    </main>
  );
}

function SectionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={[
        "rounded-full px-3 py-2 text-xs font-extrabold border",
        active ? "bg-white text-black border-white" : "bg-black/30 text-white border-white/30 hover:border-white/60",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function chip(active: boolean) {
  return [
    "rounded-full px-3 py-1 text-sm font-extrabold border",
    active ? "bg-white text-black border-white" : "bg-black/30 text-white border-white/30"
  ].join(" ");
}

function LogoUploader() {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const storageRef = ref(storage, `logos/current-${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "settings", "current"), { logoUrl: url });
            alert("Logo updated!");
          } finally {
            setUploading(false);
          }
        }}
      />
      <p className="text-xs text-white/60">
        PNG works best. Large images are fine; the app scales them.
      </p>
    </div>
  );
}
