# Frankenmerge — Workflow

## Game Flow

Players open the app, enter a room code, name, and role (Host or Player). The host sees the creature canvas and round controls; players see branch buttons and a command log. All clients sync via WebSocket (PartyKit).

The host advances through 5 rounds. Each round unlocks new body parts:

| Round | Parts | Mechanic |
|-------|-------|----------|
| 1 | Torso | Standard merge — unlocks everything else |
| 2 | Head, Left Arm, Right Arm | Parallel merges |
| 3 | Legs, Feet | Chained — foot rejects until its leg is merged |
| 4 | Hands | Conflict round |
| 5 | Shoes | Chaos round |

**Standard merge:** player clicks a branch → `MERGE` action → server checks `canMerge` (parent must be in main). If valid, the part attaches with a red seam; otherwise it floats orange and off-position.

**Round 4 — Conflict:** player clicks a hand branch → `START_CONFLICT` → ConflictScreen overlay appears (showing `<<<HEAD / === / >>>` markers) → players resolve together → `RESOLVE_CONFLICT` → part attaches.

**Round 5 — Chaos:** host fires `TRIGGER_CHAOS` → player buttons change to `git rebase --onto foot main shoe` → player sends `REBASE` action → part attaches.

After every attach, the server runs `validateTree`. When all 12 parts are correctly attached → **IT'S ALIVE!** and the Superlatives screen appears.

### Superlatives
- First to the Lab
- Most Prolific Surgeon
- Heroic Conflict Resolution
- Master Rebaser
- Final Stitch

Players can then reset and play again from the Join screen.

---

## State Machine

```
[*] → Lobby → Playing → Alive → Lobby
```

Inside **Playing**:
- Round1 → Round2 → Round3 → Round4 → Round5 (host advances each)
- Round4 sub-states: `HandAvailable → Conflicted → HandMerged`
- Round5 sub-states: `ChaosIdle → ChaosActive → ShoeRebased`

---

## Data Flow

All state lives on the PartyKit server. Clients send actions; the server runs `gameReducer` and broadcasts the new `GameState` to all connected clients.

Key actions and their payloads:

| Action | Sender | Effect |
|--------|--------|--------|
| `JOIN` | Player / Host | Receives current GameState |
| `MERGE { branch, playerId }` | Player | Reducer merges branch, broadcasts state |
| `NEXT_ROUND` | Host | Advances round, broadcasts state |
| `START_CONFLICT { branch }` | Player | Adds branch to `conflicts[]`, broadcasts |
| `RESOLVE_CONFLICT { branch }` | Player | Moves branch to `merged[]`, broadcasts |
| `TRIGGER_CHAOS` | Host | Sets `chaosTriggered: true`, broadcasts |
| `REBASE { branch }` | Player | Merges branch, sets `isAlive: true` when done |

---

## Part Dependency Tree

A part can only be merged if its parent is already in `main`.

```
main
└── torso
    ├── head
    ├── left-arm
    │   └── left-hand  [conflict — Round 4]
    ├── right-arm
    │   └── right-hand [conflict — Round 4]
    ├── left-leg
    │   └── left-foot
    │       └── left-shoe  [chaos — Round 5]
    └── right-leg
        └── right-foot
            └── right-shoe [chaos — Round 5]
```

Purple = conflict parts (Round 4) · Orange = rebase parts (Round 5)

---

## How to Play

### Setup

1. One person opens the app and clicks **Host (Big Screen)** — project this onto a shared screen or TV.
2. Every other player opens the app on their own device, enters the same **room code** and their name, then clicks **Join as Player**.
3. The default room code is `lab-001`; change it if you want a private room.

### The goal

Assemble Frankenstein's monster by merging all 12 body-part branches into `main`. Parts only attach correctly when their parent is already merged — wrong order makes them float. Win when `validateTree` passes (all 12 attached).

### Host controls

| Button | When | What it does |
|--------|------|--------------|
| **Next Round →** | Any time | Advances to the next round and unlocks new branches |
| **⚡ Trigger Chaos** | Round 5 only | Activates the rebase mechanic for shoes |
| **Reset** | Any time | Wipes all state and returns to Round 1 |

The host screen shows the creature building in real time on the left and the git graph on the right.

### Player controls

Each round, your screen shows the branches available for that round as clickable buttons that look like terminal commands. Button colour tells you the status:

| Colour | Meaning |
|--------|---------|
| Blue (active) | Ready to merge — click it |
| Dimmed / grey | Blocked — parent branch not yet merged; hover shows `needs: <parent>` |
| Red / flashing | In conflict — ConflictScreen overlay is open |
| Orange | Rebase mode — chaos has been triggered, click to rebase |
| Green ✓ | Already merged |

The **command log** below the buttons records every action you take, including rejections.

The **part status bar** at the bottom shows all 12 parts: `✓` attached, `⚠` floating (merged out of order), `⚡` in conflict, `·` unmerged.

### Round by round

**Round 1 — Branch + Merge**
Merge `torso` into `main`. This is a straight `git merge torso`. Everything else is blocked until torso is in.

**Round 2 — Parallel Branches**
`head`, `left-arm`, and `right-arm` are now available. All three branch off `torso`, so they can be merged in any order or simultaneously by different players.

**Round 3 — Chained Dependencies**
`left-leg` and `right-leg` unlock. Once a leg is merged, its foot unlocks. Feet are blocked until their leg is in — clicking them early prints a rejection in your log.

**Round 4 — Merge Conflict**
`left-hand` and `right-hand` appear. Clicking either one fires `START_CONFLICT` instead of a normal merge. A **ConflictScreen overlay** appears on every screen showing git conflict markers (`<<<HEAD / === / >>>`). Players work together to decide the resolution, then click **Resolve** — which fires `RESOLVE_CONFLICT` and attaches the part.

**Round 5 — Rebase (Chaos Event)**
`left-shoe` and `right-shoe` appear but are locked behind the chaos event. The host clicks **⚡ Trigger Chaos**. The shoe buttons change to `git rebase --onto <foot> main <shoe>`. Click the button to fire the `REBASE` action. Shoes need their foot merged first.

### Winning

When all 12 parts are attached the screen switches to **IT'S ALIVE!** and shows the Superlatives:

- **First to the Lab** — first merge of the game
- **Most Prolific Surgeon** — most total merges
- **Heroic Conflict Resolution** — resolved a conflict
- **Master Rebaser** — completed the rebase
- **Final Stitch** — the last merge that completed the creature

Click **Play Again** to reset and return to the Join screen.
