# Frankenmerge — CS50x Final Project Video Script

Target: ≤ 3:00 total. Screencast + voiceover — no camera needed.

---

## 1. Opening slate — on screen, 5–10 sec

Static title card (or spoken while a title slide is up) showing, exactly as CS50 requires:

```
Frankenmerge
Tania Santana
GitHub: Pinkish-Warrior
edX: tRosa1975
London, UK
Recorded: 2026-08-21
```

No voiceover needed here — let it sit on screen for the full 5–10 sec so it's clearly readable.

---

## 2. What it is — one sentence, 10–15 sec

**Voiceover:**
> "Frankenmerge is a live multiplayer game that teaches git branching and merging by having players assemble a Frankenstein's-monster creature out of git branches — a limb only attaches if its parent branch is already merged."

**On screen:** cut to the join screen or a wide shot of the host view.

---

## 3. Live demo — 90–120 sec

This is the bulk of the video. Two windows side by side (or two tabs): host view on one side, player view on the other. Suggested beats:

1. **(15s) Show the join screen briefly** — room code, name, Host/Player toggle. Join as host in one window, player in the other.
2. **(20s) Round 1 — merge torso.** On the player screen, click `git merge torso`. Narrate: "This is the only thing that can merge right now — everything else depends on it." Point out the creature assembling on the host screen and the command log line: `$ git merge torso`.
3. **(25s) Round 2 — parallel branches.** Advance the round from the host. Show head, left-arm, right-arm all unlocking at once. Merge one or two. Narrate: "These three don't depend on each other, so they can merge in any order."
4. **(30–35s) Round 3 — the actual teaching moment.** Advance to Round 3. Point at a locked button (e.g. `left-foot`, showing `○ git merge left-foot — needs: left-leg`). Narrate: "This button is locked because its parent branch, the leg, isn't merged yet — exactly like a real git merge would refuse this." Merge left-leg first, then left-foot, and show the button unlock and the command log confirm it. This is the single most important shot in the whole video — it's the proof the game teaches real git logic, not just a visual toy.
5. **(10–15s, optional if time allows)** Briefly show the live git graph on the host screen updating in sync with the creature — same underlying state, two views.

---

## 4. Win-condition check — 15–20 sec

**Voiceover (over a shot of the completed creature or the git graph):**
> "The win isn't just 'are all the parts present' — the game walks the actual merge history and confirms every part's parent was merged before it. A creature that looks finished but was assembled out of order fails the check. That's what makes this about git, not just a drag-and-drop puzzle."

If you have time left in your 5-day sprint before recording and want to show a full "IT'S ALIVE!" moment, this is where it'd go — but with only Rounds 1–3 in scope, that requires actually finishing all of torso/head/arms/legs/feet on camera, which may not fit the time budget. Showing Round 3's lock/unlock moment (step 3.4 above) makes the same point faster and is the safer bet for a 3-minute video.

---

## 5. Close — 5 sec

**Voiceover:**
> "Frankenmerge — built for CS50x 2026."

Cut to black or hold on the final creature/graph shot.

---

## Notes

- Fill in the four placeholders in the opening slate before recording — GitHub username, edX username, city/country, and the actual recording date.
- Total runtime budget: slate (10s) + intro (15s) + demo (120s) + win-condition (20s) + close (5s) = **170s**, leaving ~10s of buffer under the 3:00 cap.
- Two browser windows/tabs is the simplest way to show host+player live without needing a second person on camera.
