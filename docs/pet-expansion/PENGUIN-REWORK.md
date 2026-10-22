# Penguin frost caster

This branch replaces the penguin's five skill rows. It preserves IDs 31–45,
learned ranks, gear and the three passive slots. It uses the existing
`SRO_ATTACK_PET_EXPANSION=on` gate; off retains native companion behavior.
The canonical tuning source is [pet-design.json](pet-design.json), `treeSkills`.
The older `skills` array is historical, not the live three-book tree.

## Books

Books unlock at pet levels 10 / 40 / 90 and retain the existing rank and
previous-book requirements. The two actives can be dragged onto the skill bar.
They share cooldowns with the other books in their own row.

| Row | Book I | Book II adds | Book III adds |
| --- | --- | --- | --- |
| Ice Lance | 15 m cast; 120–300% magic damage by rank; 40% frostbite chance; 6 s cooldown | Pierces two other enemies in a forward line | +50% damage against targets already frostbitten before the hit |
| Blizzard | Targeted 5 m storm; four hits, one second apart; 40–100% magic damage per hit; 20 s cooldown; at most eight targets per pulse | 7 m radius; frostbite slow | Final pulse freezes enemies present at all four pulse samples |
| Shatter | +10–20% damage against frozen/frostbitten enemies | Owner attacks also gain the bonus | Frozen kills burst for 50% of the killing action's damage, hitting up to five other enemies within 5 m |
| Arcane Resonance | Penguin magic actions build up to five stacks, lasting 8 s; +2–5% magic attack per stack | Owner magic actions build an independent pool; +3–6% per stack | +4–7% per stack; at five penguin stacks, the next active repeats once and consumes those stacks |
| Frozen Hourglass | Penguin magic hits build five charges; the next active consumes them and recovers 2 s of that row's cooldown | Owner magic actions also build the shared charges | Spending charges also extends that spell's frostbite/slow by 2 s |

Damage percentages multiply the pet's native magical attack action. Gear,
resistance, block and normal combat formulas still apply. Freeze/frostbite
use the existing status engine, including resistance and native durations.
Hourglass's recovery is currently a fixed 2 s at every rank; its books add
owner charging and duration extension. Balance remains provisional.

## Combat and lifecycle rules

- Ordinary-world PvE only: no player targets, job/free-battle or instanced-world
  bonuses. The living owner and penguin must remain within 20 m, outside town.
- The penguin approaches only to its 15 m casting reach. Actions have a 600 ms
  windup. It retains its retail model and attack pose; frost effects and sounds
  reuse published wizard resources.
- One successful action grants one counter increment, regardless of victims
  or multiple impacts. Storm repeat pulses and echoed spells grant no charges.
- A full Resonance pool is spent only on the penguin's next active. The owner
  pool grants magic attack; it does not duplicate owner spells.
- Echoes use the normal damage/reward path without a second cooldown or cost.
  The original action starts the next charge cycle at one.
- Hourglass recovery floors at the current time. The existing equipment
  cooldown-reduction cap still applies before this flat recovery.
- A storm snapshots its center and damage row, checks population/range/line of
  sight on each pulse, and admits at most eight monsters per pulse. At most
  four storms can exist per pet, including echoes. Late ticks do not replay
  missed damage in a burst.
- Native damage/status/reward owners commit all HP changes. Shatter's credited
  secondary damage cannot recursively trigger another Shatter.
- Resonance/Hourglass progress and storms are session state; they are not saved
  to the database. Separation, death, unsummoning, logout or eligibility loss
  clear them. Unslotting clears that passive's progress. No schema migration.

## Client contract and resources

Penguin-only `0x3FB6` counter payloads append three bytes to the existing
17-byte payload: penguin Resonance, owner Resonance and Hourglass (all 0–5).
Other pets retain their previous wire shape. Malformed counters are rejected
atomically. Skill and owner buff icons display counters and a ready highlight.

Native emote signals D0–D2 identify Lance; D3–D5 identify Blizzard; D6 is
Shatter. The existing bounded effect lane consumes these target-anchored
signals. No PK2 files are modified. The new renderer uses already-published
`wizard_cold_bolt_b.efp`, `wizard_cold_snow_b.efp`, and wizard frost WAVs.

## Verification checkpoint — 2026-10-21

- [x] Canonical design exported to server/shared/client projections.
- [x] Client production TypeScript check.
- [x] Full Go module tests; focused action/companion regression tests.
- [x] Server linter (zero issues).
- [x] 32 client regressions: descriptions, counter decoding, frost resource
  references/timing, ground effects surviving despawn, and existing wolf clips.
- [x] Public-command/fake-clock tests: all active books, four storm pulses and
  final freeze, forward-only piercing, exact Hourglass +2 s status extension,
  cooldown recovery, owner pool book gates/expiry, real echo damage and frozen
  kill splash. Native-off cleanup, cover breaking final-freeze eligibility,
  echoed storms and legacy queue town restrictions are covered.
- [x] Live authenticated player connection: all three Lance/Blizzard books
  committed against ordinary Mangyang/Big-Eyed Ghost monsters; native frost
  signals and shared-row cooldowns arrived. Owner magic hits advanced counters
  and raised actual character magic attack; expiry removed the bonus.
- [x] Live four-pulse/freeze, frozen-kill burst, damaging echo and exact 2 s
  Hourglass refund on native level-30 giants. See the
  [2026-10-22 acceptance report](PENGUIN-LIVE-ACCEPTANCE-2026-10-22.md).
- [ ] Visual acceptance of frost effects/sounds and ranged movement.

The broader source pipeline passes its individual portable checks, but its
server race gate could not run: `go: -race requires cgo; enable cgo by setting
CGO_ENABLED=1`. A compatible C compiler is not configured in this shell.
The in-app browser still rejects the game URL after the user's reload;
protocol combat tests cannot certify how the rendered effects look or sound.

### Live evidence

Final deployment: Agent v1 and GameWorld v2 each running with one healthy
allocation, expansion enabled. Post-deployment authenticated smoke reached the
world with LabPenguin GID 33554434, HP 21292 and a valid 20-byte counter push
(`.state/penguin-smoke-final.log`). Vite port 5180 serves this worktree.

Ignored logs: `.state/penguin-live-combat.log` and
`.state/penguin-live-advanced.log` record the six book signals D0–D5.
`.state/penguin-live-recovery-mp.log` records owner Resonance rising to five,
actual magic attack changing from 56–63 to 68–76, and returning to 56–63
after expiry. Hourglass reached five charges. Earlier probes canceled a pet
approach before release or ran the owner out of MP; those are not accepted
refund/echo tests. The exact 6 s → 4 s refund remains integration-test proof.

Tests used only normal authenticated gameplay and existing inventory. No DB
grants, rate changes, pet rank changes or GM commands. LabBlader was untouched.
LabPetTest remained alive at 13226 HP. Ordinary pet HP and owner MP potions were
consumed; owner/pet movement, satiety and combat rewards were not reset.

## Continue safely

### Follow-up: echo corrections, 2026-10-21

GameWorld v3 is deployed and healthy (Agent remains v1). Two failing regression
tests exposed and now cover these corrections:

- Echoes publish a separate native cast token and a complete result to the
  owner. Previously HP changed, but the echo reused the windup token and its
  result was omitted from the owner's returned frames.
- Echo kills of frozen monsters trigger Shatter. They still cannot feed
  Resonance/Hourglass or recursively trigger further spell actions.

All server module tests and golangci-lint pass; 23 focused client tests pass.
Reports: `apps/server/.state/penguin-followup-{tests,lint}.log`,
`.state/penguin-followup-client.log`, `.state/penguin-followup-deploy.log`.

Live evidence in `.state/penguin-targeted-live.log`: a normal level-48 White
Spider had 3909 HP, and Blizzard III's initial native release dealt 4060 fatal
damage. This confirms why ordinary targets could not prove four pulses; it
does **not** establish freeze, echo or Shatter burst acceptance. Owner survived
at 13226 HP; normal HP potions, one reverse scroll and one return scroll were
used. No account privilege, rank, gear or drop-rate changes were made.

Reliable remaining live acceptance needs a surviving target (a low-level giant).
The user approved a bounded LabPetTest GM grant on 2026-10-22. The giant tests
are now complete, the original `global-official:asd2` allowlist is restored,
and LabPetTest is no longer privileged. The stale `asd2` entry still names no
existing character. Do not grant GM again without a new authorized test scope.
Browser visual/audio acceptance remains pending.

The new ignored `.state/penguin-console.mjs` keeps one authenticated session
open and accepts explicit normal gameplay commands. It answers alpha PING,
uses increasing movement request IDs, and never auto-cancels a spell after a
fixed delay. Watch the committed TRAIN frame before issuing `follow` to stop
basic attacks while a storm continues. Its row-I timer starts at offset 9;
row II starts at `16 + rowIKindLength` (kind-length byte 15), not offset 17.
The console decoder now uses this correct offset; earlier probes did not.
Movement acknowledgements publish a goal, not proof of arrival; terrain/bridge
rails can stop a straight-line route. Do not repeatedly send request ID 1.

Latest saved position: region 23431, x1075.8698, y10.7001, z307.9424, outside
Hotan's south bridge. Penguin's last recorded HP was 18268; owner 13226. The
test socket is closed and combat canceled. Read fresh state before resuming.

1. Read this checkpoint and the ignored `.state/REVIEW-RESUME.md` for the current
   deployment and test character position before acting.
2. Regenerate design after any JSON change: `python scripts/tools/pet_design_export.py`.
3. Re-run action/companion and client pet tests, then deploy the matched Go
   binary with the expansion flag on. Vite serves this worktree on port 5180.
4. Test each active book, owner magic counters, freeze eligibility and cooldown
   recovery through normal player commands. Preserve LabBlader. Keep test
   characters alive and record any potion consumption or deaths honestly.
5. Once browser access works, visually verify the native penguin cast pose,
   fixed-position storm, hit effects, sounds and owner-ready icons. Storm
   follow-up damage currently sends native HP/status updates rather than
   separate floating damage numbers.
6. Leave existing wolf work in `WOLF-REWORK.md` untouched. Penguin changes are
   on `feat/attack-pet-penguin-rework`; do not silently fold that separate
   uncommitted wolf diary into a penguin commit.

### Latest checkpoint: surviving-target acceptance, 2026-10-22

Read [the live report](PENGUIN-LIVE-ACCEPTANCE-2026-10-22.md) before repeating
tests. A real delivery bug was fixed: storm pulses damaged monsters but their
HP/status frames excluded the owner. `advancePenguin` now returns those frames
through the existing private pet batch while retaining observer publication.
The regression checks owner HP on every pulse and the final native freeze.

All four requested advanced gameplay checks now have captured live evidence.
No tuning was changed to make targets survive. Temporary trace logging was
removed. Full server tests, focused penguin regressions, golangci-lint and
diff checks pass. The existing client tests were not rerun for this server-only
delivery fix; prior results remain recorded above. Rendered effects/sounds and
the unavailable cgo race gate are still separate, unverified checks.

Final stack after the stopped development agent was restored: Agent v0 and
GameWorld v3, both healthy. These version numbers belong to the restarted
Nomad agent, not the earlier v3 deployment. GameWorld release ID:
`813830f56cb577572299f474149706d586c1aa52ca33739a135b3892ff5690bf`.
LabPetTest is alive in Hotan, region 23687, x1138/y250/z153, HP13226;
LabPenguin HP16945. GM revocation was checked in the DB and by a refused
command after a fresh login. Combat/test sockets are closed. All source remains
uncommitted on `feat/attack-pet-penguin-rework`.
