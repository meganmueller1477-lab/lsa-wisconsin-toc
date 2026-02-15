/**
 * Seeds 15 games for both boys + girls with correct next-round routing.
 * Usage:
 * 1) Create a Firebase service account key JSON
 * 2) Set GOOGLE_APPLICATION_CREDENTIALS=/path/key.json
 * 3) node scripts/seed-games.mjs
 */

import admin from "firebase-admin";
import fs from "fs";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON file path.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

function gameId(gender, round, gameNumber) {
  return `${gender}_r${round}_g${gameNumber}`;
}

function buildGamesForGender(gender) {
  const games = [];

  // Round 1: 8 games
  for (let i = 1; i <= 8; i++) {
    games.push({
      id: gameId(gender, 1, i),
      gender,
      round: 1,
      gameNumber: i,
      slotA: { teamId: null },
      slotB: { teamId: null },
      time: null,
      court: null,
      scoreA: null,
      scoreB: null,
      status: "scheduled",
      winnerTeamId: null,
    });
  }

  // Round 2: 4 games
  for (let i = 1; i <= 4; i++) {
    games.push({
      id: gameId(gender, 2, i),
      gender,
      round: 2,
      gameNumber: i,
      slotA: { teamId: null },
      slotB: { teamId: null },
      time: null,
      court: null,
      scoreA: null,
      scoreB: null,
      status: "scheduled",
      winnerTeamId: null,
    });
  }

  // Round 3: 2 games
  for (let i = 1; i <= 2; i++) {
    games.push({
      id: gameId(gender, 3, i),
      gender,
      round: 3,
      gameNumber: i,
      slotA: { teamId: null },
      slotB: { teamId: null },
      time: null,
      court: null,
      scoreA: null,
      scoreB: null,
      status: "scheduled",
      winnerTeamId: null,
    });
  }

  // Round 4: Final: 1 game
  games.push({
    id: gameId(gender, 4, 1),
    gender,
    round: 4,
    gameNumber: 1,
    slotA: { teamId: null },
    slotB: { teamId: null },
    time: null,
    court: null,
    scoreA: null,
    scoreB: null,
    status: "scheduled",
    winnerTeamId: null,
  });

  // Routing: R1 -> R2
  const routing = [];
  routing.push([gameId(gender,1,1), gameId(gender,2,1), "A"]);
  routing.push([gameId(gender,1,2), gameId(gender,2,1), "B"]);
  routing.push([gameId(gender,1,3), gameId(gender,2,2), "A"]);
  routing.push([gameId(gender,1,4), gameId(gender,2,2), "B"]);
  routing.push([gameId(gender,1,5), gameId(gender,2,3), "A"]);
  routing.push([gameId(gender,1,6), gameId(gender,2,3), "B"]);
  routing.push([gameId(gender,1,7), gameId(gender,2,4), "A"]);
  routing.push([gameId(gender,1,8), gameId(gender,2,4), "B"]);

  // R2 -> R3
  routing.push([gameId(gender,2,1), gameId(gender,3,1), "A"]);
  routing.push([gameId(gender,2,2), gameId(gender,3,1), "B"]);
  routing.push([gameId(gender,2,3), gameId(gender,3,2), "A"]);
  routing.push([gameId(gender,2,4), gameId(gender,3,2), "B"]);

  // R3 -> R4
  routing.push([gameId(gender,3,1), gameId(gender,4,1), "A"]);
  routing.push([gameId(gender,3,2), gameId(gender,4,1), "B"]);

  const byId = new Map(games.map(g => [g.id, g]));
  for (const [from, to, slot] of routing) {
    const g = byId.get(from);
    g.nextGameRef = `games/${to}`;
    g.nextSlot = slot;
  }

  return games;
}

async function upsertGames(gender) {
  const games = buildGamesForGender(gender);
  const batch = db.batch();
  for (const g of games) {
    const ref = db.collection("games").doc(g.id);
    batch.set(ref, g, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${games.length} games for ${gender}.`);
}

(async () => {
  await upsertGames("boys");
  await upsertGames("girls");
  console.log("Done.");
  process.exit(0);
})();
