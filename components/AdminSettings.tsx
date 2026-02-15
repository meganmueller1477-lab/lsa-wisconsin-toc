"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSettings() {
  const [year, setYear] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "settings", "current");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() as any;
        setYear(typeof d.year === "number" ? d.year : "");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-3">
      <div className="font-extrabold">Tournament Settings</div>

      <label className="block text-sm">
        Tournament Year
        <input
          className="mt-1 w-full rounded-2xl p-2 text-black"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="2026"
        />
      </label>

      <button
        className="rounded-2xl bg-white text-black px-4 py-2 font-extrabold"
        disabled={loading}
        onClick={async () => {
          const ref = doc(db, "settings", "current");
          const payload: any = { year: year === "" ? null : year };
          // ensure doc exists
          const snap = await getDoc(ref);
          if (!snap.exists()) await setDoc(ref, payload, { merge: true });
          else await updateDoc(ref, payload);
          alert("Settings saved.");
        }}
      >
        Save Settings
      </button>

      <p className="text-xs text-white/60">
        Logo is managed in the Logo section. This controls the year shown on the Home screen.
      </p>
    </div>
  );
}
