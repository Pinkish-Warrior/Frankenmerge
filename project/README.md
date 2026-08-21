# Frankenmerge

#### Video Demo: https://youtu.be/fBXFS4FpOLc

#### Description:

Frankenmerge is a live, synchronous multiplayer game that teaches git branching and merging by having players physically assemble a Frankenstein's-monster creature out of git branches. Every limb is a branch. A limb only attaches to the creature if its dependency — its parent branch — has already been merged into `main`. Merge a foot before its leg, and the foot doesn't just get rejected: if it somehow ended up in `main` anyway, it would render as a disconnected, orange-glowing "floating" part, visibly wrong. The game is won only when the underlying merge history is actually correct, not when the creature merely looks finished.

## The Problem It Solves

Git branching and merging are usually taught by reading about them or by working through isolated exercises where the "why" of merge order is abstract. Frankenmerge makes the dependency graph the entire point of the game: you cannot cheat your way to a working creature by clicking things in a convenient order, because the win condition walks the actual merge history and checks that every part's parent was merged before it. The creature is a skin over a real git state machine — the game only feels good to win when the git logic underneath was actually done right. I built it for my 01Founders mentees and anyone else learning git: people who can recite what "merge order matters" means in the abstract but benefit from seeing a limb visibly float, disconnected, the moment it's merged out of order.

## Tech Stack and Why

The frontend is React + TypeScript, built with Vite. Real-time multiplayer sync runs through PartyKit, which wraps a Cloudflare Workers-style room server: each game room is a single authoritative server instance (`party/index.ts`) that owns the canonical game state, applies every player action through one shared reducer, and broadcasts the updated state to all connected clients over WebSockets. I chose this over a peer-to-peer or client-authoritative model specifically because git merge order has to be validated centrally — if each client trusted its own local state, two players merging conflicting things at the same moment could desync the room from what "actually happened," which would undermine the entire teaching point of the game. Because PartyKit processes messages for a room one at a time, there's no race condition between two players merging simultaneously; the server is the single source of truth, full stop.

For the live git graph shown next to the creature, I wrote a custom SVG renderer (`GraphView.tsx`) driven directly off the same game state as the creature view, rather than reaching for a general-purpose git-visualization library. Both views — the creature and the graph — read from the exact same `merged` array and `attachStatus` function, so they can never drift out of sync with each other; there's only one source of truth being rendered two different ways. (A git-graph library, `@gitgraph/react`, was listed in `package.json` but never actually used in the code — removed during cleanup for this submission.)

## What Each File Does

- **`src/engine/tree.ts`** — the static dependency tree: every part, its parent branch, and which of the game's rounds unlocks it. This is the single source of truth for every rule in the game.
- **`src/engine/state.ts`** — the actual git logic: `canMerge` checks whether a branch's parent is already merged; `attachStatus` reports whether a merged part is correctly attached or "floating" (orphaned); `validateTree` walks the full state to confirm the win condition; `gameReducer` is a pure reducer applying every player action.
- **`party/index.ts`** — the PartyKit server. Holds the authoritative `GameState`, runs `gameReducer` on every incoming action, and broadcasts the result to the room.
- **`src/hooks/useGameRoom.ts`** — the client-side WebSocket hook. Connects to a room, replaces local state on every server broadcast, and exposes typed action senders (`merge`, `nextRound`, `reset`, etc.).
- **`src/App.tsx`** — routes between the join screen and the host/player views, and contains the round-advance gating logic (a round can't advance until every part in it is merged).
- **`src/components/CreatureView.tsx`** — the SVG creature itself; every part's opacity, position, and glow are derived purely from `attachStatus`.
- **`src/components/GraphView.tsx`** — the custom SVG git graph, described above.
- **`src/components/JoinScreen.tsx`, `ConflictScreen.tsx`, `SuperlativesScreen.tsx`** — the join flow, the merge-conflict UI (stretch goal, see Known Limitations), and the end-of-game superlatives screen.

## Design Decisions

The decision I debated hardest, before writing any game code, was how to validate a win. The tempting shortcut is to check "are all parts present in `main`?" — but that would let a player merge parts in any order at all and still win, which defeats the entire teaching purpose: the game would just be clicking buttons in a convenient order with a git skin painted over it. I decided upfront (documented in the project's own planning notes) that `validateTree` had to walk the full merge history and confirm parent-before-child order for every single part, not just count how many parts exist. `canMerge` also independently enforces this at the moment of merging, so a part can never even become "merged but out of order" in the first place for Rounds 1–3 — the two checks reinforce each other rather than one being a fallback for the other.

The second was choosing a server-authoritative model over letting clients merge state locally, discussed above under Tech Stack — correctness of shared state mattered more than minimizing server complexity here.

## Known Limitations and Future Work

This submission ships Rounds 1–3 (Branch + Merge, Parallel Branches, Chained Dependencies) as the complete, polished core.

Round 4 (Merge Conflict) has a fully interactive resolution screen — real conflict-marker syntax and "Accept Ours" / "Accept Theirs" buttons that correctly resolve game state. What it doesn't yet do is model an actual conflict arising from two players independently working the same branch: any single attempt to merge a hand branch triggers a pre-written "ours vs. theirs" conflict for that one player to resolve, rather than a conflict generated from two real diverging submissions. It teaches the resolution UX faithfully; it's a scripted version of the mechanic rather than the fully simulated one described in the project's design notes.

Round 5 (a "rebase chaos" event, where a branch is meant to be deliberately mis-based off `main` so players can practice rebasing it onto the correct parent) is the one genuinely unfinished piece: the "trigger chaos" flag and a `REBASE` action both exist, but no code path currently forces a branch onto the wrong parent to create the floating state the rebase is supposed to fix — `REBASE` currently behaves identically to a normal merge, just relabeled. It's out of scope for this submission and left as future work.

## AI Tool Usage

I used Claude (Anthropic) as a coding assistant throughout this project — for drafting game-engine logic, React components, and the PartyKit server, as well as for debugging a production build failure. All AI-assisted code was reviewed and modified by me, and every file with material AI assistance carries a generic in-code citation comment (`// AI-assisted: ...`), per CS50's requirement that AI usage be cited in code comments, not just here. This section is the one place the specific tool is named.
