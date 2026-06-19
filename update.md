# Frankenmerge — Build Update

**Date:** 2026-06-19  
**Status:** Days 1 & 2 of 3 complete. Playable multiplayer prototype running locally.

---

## What's been built

### Day 1 — Git Engine + Multiplayer Foundation

**`src/engine/tree.ts`**  
Defines all 12 creature parts as a typed dependency tree. Each part knows its required parent branch and which round it unlocks. This is the single source of truth for every game rule.

**`src/engine/state.ts`**  
The core git state machine:
- `canMerge(branch, merged)` — returns false if the parent branch isn't in main yet
- `attachStatus(branch, merged)` — returns `attached`, `floating`, or `unmerged`
- `validateTree(merged)` — walks the full merge history to confirm every part is correctly attached (not just present)
- `gameReducer` — pure reducer handling MERGE, NEXT_ROUND, and RESET actions

**`party/index.ts`**  
PartyKit server. Holds authoritative game state server-side. On any player action, runs the reducer, then broadcasts the updated state to all connected clients. New players receive full current state on connect.

**`src/hooks/useGameRoom.ts`**  
Client-side hook. Connects to the PartyKit room via WebSocket, replaces local state whenever the server broadcasts an update, and exposes `merge`, `nextRound`, and `reset` actions.

---

### Day 2 — Creature Visualization + Split Views

**`src/components/CreatureView.tsx`**  
SVG Frankenstein creature with all 12 parts:
- Flat-top head with glowing red eyes, stitched mouth, and neck bolts
- State-driven rendering: unmerged parts are ghost outlines (12% opacity), floating parts shift off-position in orange with a glow, correctly attached parts render at full opacity
- Red dashed seam lines appear at each joint when a part is correctly merged
- "IT'S ALIVE!" text pulses green when all 12 parts pass the topology validator

**`src/components/GraphView.tsx`**  
Custom SVG git graph rendered from live game state:
- Vertical main branch line with a node per merge event
- Branch lines fan out by dependency depth (deeper parts sit further right)
- Color-coded: green = attached, orange = floating, dark = unmerged
- Round badges on each part; orphan warning on floating branches

**`src/components/JoinScreen.tsx`**  
Entry screen: room code + player name + mode choice (Host or Player). Shared room code is how players connect to the same game session.

**`src/App.tsx`**  
Routes between join screen, host view, and player view:
- **Host view:** full-size creature on left, live git graph on right, round controls and reset
- **Player view:** small creature for reference, branch buttons (locked/unlocked/merged), real git command shown on every action, command log

---

## How to run

Two terminals, both from `Frankenmerge/`:

```bash
# Terminal 1 — PartyKit real-time server
npx partykit dev

# Terminal 2 — Vite dev server
npx vite
```

Open `http://localhost:5176/` — enter a name, pick Host or Player. Repeat in a second tab for the other role.

---

## Game flow (what works today)

| Round | Parts | Behaviour |
|---|---|---|
| 1 | torso | Only available merge. Locks everything else until done. |
| 2 | head, left-arm, right-arm | All three unlock in parallel once torso is attached. |
| 3 | legs, feet | Foot rejects merge until its leg is in. Floating visible if forced. |
| 4 | hands | Wired in the round card; conflict mechanic not yet built (Day 3). |
| 5 | shoes | Rebase chaos event defined; not yet triggerable (Day 3). |

---

## What's left — Day 3

- **Round 4 conflict screen** — two players assigned the same hand with different versions; merging both triggers a conflict UI with real-looking conflict markers to resolve together
- **Round 5 chaos event** — host triggers "shoe was branched off main by mistake"; players must rebase it onto foot
- **Host controls polish** — pause, skip round, reset individual player
- **End-to-end playthrough** — run all 5 rounds on two real devices, fix any broken state transitions
- **Superlatives screen** — "Fastest Merge", "Most Heroic Conflict Resolution" etc. shown at game end

---

## Known issues

- Production build fails (TypeScript strict mode conflicts with partykit's server typings and missing `@types/node`). Dev server works fine; fix needed before any deployment.
- Browser screenshot tools time out due to the persistent PartyKit WebSocket keeping `document_idle` from firing. Does not affect gameplay.
- Round 4 and 5 buttons appear in the UI but clicking "Next Round" into them shows the concept card without the actual conflict/rebase mechanics (coming Day 3).
