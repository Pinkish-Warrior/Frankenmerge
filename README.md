# ⚡ Frankenmerge

A live multiplayer game where players build a Frankenstein creature by merging git branches — in the right order. A part only attaches correctly if its parent branch is already merged. Get the order wrong and limbs float, disconnected, in orange.

---

## Setup

Two terminals, both from this directory:

```bash
# Terminal 1 — real-time server
npx partykit dev

# Terminal 2 — frontend
npx vite
```

Open `http://localhost:5176/` in your browser.

---

## Joining a Game

On the join screen, enter:

- **Room code** — everyone in the same session uses the same code (make one up, share it with players)
- **Your name** — displayed in the room
- **Role** — Host or Player

One person joins as **Host**. Everyone else joins as **Player** with the same room code. Open a second browser tab to simulate a second player locally.

---

## Roles

### Host

The host screen is the shared view — put it on a projector or shared screen.

- **Left panel:** the creature, assembling in real time as players merge branches
- **Right panel:** a live git graph of `main`, showing every merge in the order it happened
- **Controls:** `Next Round →` advances the round for all players; `Reset` clears all state

The host does not merge branches. They run the room.

### Player

The player screen is each participant's individual view.

- **Creature (small):** reference view showing the current assembly state
- **Branch buttons:** the branches available this round — click one to merge it
- **Command log:** shows the real git command that fired (`git merge <branch>`) and whether it was accepted or rejected, with the reason

Each button shows its current state:

| State | Color | Meaning |
|---|---|---|
| `▶ git merge <branch>` | blue | available — click to merge |
| `○ git merge <branch>` | dim | locked — a dependency isn't merged yet |
| `✓ git merge <branch>` | green | already merged |

Locked buttons show `needs: <parent-branch>` so players know what to do first.

---

## The Creature

Parts render in three states on both the host and player creature view:

| State | Appearance | Meaning |
|---|---|---|
| Unmerged | ghost outline, ~12% opacity | branch not yet merged |
| Floating | shifted off-position, orange glow | merged into main but parent wasn't merged first — orphaned |
| Attached | full opacity, red stitched seam at joint | correctly merged in order |

When all 12 parts are correctly attached, the creature displays **"IT'S ALIVE!"** in pulsing green.

---

## Rounds

The host advances rounds with `Next Round →`. Each round introduces new branches and teaches a new git concept.

### Round 1 — Branch + Merge

**Parts:** Torso

The torso is the only available merge. It branches off `main` and is the foundation everything else attaches to. Nothing else unlocks until torso is merged.

```
main
└─ torso
```

### Round 2 — Parallel Branches

**Parts:** Head, Left Arm, Right Arm

All three unlock simultaneously once torso is on main. They can be merged in any order — this is the point. Multiple independent branches off the same base, merged separately.

```
torso
├─ head
├─ left-arm
└─ right-arm
```

### Round 3 — Chained Dependencies

**Parts:** Left Leg, Right Leg, Left Foot, Right Foot

Order now matters within a chain. Merging `left-foot` before `left-leg` is rejected — the button locks and the log shows the reason. If somehow forced, the foot renders as floating (orange, off-position) rather than attached.

```
torso
├─ left-leg
│  └─ left-foot
└─ right-leg
   └─ right-foot
```

### Round 4 — Merge Conflict *(coming in Day 3)*

**Parts:** Left Hand, Right Hand

Two players are assigned the same hand branch with different versions. Merging both creates a conflict. Players resolve it together using a conflict-marker UI — the same structure as a real git conflict file.

### Round 5 — Rebase Chaos Event *(coming in Day 3)*

**Parts:** Left Shoe, Right Shoe

The host triggers a chaos event: a shoe branch was accidentally created off `main` instead of off `foot`. It renders floating. Players must rebase it onto the correct parent branch to reattach it — practicing the most common real-world rebase use case.

---

## Win Condition

The game validates topology, not just completeness. When all 12 parts are merged, the engine walks the full merge history and confirms:

1. Every part is present in `main`
2. Every part's parent was merged before it
3. No parts are floating (merged out of order)

A creature that looks finished but was assembled in the wrong order fails the check. The win is only triggered when the underlying git structure is actually correct — the creature is the visible proof, not a shortcut around it.

---

## Part Dependency Tree

```
main
└─ torso                      (Round 1)
   ├─ head                    (Round 2)
   ├─ left-arm                (Round 2)
   │  └─ left-hand            (Round 4)
   ├─ right-arm               (Round 2)
   │  └─ right-hand           (Round 4)
   ├─ left-leg                (Round 3)
   │  └─ left-foot            (Round 3)
   │     └─ left-shoe         (Round 5)
   └─ right-leg               (Round 3)
      └─ right-foot           (Round 3)
         └─ right-shoe        (Round 5)
```

12 parts total. Depth up to 4. Five rounds with a real difficulty curve.

---

## Classroom / LAN Setup

For running with a group of students on the same WiFi, the preferred approach is to keep all traffic local. If the network blocks it, fall back to the cloud deployment.

### Find your local IP

```bash
# macOS
ipconfig getifaddr en0
# Linux
hostname -I | awk '{print $1}'
```

### Option 1 — Local (preferred)

Two terminals on the presenter's machine:

```bash
# Terminal 1 — PartyKit server
npx partykit dev

# Terminal 2 — frontend (bound to all interfaces so students can reach it)
npx vite --host
```

Hand students this URL (replace with your actual IP):

```
http://192.168.1.x:5173/?pk=192.168.1.x:1999
```

The `?pk=` parameter tells the app to connect to your local PartyKit server instead of the cloud. All traffic stays on the LAN — no internet required.

### Option 2 — Cloud fallback

If the network blocks local connections, switch to the deployed app:

```bash
npx partykit deploy
```

Then hand students the deployed URL (no `?pk=` param needed — it uses the cloud server automatically).

### Switching on the fly

No rebuild is needed to switch between local and cloud. The `?pk=` URL parameter overrides everything:

| Scenario | URL to share |
|---|---|
| Local LAN | `http://<your-ip>:5173/?pk=<your-ip>:1999` |
| Cloud fallback | `https://<your-deployed-app>` |

---

## Known Issues

- Production build fails — TypeScript strict mode conflicts with PartyKit server typings. Dev server (`npx vite`) works fine.
- Round 4 (conflict) and Round 5 (rebase chaos) show a concept card but the interactive mechanics are not yet built.
