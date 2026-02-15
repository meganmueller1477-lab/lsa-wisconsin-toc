# LSA Wisconsin - Tournament of Champions (PWA)

Phone-first tournament app with:
- Home: gender + team selection
- Brackets: 16-team single elimination (boys + girls), time/court on each game, scores when final
- Parents' Corner
- Site Info
- Policies
- Admin: update logo + edit games/scores (winner auto-advances)

## Quick start (local)
1) Install Node.js LTS
2) `npm install`
3) Copy `.env.example` to `.env.local` and fill in Firebase web config
4) `npm run dev`

## Deploy (recommended): Vercel + Firebase
You will create:
- Firebase project (Firestore + Storage + Auth)
- Vercel project (hosting the Next.js app)

Follow the step-by-step deployment guide below in this README.

---

## Step-by-step deployment guide (non-developer friendly)

### A) Create Firebase project
1. Go to Firebase Console → Add project
2. Create Firestore database (Production mode is fine)
3. Create Storage bucket
4. Enable Authentication → Sign-in method → Google (enable)

### B) Create Firebase Web App config
1. Firebase Console → Project settings → "Your apps" → Web app
2. Copy the config values into Vercel environment variables and `.env.local`

### C) Create initial documents
In Firestore:
- `settings/current`:
  - year: 2026
  - logoUrl: (leave blank for now)
- `divisions/boys`: { name: "Boys", active: true }
- `divisions/girls`: { name: "Girls", active: true }

### D) Create your first admin
1. Deploy the app and open `/admin`
2. Sign in with Google
3. Copy your UID from Firebase Auth user list
4. In Firestore create `admins/{UID}` with:
   - role: "super"

### E) Seed 15 games per bracket (boys + girls)
This uses a Firebase Service Account:
1. Firebase Console → Project settings → Service accounts → Generate new private key
2. Download JSON key file
3. In terminal:
   - `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"`
   - `npm run seed:games`

### F) Add teams (in Admin — no Firestore manual work)
1. Open `/admin` → **Teams**
2. Choose **Boys** and add all 16 teams with seeds 1–16
3. Choose **Girls** and add all 16 teams with seeds 1–16

### G) Add Site Info / Policies / Parents’ Corner (in Admin)
- `/admin` → **Site Info**: add sections like Locations, Apparel, Food, etc.
- `/admin` → **Policies**: add your carry-in / conduct rules, etc.
- `/admin` → **Posts**: publish updates + optionally pin them

### H) Fill the bracket (in Admin)
- `/admin` → **Bracket**
- Select each Round 1 game and enter:
  - Court
  - Time
  - Scores (when final)


### G) Deploy to Vercel
1. Create a GitHub repo and push this project
2. Go to Vercel → New Project → import the repo
3. Add env vars from `.env.example`
4. Deploy

### H) Set Firestore rules
Paste `firebase.rules.firestore` into Firestore Rules.

---

## Notes
- Bracket UI is optimized for phones (stacked rounds with clear cards).
- Team selection highlights only that team's games.
- Admin finalize triggers winner advance to the next game.

