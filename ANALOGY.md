# Frankenmerge — The Analogy

## The Big Idea

In the story of Frankenstein, a scientist builds a creature by assembling parts from different sources — each piece carefully chosen, each connection deliberately made. Get the order wrong, sew the wrong parts together, or attach a limb before the body is ready, and the creature won't come to life.

**Frankenmerge uses that same idea to teach how software teams build things together using git.**

---

## If You've Never Used Git

Git is a tool that lets many people work on the same project at the same time without overwriting each other's work.

Imagine a team of surgeons operating on the same creature — but each surgeon is in a different room, working on a different body part. Without a system, they'd crash into each other. Git is that system. It gives each surgeon their own workspace (called a **branch**), and when the work is ready, it brings the pieces together (called a **merge**).

In Frankenmerge, every player is a surgeon. Every branch is a body part. The creature on screen is the project — assembling in real time as the team merges their work.

---

## The Creature Is the Codebase

| Frankenstein | Git |
|---|---|
| The creature | The project / codebase |
| A body part | A feature or piece of work |
| Dr. Frankenstein's lab table | The `main` branch — the official, working version |
| A surgeon's operating room | A feature branch — an isolated workspace |
| Sewing a part onto the creature | Merging a branch into `main` |
| The creature coming to life | The project being complete and working |

When a body part is successfully merged, it attaches to the creature with a red seam — just like stitches. When something goes wrong (merging out of order), the part floats off to the side, orange and disconnected — a limb that doesn't belong anywhere yet.

---

## Why Order Matters — Dependencies

You can't attach a hand before the arm exists. You can't attach a foot before the leg is there. This is not just anatomy — it's how real software works too.

In software, features are often built on top of each other. A login page needs a user account system first. A checkout flow needs a shopping cart first. Skipping ahead creates broken, "floating" code that has nowhere to connect to.

In Frankenmerge, the game enforces this:

- **Torso first** — everything branches off it, just like a project needs a foundation
- **Arms before hands** — you build the bigger structure, then the details
- **Legs before feet before shoes** — each step depends on the one before it

If you try to merge a part whose parent isn't in `main` yet, the creature's body rejects it — the part floats in orange. The game shows you *why* in the command log: `needs: left-leg`.

---

## Round by Round — Git Concepts as Surgical Challenges

### Round 1 — The First Cut: Basic Merge

**What happens:** Everyone merges the torso.

**The git concept:** Creating a branch, doing some work, and merging it back.

This is the most fundamental thing in git. You take the main version of the project, branch off it to do your work safely, then bring it back. In the creature, this is the very first act of surgery — without the torso, nothing else can attach.

---

### Round 2 — Many Surgeons, One Table: Parallel Branches

**What happens:** Three parts (head, left arm, right arm) become available at the same time. Multiple players can merge them independently, in any order.

**The git concept:** Parallel branches — multiple people working on separate features at the same time.

This is how most software teams work day to day. Different people work on different things simultaneously. Git keeps their work separate until it's ready to merge. The order doesn't matter here — head, arms, and torso don't conflict with each other. Any sequence works.

---

### Round 3 — The Chain: Dependencies in Order

**What happens:** Legs unlock, then feet (but only after legs). Try to merge a foot before its leg and you get rejected.

**The git concept:** Chained branches — some work genuinely depends on other work being done first.

In real teams, a feature branch is often built *on top of* another feature branch. If that foundation hasn't made it into `main` yet, the dependent branch has nothing to stand on. The game makes this visible: a foot with no leg attached just floats.

---

### Round 4 — Two Surgeons, One Hand: Merge Conflict

**What happens:** A hand branch is triggered and a conflict screen appears, showing both versions of the same part. Players must resolve it together before the part can attach.

**The git concept:** Merge conflicts — two people edited the same thing in different ways, and git can't automatically decide which version to keep.

This is one of the most feared moments for new developers. It looks like this in a real terminal:

```
<<<<<<< HEAD
your version of the code
=======
their version of the code
>>>>>>> feature-branch
```

The conflict markers show both versions side by side. Someone has to read both, understand what each person intended, and write the final version that keeps the best of both. In Frankenmerge, the whole group sees this together — it's a conversation, not a crisis.

---

### Round 5 — The Wrong Table: Rebase

**What happens:** The chaos event reveals that the shoe branches were accidentally created off `main` instead of off `foot`. They can't attach where they are. Players must rebase them — replanting the branch onto the correct parent.

**The git concept:** `git rebase --onto` — moving a branch that started in the wrong place to where it should have begun.

In real life, this happens when someone branches off an old or wrong version of the code. Rebase picks up that branch's work and replays it from the correct starting point. It's like a surgeon realising they prepared a limb for the wrong body — instead of throwing it away, they reposition it.

The command the game shows — `git rebase --onto foot main shoe` — means: *take the shoe branch, find the commits it added on top of main, and replay those commits on top of foot instead.*

---

## The Conflict Screen — Up Close

When a conflict happens, every screen shows the conflict markers:

```
<<<<<<< HEAD
(the version already in main)
=======
(the version from the branch being merged)
>>>>>>> branch-name
```

This is identical to what appears in a real code editor during a git conflict. In the game, the group talks through it — which version is right? Or is the answer a combination of both? Someone clicks **Resolve** and the part attaches. In real life, a developer edits the file to write the final version, deletes the markers, and commits the result.

The game removes the fear of this moment by making it collaborative and visible, not something that happens alone at 2am.

---

## The Git Graph — Reading the Surgery Log

The right side of the host screen shows a live git graph — a visual history of every merge in the order it happened. Each node is a merge commit. The branching lines show where each branch started and where it landed.

Real git graphs look exactly like this. Tools like `git log --graph`, GitHub's network view, and IDE integrations all show the same structure. After playing Frankenmerge, that graph stops being abstract — it's the creature's assembly history.

---

## Why the Creature?

The creature is a metaphor that works on multiple levels:

- **It's incomplete until every part is there** — just like software that can't ship until every feature is merged
- **Parts that float are a visible warning** — in real codebases, "floating" code is code that was merged before its dependencies, causing bugs that are hard to trace
- **It only comes to life when the structure is correct** — the win condition isn't just "all parts present" but "all parts correctly connected." A creature that looks finished but was assembled wrong fails the check. Software that runs but has the wrong architecture under the hood will cause problems later.

The moment the creature comes to life — **IT'S ALIVE!** — is the moment the team's git history is actually clean.

---

## Glossary

| Term | Plain English |
|---|---|
| **Repository (repo)** | The project — all its files and full history |
| **Branch** | A private copy of the project where you do your work without affecting anyone else |
| **Commit** | A saved snapshot of your changes, with a message explaining what you did |
| **Merge** | Bringing your branch's changes into the main version |
| **Conflict** | Two people changed the same thing differently — git asks a human to decide |
| **Rebase** | Moving your branch to start from a different point in history |
| **main** | The official, stable version of the project that everyone branches off and merges back into |
| **HEAD** | Where you currently are in the history — the latest commit on your current branch |
