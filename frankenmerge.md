# Frankenmerge — Git Workflow Game (One-Pager)

## Concept

A live, synchronous, multiplayer game where players build a creature (or vehicle) out of parts, and each part is a git branch. The twist that makes it teach git: **a part only attaches correctly if its dependency is already merged.** You cannot merge a shoe onto main if the foot and leg aren't merged first — it just floats, disconnected. The shared screen shows everyone's progress as one creature assembling itself in real time. The game wins when it's correctly assembled — which only happens if the underlying git operations were done in the right order.

Working titles: **Frankenmerge**, Branch Anatomy, Assembly Required, GitBod.

## Theme

**Recommendation: mad-scientist / creature-assembly theme** ("build a creature out of parts, bring it to life"). It's funnier, gives a built-in payoff moment ("It's Alive\!" animation when the creature is fully and correctly merged), and fits the "make it fun" goal better than a neutral object.

**Fallback: vehicle (car or bike)**, for audiences where a body-parts theme feels off (e.g. very corporate, younger audiences, or just a personal preference). Build the underlying dependency-tree engine theme-agnostic so you can re-skin between creature and vehicle without touching the git logic — same tree, different sprites.

Keep the framing generic ("mad scientist," "build-a-creature") rather than referencing any specific copyrighted character design, in case this ever gets shared or run publicly.

## Part-Dependency Tree (creature theme)

This is the actual git structure underneath. Each indent is a branch based on the line above it:

main (the lab table — starts empty)

└─ torso              (branch off main — first merge target)

   ├─ head            (branch off torso)

   ├─ left-arm        (branch off torso)

   │  └─ left-hand    (branch off left-arm)

   ├─ right-arm       (branch off torso)

   │  └─ right-hand   (branch off right-arm)

   ├─ left-leg        (branch off torso)

   │  └─ left-foot    (branch off left-leg)

   │     └─ left-shoe (branch off left-foot)

   └─ right-leg       (branch off torso)

      └─ right-foot   (branch off right-leg)

         └─ right-shoe(branch off right-foot)

13 parts total, depth up to 4 — enough for a 5-round arc with a real difficulty curve.

## Round Structure

| Round | Parts introduced | Git concept taught |
| :---- | :---- | :---- |
| 1 | torso | branch \+ merge, the basics |
| 2 | head, left-arm, right-arm | parallel branches off one base, merged independently |
| 3 | legs, feet | chained dependency / merge order — merging a foot before its leg visibly fails (it floats) |
| 4 | hands (conflict round) | two players assigned the *same* hand with different designs; merging both creates a visible collision that must be resolved together — a real merge conflict |
| 5 | shoes (recovery round) | host triggers a "chaos event": a shoe branch was accidentally created off main instead of off foot. Players must rebase it onto the foot to reattach correctly — teaches fixing a wrong base branch, a very common real mistake |

## Win Condition & Live Payoff

Main is validated against the full tree: every part present, attached to the correct parent, no orphans, no unresolved duplicates. When it passes, the creature animates ("It's Alive\!" — sits up, waves) on the shared screen, the round ends, and silly superlatives are handed out (Fastest Merge, Cleanest History, Most Heroic Conflict Resolution) so everyone gets a moment, not just the winner.

This also gives you the three modes from earlier for free:

- **Merge race** — first team to fully assemble wins, *and the finished graphic itself has to show the real solution* (see below).  
- **Untangle together** — start from a creature with parts already attached wrong (or duplicated) and the group fixes it.  
- **Open sandbox** — free-build, no win condition, just to explore before the timed rounds.

### Making the Solution Visible (merge race detail)

For the race to actually prove someone did the git workflow correctly — not just produce a creature that looks finished — the graphic needs to double as the answer key:

- **Seams \= merge commits.** Every attachment point on the creature (shoulder, hip, elbow, ankle) renders as a visible stitched seam, not a clean snap. Each seam *is* a real merge commit — clicking/hovering it shows the actual branch name and parent it merged in.  
- **Two synced views, one data model.** Run the creature view alongside a live gitgraph.js rendering of the same underlying state. The creature is the fun reading; the graph is the ground-truth reading. They're always in sync because they're rendered from the same git state, not two separate things that could drift apart.  
- **Validation checks topology, not just completeness.** The win check doesn't just ask "are all 13 parts present?" — it walks the merge history and confirms every part's parent was actually merged before it. A creature that looks done but was assembled out of order (or faked) fails the check.  
- **End-of-race "trace the seams" replay.** When a team wins, the host can trigger an animated rewind that walks through their actual merge order on the creature and the graph simultaneously — so the win doubles as a recap of *how* they solved it, not just a finish line.

This is also the fix for the earlier risk about gamification overtaking pedagogy: because the visible proof of winning is the real git graph (just skinned as a creature), there's no way to win by faking a complete-looking result without the merges underneath actually being valid.

## Build Roadmap

**Phase 0 — Paper playtest (no code).** Run the dependency tree and round pacing with 2–3 people using sticky notes or a whiteboard standing in for branches, or even just talking through real git commands in a shared terminal. Cheapest possible way to find out if the metaphor and pacing actually teaches and is fun, before writing any software.

**Phase 1 — Single-player prototype.** Build the visualization (gitgraph.js or a custom force-graph) and a simulated git state machine for one player. Parts attach/detach from a skeleton rig as branches/commits/merges happen. Validate that the "watch a creature assemble" payoff feels good solo, first.

**Phase 2 — Real-time multiplayer sync.** Layer in Yjs (CRDT) or a WebSocket server so multiple players' actions update one shared canvas live. Add the room/session/join-code model (Slido/Kahoot-style).

**Phase 3 — Game layer.** Timers, scoring, host-triggered chaos events, round structure, leaderboard/superlatives, separate host (big-screen) view vs. player (phone/laptop) view.

**Phase 4 — Live playtest.** Run it with a real small group (5–10 people) before any "real" workshop. Iterate on pacing, difficulty curve, and host controls (pause, skip round, reset a stuck player).

**Phase 5 — Polish.** Sound design, animations, theme swap (creature vs. vehicle skin), facilitator script/slides.

## Risks & Mitigations

**Gamification overtakes pedagogy.** If part-attachment becomes pure drag-and-drop with no visible git command, players have fun but don't learn git. *Mitigation:* always show the real command/action log next to the visual puzzle — the puzzle illustrates the command, it doesn't replace it.

**Live multiplayer sync breaks in front of a room.** Real-time state across flaky conference wifi is genuinely fragile, and a live demo failing is a real reputational risk. *Mitigation:* CRDT-based sync (Yjs) tolerates reconnects well; build a host "reset/skip player" escape hatch; stress-test on real conference wifi beforehand; keep an offline/local fallback mode for round 1\.

**Mixed skill levels in one room.** Experienced devs get bored, beginners get overwhelmed, at the same time. *Mitigation:* tiered difficulty — optional "advanced" side-challenges (extra rebase puzzles, conflict storms) for players who finish a round early.

**Conflict-resolution round teaches nothing if the UI is just random clicking.** *Mitigation:* the resolution screen should show a simplified version of real conflict markers, so resolving it is genuinely practicing the skill, not guessing.

**Scope creep — polish before the core loop is validated.** Animation/sound/theming is tempting to build early but doesn't tell you if the game teaches or is fun. *Mitigation:* do Phase 0 (paper playtest) before writing any code, no exceptions.

**Facilitator is a single point of failure.** Live synchronous games need someone confidently running timing, chaos events, and troubleshooting — if that's only you, one bad session and momentum dies. *Mitigation:* build a simple host console with obvious controls, plus a short "if X breaks, do Y" runbook you could hand to someone else.

**Join friction eats your limited live time.** Last-minute device/wifi issues right as a workshop starts are common. *Mitigation:* a lobby screen with a connection check before round 1 starts; don't make round 1 itself time-pressured.

## Open Decisions

- Final theme: creature vs. vehicle (or offer both as a skin choice)  
- Group size per session, and team size if running team mode  
- Whether round 4/5 (conflict, rebase) are mandatory or an "advanced" branch for faster groups

