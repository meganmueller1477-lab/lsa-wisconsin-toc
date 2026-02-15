import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function finalizeGameAndAdvance(gameId: string) {
  const gameRef = doc(db, "games", gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) throw new Error("Game not found");

  const game = snap.data() as any;
  const { scoreA, scoreB, slotA, slotB, nextGameRef, nextSlot } = game;

  if (!slotA?.teamId || !slotB?.teamId) throw new Error("Both teams must be set");
  if (typeof scoreA !== "number" || typeof scoreB !== "number") throw new Error("Scores required");
  if (scoreA === scoreB) throw new Error("No ties allowed");

  const winnerTeamId = scoreA > scoreB ? slotA.teamId : slotB.teamId;

  await updateDoc(gameRef, {
    status: "final",
    winnerTeamId,
  });

  if (nextGameRef) {
    const nextRef = doc(db, nextGameRef);
    const patch: any = {};
    if (nextSlot === "A") patch["slotA.teamId"] = winnerTeamId;
    if (nextSlot === "B") patch["slotB.teamId"] = winnerTeamId;
    await updateDoc(nextRef, patch);
  }
}
