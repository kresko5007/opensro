# Crow rework — support kit

**Current verification (2026-10-23):** Stormbrood replaces Exposing Mark (49–51).
Latest tuning: Mana Spring restores **10% actual damage as MP at every rank**.
Tailwind stacks and grants speed in safe zones, including nearby party in III.
Death burst remains **500% normal clone attack**, before mitigation.
All five crow rows have owned feather particle animations; see latest section.
Live ten-summon cap and full ten-minute expiry passed: ten eggs hatched, all ten
clones coexisted, cast11 was refused without charge loss, then all ten expired
with exactly one wind burst each (600.072–600.077s). The owned translucent spiral
wind effect was observed in the browser and softened after visual review.
Original crow training/gear and observer position/vitals restored; no GM granted.
All12 client gates, full action/companion/domain tests and scoped Go lint pass.
Source remains uncommitted; unrelated WOLF-REWORK.md edits are preserved.
Detailed current acceptance and evidence are in the final section below.




Implemented on `feat/attack-pet-crow-rework`, based on penguin merge commit
`e40e506b`. Changes remain uncommitted. Preserve unrelated WOLF-REWORK.md edits.

## Agreed behavior

Tailwind replaces Swift Wings in passive row four, preserving book IDs55–57,
learned ranks, and the existing10/40/90 unlocks.

- I: gain one movement-speed stack after every5 seconds without dealing or
  taking damage. Maximum10. Any damaging hit removes all stacks and starts a
  fresh five-second wait. Standing still also charges; movement is not required.
- II: at10 stacks, the next damaging hit dealt OR received attempts a2-second
  stun on that enemy, then consumes all stacks. User explicitly confirmed both
  directions. Native resistance and unique-monster immunity remain in force.
- III: the owner and nearby party members within20 m receive independent
  counters. One member taking/dealing damage does not consume another's stacks.

Existing expansion eligibility applies: living nearby summoned crow, slotted
learned book, supported normal world, no town/job/free-battle benefit. Stuns are
PvE; damage against players still removes travel stacks. Direct physical/magical
hits, later skill stages, credited effect hits and periodic damage reset stacks.
Misses, blocks and fully absorbed zero-damage hits do not. Crow attacks do not
count as the owner's attacks for this passive.

Movement is now 5% per stack in every book/rank: ten stacks grant 50%.
Books II/III add the stun and party scope; existing rank prerequisites remain.
Multiple crows contribute the strongest speed bonus, never multiplied grants.
Unsummon, death, separation, slot/book change, party departure and logout remove
grants. Charges are transient and never saved to the character database.

## Code and tuning

- Canonical values/descriptions: `docs/pet-expansion/pet-design.json`.
  Run `python scripts/tools/pet_design_export.py` after editing it; generated
  server/client/build copies must stay matched.
- `apps/server/internal/game/action/pettailwind.go` owns grants, timing, range,
  damage consumption, native stun resolution and movement publication. Constants:
  five-second period, ten-stack cap; stun duration2 seconds; party radius20 m.
- Movement reaches the actual world mover and native0x376F observer speed pair.
  It preserves roots/slows and combines with existing native movement modifiers.
- Private0x3FB7 packet: recipient u32, book u8, stacks u8, movement-percent x10 u16.
  The client validates the complete frame before updating state. Owner and party
  HUD show their own stacks, movement bonus and full-stack stun readiness. The
  pet tree also shows the owner's stack count. HUD follows the existing attack
  pet expansion display toggle.
- No new animations or feather attack rework yet. The remaining crow skills are
  unchanged apart from Mana Spring, documented below.

## Verification and continuation

Deterministic tests cover the five-second boundary, cap, real world movement,
all three tiers, native stun application, blocked hits, timer restart, independent
party damage consumption, range/departure, unsummon, book changes and feature off.
Client tests cover atomic packet rejection, reset, tooltip contents, recipient HUD,
readiness and display toggle. Action/companion suites and scoped Go lint pass;
source-portable15 gates and client-source5 gates passed during this implementation.

Local Nomad and Vite were stopped at the start of live verification. Restarted
the same worktree Nomad data directory and preserved hub cluster/authority paths.
Pet expansion remains on; original GM allowlist unchanged. No GM grants, item
grants, character edits, schema migrations or drop-rate changes.

Live verification resumed on 2026-10-22 after the user reloaded. World loading
then exposed a missing generated main-branch guide image (`gd_control.png`).
Rebuilt the existing `guide` asset family from the supplied v1.150 assets:
48 published files, one native-ui pack rebuilt; no source workaround or PK2 edit.
World entry now succeeds.

Live LabPetTest/LabCrow (both level 90), Tailwind III rank 1:
- Stationary counter advanced to 10/10 and displayed "Stun ready".
- A normal outgoing hit on a level-46 Ultra Blood Devil consumed all ten stacks.
- Counter restarted and reached 10/10 again; character remained at full HP.
- Skill tooltip, skill-icon counter and owner HUD render correctly.
- Evidence: `E:/CodeProjects/SRO/outputs/pet-design-codex/tailwind-live.png`.

The target died on the first hit, so this does NOT visually prove the two-second
stun. Incoming stun and independent two-client party behavior are covered by
server tests but still need live acceptance. Next: use a surviving target for
incoming/outgoing stun, then a second party client for independent stacks/range.
No GM grant, DB edit, pet reset or item grant was used. LabBlader is unchanged.
Client remains open with LabCrow summoned, Tailwind fully charged, full player HP,
in Eastern Hotan near X588/Y228. Changes remain uncommitted.

## Mana Spring — 2026-10-22

Replaces Carrion Feast in passive row three (IDs 52–54); existing learned ranks
and 10/40/90 book progression carry over. It is a passive, not a manual cast.

- All books: restore owner MP equal to 5% of bird damage at rank 1, +1 percentage
  point per rank (14% at rank 10). This is provisional tuning; +skills use the
  existing effective-rank rules. It costs no enemy MP and also works on kills.
- II: each living party member within 20 m also receives the same MP amount.
  Recovery is not divided among recipients. The owner's eligible crow is required.
- III: every damaging bird attack also removes 500 ms from each recipient's
  running character skill cooldowns. Both native reuse maps are shortened once,
  never below the current time. Item cooldowns, casting and animation gates stay
  unchanged. Several impacts/victims still pay the cooldown recovery only once.
- No recovery from misses, blocks, zero HP damage, PvP, failed attacks or a
  disabled expansion. MP uses HP actually removed, excluding native overkill
  display damage. Existing recovery reductions and maximum MP still apply.

Implementation: petcrow.go after strikePetTargets settles all victims; petcombat
carries the actual HP debit separately from native wire damage. Shared crow
recipient selection preserves party/world/town/range checks. Private recipient
0x3FB8 [u16=500] keeps confirmed client cooldown rows aligned; provisional presses
are untouched. Tooltip data and all generated design projections are matched.

Verification: action/companion suites pass (including all three books, party
range, zero damage, feature off and actual kill/overkill recovery); 56 focused
client tests pass, including malformed packet rejection and visible cooldown
state. Client source gate passes all five checks, quick ownership/capability/
execution checks pass, scoped Go lint reports zero issues. No new animations,
GM permissions, item grants or DB changes. Live party acceptance remains pending.

Deployment verified: Agent v0 and GameWorld v2 each have one healthy allocation.
Logged back into LabPetTest with the matched client; saved Mana Spring III remains
selected and its new MP/party/500 ms tooltip is visible. Tailwind recharges after
relog with the new fixed 5% per stack. UI evidence:
`E:/CodeProjects/SRO/outputs/pet-design-codex/crow-mana-spring-live.png`.
Live recovery/cooldown timing with a party has not been measured; server and
client integration tests, including a real committed kill, verify those paths.

## Rejuvenating Plume — 2026-10-22

Replaces Mend, preserving active row one and IDs 46–48, learned ranks, quickslots
and 10/40/90 progression. Owner-triggered; no enemy target is required. It uses
the crow support eligibility (living nearby crow/owner outside town, normal
world, expansion enabled). Existing timer/shared-row cooldown remains 20 seconds,
minus 0.5 seconds per learned rank after the first, with existing gear CDR.

- I: heal owner immediately, then once per second for five seconds.
- II: also heal crow and remove exactly one poison OR burn from owner on cast.
  If both exist, poison is removed first; no other debuffs are removed.
- III: also heal living ready party members within 20 m. Owner gets full healing;
  additional players get 80%, 64%, 51.2%, etc., in stable GID order. Crow healing
  remains full strength and does not reduce the party shares.

Existing base percentages (8/20/32% at the three books' first rank, +1.2 percentage
points/rank) now represent TOTAL healing: half instantly, the remaining half
split into five equal pulses. Every amount respects current max HP and recovery
reductions; integer rounding occurs per pulse. No resurrection. Recipients are
fixed on cast, then rechecked for life, party/range/source eligibility on pulses.
No new members join an existing cast. Unsummon, death, logout, separation or
feature disable stops the remaining pulses. A later valid cast refreshes the
session's one HoT rather than stacking it. Cooldown is paid only at casting.

Implementation: petplume.go owns session memory, casting, healing and native
abnormal-state removal/publication. Both current manual commands and the legacy
seven-byte use request enter the same cast; healing no longer waits for an
attack. petai advances five pulses with the existing division tick, no goroutine.
The old immediate-only Mend action was removed; gear's independent Mend proc
remains its existing 5% heal. Existing icons/vitals presentation are reused;
no new feather animation in this step.

Tests cover all three books, exact instant/pulse boundaries and completion,
crow healing, one-of-two poison/burn cleanse, party attenuation/range, cooldown
refusal, unsummon cancellation, and preserved old healing command coverage.

Deployment/live smoke: Agent v0, GameWorld v3, one healthy allocation each.
Client resumed LabPetTest and preserved Plume III learned rank 1. Cast with no
selected enemy succeeded and all three books immediately displayed the shared
20-second countdown. Updated effect/next-rank tooltip fits the existing skill
panel. Player was full HP at casting, so this smoke test proves command/cooldown
publication, not measured live healing amounts or two-client party acceptance.
Those paths are covered by deterministic server tests. Evidence:
`E:/CodeProjects/SRO/outputs/pet-design-codex/crow-plume-live.png`.
Source remains uncommitted; no GM/DB/item changes were made.

## Final live field verification and Claude handoff — 2026-10-22

Used ordinary authenticated LabPetTest and BondParty sessions against the actual
local GameWorld. User explicitly approved a bounded temporary GM grant for
LabPetTest to spawn poison-capable level-40 scorpions. No native wire injection
into runtime state or browser globals, and no new debug/GM capability was added.

Measured Plume III rank 1 (max player HP 13226, total heal 32%):
- Party instant heal **1692 HP**, exactly floor(13226 * 0.32 * 0.5 * 0.8).
- Party HoT **338 HP per pulse**, exactly floor(13226 * 0.32 * 0.1 * 0.8).
- Crow instant heal **5678 HP**, five **1135 HP** pulses, with final pulses
  correctly clamped at its 35490 maximum. A real 76-damage hit between ticks is
  accounted for in the saved evidence assertions.
- Owner poisoned by the native Red Scorpion skill: mask **16 -> 0** immediately
  on casting, and its injured HP restored to the 13226 cap. Nearby party
  recipients also healed. Casting required no enemy target and shared reuse
  remained active. Live testing used book III; earlier-book gates remain covered
  by the automated tests. Burn-only cleansing was not separately captured live.

Measured Mana Spring III rank 1:
- Native crow damage **2107** restored **105 MP** to owner.
- Next native hit displayed **1970**, but only **1945 HP** remained. Recovery was
  **97 MP**, confirming overkill is excluded (it would incorrectly be 98 MP).
- Party MP **6612 -> 6700**, correctly capped at maximum.
- Owner received one private **500 ms** cooldown recovery; party received two.
  Owner's short buff reuse had expired before hit two. Independently inspected
  saved server reuse: Fire imbue cast at 1792703568711, base reuse 5000 ms,
  saved deadline **1792703572711** = cast + 5000 - 2*500. This proves authority
  reuse changed, beyond just an icon/countdown packet.

Bug found and fixed: advanceTailwind inserted false entries into its changed
map, then published every key. Party clients received unchanged packets every
100 ms. It now publishes only true changes; a new regression test confirms no
recipient publication on unchanged ticks. Action+companion suites pass after
this fix. Previous client source gates and focused client tests also pass.

Evidence (ignored local files, same worktree):
- `.state/crow-live-evidence.py` rechecks recorded events without connecting to
  or mutating the game; all assertions pass.
- `.state/crow-live-evidence.json` contains concise measured results.
- `.state/crow-owner-live.log` and `.state/crow-party-live.log` preserve timed
  packets/events. Ordinary probe console is `.state/crow-party-live.mjs`.
- `.state/crow-live-final-tests.log` is under apps/server/.state (Go suites).

Cleanup and test incident:
- Spawned GIDs **453247** (Red Scorpion) and **453268** (Strong Red Scorpion)
  were explicitly killed; both native GM cleanup acknowledgements succeeded.
- BondParty died while logs were being reviewed. Its 100% revival scroll
  restored HP, but logging back in had cleared transient LastExpLoss, so EXP
  was not refunded. This native transient-state behavior was not changed.
- Stopped GameWorld before any DB write, took a SQLite backup at
  `.state/crow-live-before-party-restore.sqlite`, and restored ONLY BondParty's
  known **281672372 EXP** and its one consumed existing revival scroll. Verified
  full **13226 HP**, SQLite quick_check OK, and recorded the transaction scope
  in `.state/crow-party-restoration.json`. No schema/account/other-character
  record changes. LabBlader remained untouched.
- Original GM allowlist restored to **global-official:asd2** only. Nomad job
  configuration confirms LabPetTest is absent. Agent v0 and GameWorld v6 are
  healthy. `.state/crow-gm-lease.json` records cleanup complete. Do not replay
  GM spawn commands without fresh authorization; this grant is finished.
- Test protocol sessions have disconnected. Browser is being restored for the
  user. Source changes remain uncommitted; preserve unrelated WOLF-REWORK.md.

Next work should use this measured evidence rather than repeating these tests.
If extending tests, isolate field recipients or actively monitor HP; never leave
an attacked test character idle while reviewing logs. No new animations were
added in this verification pass.

Final verification also reran scoped Go lint: zero issues
(apps/server/.state/crow-live-final-lint.log). The browser resumed LabPetTest
with full HP/MP and LabCrow summoned. Recalled the crow and used one ordinary
Return Scroll to leave the combat field safely; no additional test attacks.
Final UI evidence is at
`E:/CodeProjects/SRO/outputs/pet-design-codex/crow-live-tested-restored.png`.

Safe final UI confirmed: LabPetTest is in Hotan Kingdom (region23687), full13226HP/6700MP, LabCrow summoned; nativeReturnScroll completed. Agentv0/GameWorldv6healthy, originalGMallowlistonlyasd2. Evidence crow-live-tested-restored.png. No live probes remain.


## Exposing Mark and Guiding Feathers — 2026-10-22

Replaces Mark Prey (49–51) and Murder of Crows (58–60), preserving all
learned ranks, book prerequisites and slots. All changes remain behind the
existing attack-pet expansion flag. No new assets or animations.

Exposing Mark:
- Manual targeted crow strike; a landed damaging hit installs an 8-second mark.
- I: crow and owner gain 5% bonus damage at rank 1, +1 point/rank (14% at 10).
- II: party members within 20 m of the source owner also benefit.
- III: successful crow/eligible allied direct attacks on marked prey add one
  Exposure per action, capped at 5; each adds 2 percentage points. The installing
  strike contributes the first stack. Stacks do not extend the original 8 s.
- One target per crow; recast replaces the mark. Strongest mark wins across
  multiple crows. The bonus is added after mitigation, not a native defence debuff.
- Reuse is now a timer: 12 s at rank 1, -0.5 s/rank; normal pet gear CDR applies.
  IDs still share their existing row cooldown. Blocks cannot install a mark.

Guiding Feathers:
- I: each damaging crow action grants the owner one Precision, max 5. Each
  grants +2% hit ratio at rank 1, +0.5 point/rank; crow hits refresh a 10 s duration.
- II: at 5, the next successful damaging character skill gains +20% damage at
  rank 1, +2 points/rank, and consumes that recipient's pool. Native normal
  attacks do not consume or receive this empowerment. Blocked/refused actions
  do not consume it. An area skill spends once after all committed victims.
- III: party members within 20 m receive independent pools and empowerment.
- Expiry, slot/book change, departure/range, source loss/death/unsummon and
  teleport invalidate grants. Different crows use strongest grants, no additive
  stacking of the same bonus. Damage procs/periodic effects cannot generate charges.

Ownership/integration:
- `action/petcrowkit.go`: transient per-pet state, eligible sources, mark bonus,
  recipient Precision, successful-action consumption, expiry and private projection.
- `pettrained.go` + `petarea.go`: mark strike planning and post-commit progress.
- `skillcombat.go` + `skillarea.go`: real hit-ratio input, post-mitigation bonus,
  and once-per-action consumption. Existing native combat/reward/HP doors retained.
- `petai.go`: tick/retirement/teleport lifecycle. No DB schema or character writes.
- Private 0x3FB9: u32 recipient GID, u8 book, u8 stacks, u16 hit-ratio percent x10.
  Full-frame validation precedes state changes. Owner and party HUD show Precision
  and full-stack readiness; the pet row shows its owner's count.
- Canonical JSON and all three generated copies match; tooltips use short lines.

Verification so far:
- Entire action+companion Go suites pass. Scoped lint: zero issues.
- Client source check: all 5 gates pass. Focused pet-training/buff suites: 36 pass.
- Added deterministic tests for all three books, actual bonus damage, party gates,
  caps, blocked-action retention, independent consumption, expiry and flag off.
- Added malformed private-packet rejection/clear tests.
- Race test unavailable: local Go reports `-race requires cgo`; not claimed run.
- Live GameWorld v7: owner AND BondParty independently received Precision
  1/2 stacks with +2/+4% hit ratio; both cleared after the 10-second refresh
  deadline. Native party invitation accepted. Two natural level-46 trees were
  killed by crow attacks. At full HP, both test clients logged out safely.
- The nearby weak monsters die in two hits; five-stack empowerment/mark III
  field acceptance is still PENDING, not inferred from unit tests. Requested
  fresh bounded GM permission to spawn a survivable test target; do not reuse
  the previous completed grant. No new GM grant has been applied.
- Test travel consumed one ordinary reverse-return scroll from LabPetTest
  (slot 13) to its saved field recall point. BondParty used HP potion(s) from
  its existing slot 36 and Plume restored it to 13226 HP. Neither died.
- Ignored live logs/helper: `.state/crow-kit-owner.log`, `crow-kit-party.log`,
  `crow-kit-live.mjs`. Helper has no spawn/GM/kill commands in this run.
- Preserve unrelated WOLF-REWORK.md; no commit/push requested.


### Follow-up live regression — 2026-10-23 (in progress)

Fresh user approval granted temporary LabPetTest GM for durable test targets.
Active cleanup ledger: `.state/crow-kit-gm-lease.json`; do not forget to revoke.
GameWorld v8 contains the new rows, counters and teleport/retirement cleanup.

New live results:
- Guiding Feathers I rank10: 1..5 stacks, hit-ratio grant 6.5..32.5%; no party grant.
- II rank10: 5 stacks /32.5%, successful learned Lightning cast1332 consumed pool.
- III rank1: owner and BondParty reached 5 stacks /10% independently. Owner's
  successful cast cleared only its pool; BondParty's pool remained until its own
  expiry ~9s later. Native cast/damage packets decoded using product castPhase.
- Exposing Mark III: logged native-compatible counter1,2,3,4,5 against453268;
  owner Lightning hit contributed a charge. Mark cleared after original8s.
- Full Tailwind50% observed on both owner and party. Separate stun check pending.
- Mana Spring III emitted owner+party500ms recovery during damaging crow actions;
  MP was restored after actual nativeFire imbue costs. Previous exact HP-debit
  and persisted-cooldown assertions still apply.
- Plume I healed injured owner while leaving Poison16 active. Plume II restored
  owner to13226HP and cleared Poison16->0 at1792731377641; crow34944->35490.
  Native later hits can reapply poison, correctly. Plume III also cast successfully;
  its exact party amounts were already measured in the previous live run.

Bug found: a remotely chasing crow could spend a queued Mark beyond its
20m support eligibility, then fail to install the mark. petApplyAction now refuses
that mark until eligible. Regression checks nearby admission and range refusal;
full Go suites and lint passed. This last guard still needs final deployment.

Test setup: temporarily equipped LabPetTest's existing bow from slot32 for its
already learned magic skill1332; no ammunition/new item or skill was granted.
Two attempted ordinary learn requests correctly refused duplicate/lower ranks.
Restore bow toslot32 before finishing. Preserve all characters and unrelated edits.
Spawned target IDs452782,453267,453268,453269 were explicitly cleaned;453270
remains only for finalTailwind check. Ledger is authoritative for final cleanup.


## Final verification and Claude continuation — 2026-10-23

All requested rows implemented; no commit/push requested. User additionally asked
for the whole crow kit to be tested after implementation. Evidence is read-only
reproducible with `node .state/crow-kit-evidence.mjs`; all assertions pass.
`.state/crow-kit-evidence.json` contains concise measured output. Native combat
packets are decoded by the product's castPhase, not a guessed damage offset.

Final added live result: recipient Tailwind reached10/50%. A native Lightning
hit on453271 at1792731552842 applied Stun mask16384 and consumed owner stacks
on the same frame. Status cleared at1792731554940 (~2.1s). This confirms the
actual native status, beyond a counter or visual. ExposingMarkIII reached5
at1792731304643; it cleared at1792731306443, preserving the original8-second
lifetime from its first landed strike. Independent party Precision survived the
owner's consumption and expired separately.

Whole-kit scope: all five rows exercised live. All three Guiding books tested
live; MarkIII cap/expiry and earlier-book casts tested live. PlumeI/II now tested
live, including I retaining poison and II cleansing it; earlier precise III party
healing measurements remain documented above. Mana and Tailwind's tier gates and
blocked/range/flag-off/slot cases remain covered by deterministic server tests.
Burn-only cleanse and every possible multi-crow overlap were not separately
field-tested. Arithmetic uses deterministic tests; one randomized field hit is
not presented as proof of an exact percentage. No new crow animation/feather
projectile work was done; existing icons/animations reused as requested until
skills are locked.

A live edge case found/fixed: queued Mark could spend while chasing beyond20m,
then fail its source validation after the hit. petApplyAction now defers that
queued Mark until source eligibility is valid; targeted regression passes.
The final source is built/deployed as GameWorldv9. Agent remainsv0.

Validation this run:
- Entire action+companion Go test suites: pass after the last code fix.
- Scoped pinned golangci-lint: zero issues after the last code fix.
- Client source check: all5 gates pass; focused pet-training+buff tests37pass.
- Client quick ownership/capability/execution checks pass; diff check clean.
- Local race run was unavailable (`-race requires cgo`); no race/remote CI claim.

Cleanup:
- All six temporary monsters452782,453267,453268,453269,453270,453271 explicitly
  cleaned via approved native GM commands (successful acknowledgements), including
  a naturally defeated first target. `.state/crow-kit-gm-lease.json` now records
  cleanupRequired=false and all IDs cleaned.
- Nomad's final job environment independently verified: GM list is ONLY
  `global-official:asd2`. LabPetTest grant revoked; never reuse unattended.
- LabPetTest's existing bow restored toslot32; no new items/skills granted.
  Both test characters verified13226HP. LabBlader untouched. No DB writes/schema
  changes. Ordinary test combat can award normal EXP/drops; normal potion and
  travel consumables were used. One additional Return Scroll was attempted;
  session ended before town reentry, so do not claim town travel completed.
- Test sockets disconnected and leftover console processes stopped. Browser is
  reopening for normal user testing. Do not rerun ignored GM scripts without
  a new explicit approval.

Continue from this source/evidence, not the older unchanged-skill status text.
Preserve the unrelated WOLF-REWORK.md edits. The user's crow skill choices are
now implemented; future art/ranged feather work needs a separate request.

Final UI reopened on v9, confirmed all three new book names. A normal Return Scroll is now being allowed to finish in the browser; do not count the earlier cancelled attempt as successful.

Final UI verification: LabPetTest returned successfully to Hotan Kingdom, region23687, full13226HP/6700MP, LabCrow summoned, skill window displays Exposing MarkI/II/III and Guiding FeathersI/II/III. Evidence E:/CodeProjects/SRO/outputs/pet-design-codex/crow-kit-final-2026-10-23.png. Serverv9healthy, originalGMallowlistonlyasd2; no crow test processes remain.


## Stormbrood initial implementation checkpoint — superseded by acceptance below

Implemented, deployed locally, uncommitted. Replaces Exposing Mark IDs49–51;
learned ranks remain. User's latest limit supersedes the earlier three-live cap:
**at most ten combined eggs and clones per owner, across all books**. Eggs reserve
clone slots; the original crow does not count. Refused casts spend no charge.
Book I stores one cast; II/III store three, recharging sequentially. First learning
grants one cast. Recharge scales from600s to300s across ranks1–10, then normal
capped equipment cooldown reduction applies. Mana Spring III removes500ms from
recipients' pet timed cooldowns, including the next stored-cast recharge; it never
shortens summon lifetimes or attack/hit counters.

Eggs have25% of source maximum HP and hatch after30s if alive. Clones hatch at
full copied HP, live600s, cannot be healed, gain no EXP, and copy stats and normal
attacks only: no learned skills, support procs, leech or recursive eggs. They
follow and fight the source crow's target through normal COS combat. Book III
death/expiry deals an8m wind burst,200% normal clone strike, up to8 hostile
monsters, with normal mitigation and rewards. Source/owner loss, logout and
flag-off cleanup never explode. Wind cosmetics and subsequent full live acceptance are recorded below.

Owned egg mesh: scripts/build/char/crowEgg.mjs, reference5000001, resource
res/port/stormbrood/egg.bsr identity. Normal NPC/COS asset pipeline publishes its
GLB; no retail PK2 edit. Appearance override requires the reserved GID range and
exact egg name. Clones use the normal crow model. Transient Brood records are not
persisted; deep snapshots and peer-only spawns preserve the real pet window.
A monotonic owner generation protects reused egg slots from stale combat hits.

Live bug fixed: dormant LabWolf shared GID33554434 with the summoned LabCrow.
Lifecycle lookup previously selected the dormant wolf and never advanced eggs.
It now resolves the summoned actor first; only missing-source cleanup searches
dormant crow records. Actual hatch to Stormbrood Crow observed in GameWorldv16:
E:/CodeProjects/SRO/outputs/pet-design-codex/stormbrood-hatched-2026-10-23.png.
Final cap/generation build deployed healthy: Agentv2, GameWorldv18.

Verification: full action/companion/domain Go suites pass; scoped lint zero issues.
Client typecheck/ownership/capability/execution/layout gates pass;29 focused
client/appearance/egg-export tests pass. Formatting, encoding, diff and published
asset-delivery checks pass. Deterministic tests cover ten-slot admission without
charge loss, reused-slot generations, actual clone combat, hatch timing, expiry,
death burst, charge recharge, cleanup and the dormant-wolf alias. Live hatch is
confirmed; ten simultaneous live summons, full ten-minute field expiry and exact
multi-client pet cooldown recovery are not claimed as field-tested. No race run
(cgo unavailable), remote CI, commit or push.

Cleanup complete: temporary three-charge fixture was restored with GameWorld
stopped. Full backup apps/server/.state/brood-before-test.db; original recharge
apps/server/.state/brood-recharge-backup.json; restoration marker
apps/server/.state/brood-recharge-restored.txt. Do not restore the whole DB.
GM allowlist remains only global-official:asd2. No outstanding temporary GM,
spawned GM targets or test probes. Ordinary cast/combat progress remains.
Preserve unrelated WOLF-REWORK.md edits. Next work: dedicated wind visual and
additional field coverage if requested; inspect this checkpoint before old notes.

Final v18 browser check: LabPetTest entered world with13226HP/6700MP, LabCrow intact. Normal StormbroodIII cast hatched successfully into Stormbrood Crow on the final ten-cap build. Proof E:/CodeProjects/SRO/outputs/pet-design-codex/stormbrood-final-v18.png. Left game open, South-Taklamakan X223/Y1582, no combat; no temporary grants.

## Final Stormbrood cap, expiry and wind acceptance — 2026-10-23

Runtime test ran against normal authenticated GameWorldv23 with a nearby browser
observer, using real casts, real60s sequential charge recovery (rank10 with80%CDR),
30s hatch and600s clone lifetimes. No product timing bypass or GM privileges.

Measured results:
- Ten eggs hatched into ten live clones concurrently. Browser showed13 nearby
  entities: two players, original crow and ten clones.
- With another stored charge legitimately recovered, cast11 returned the live
  limit refusal. Stored charges remained1 before/after; no eleventh egg spawned.
- All ten clones expired naturally after600072–600077ms from their respective
  hatch publications. Live actor set returned to zero. Exactly ten wind cues,
  one per expiry; no duplicates or test failures. Source crow remained intact.
- Wind animation observed in the real renderer at expiry, including after
  same-tick clone despawn. Initial ribbons looked too solid; final ribbons are
  thinner, translucent, with texture alpha fading both tips and edges.

Implementation: port-only0x3FBA payload18bytes: u32cloneGID,u16region,f32X/Y/Z.
The world validates length, reserved identity, region and finite coordinates,
then journals position-bearing VisualFeedback independently of the entity.
The effect owner retains at most64 bounded bursts; each draws three spiralling
ribbons expanding to8m over1.2s. Reset/dispose clears the queue. III combat death
and timed expiry emit the same visual even without nearby enemies. Administrative
cleanup remains silent. No retail PK2 changes or new dependencies.

Files: petbrood.go/test; contracts/orb.ts; entities.ts; presentation.ts;
characters.ts; effects.ts; procedural-effects.ts. Tests cover the wire boundary,
independent ten-burst lifecycle and transparent rising ribbon geometry. Earlier
Stormbrood asset tests were completed to distinguish the owned egg from retail
BSR/VAT expectations, preserving all native census assertions.

Verification: all12 client gates PASS after final cosmetic changes, including
full client tests and test types. Full action/companion/domain Go suites PASS;
scoped pinned golangci-lint0issues. Formatting, encoding and diff checks pass.
No remoteCI or race-run claim. Live combat-killed clone burst damage was not
retested in this field run; deterministic tests cover that path and tier gate.

Evidence (local):
- .state/brood-cap-live.jsonl — packet timestamps, spawns, charge state, refusal,
  hatch/despawn and each position-bearing wind cue.
- .state/brood-cap-status.json — done=true, failures=[], maxLive/eggs/hatches/
  expired/winds all10; before/after cap charge both1.
- .state/brood-client-check.log — final12-gate pass.
- E:/CodeProjects/SRO/outputs/pet-design-codex/stormbrood-ten-live.png
- E:/CodeProjects/SRO/outputs/pet-design-codex/crow-wind-soft-1.png

Cleanup COMPLETE: GameWorld stopped before narrow DB restoration. Original
LabCrow training (including IIIrank1, gear and charge row) restored from
apps/server/.state/brood-cap-fixture.json; cleanupRequired=false. BondParty's
original world/currentHp/currentMp restored from brood-observer-position.json.
SQLite quick_checkOK; marker apps/server/.state/brood-cap-restored.txt. Full
pretest DB backup retained as brood-cap-before-test.db; never restore the whole
DB to undo this test. All ten transient actors expired before logout. No GM,
monster spawns, new inventory items, account or schema changes. Preserve ordinary
elapsed satiety/progress and unrelated character fields. Runtime restart verified healthy:
Agentv2/GameWorldv25. Original crow ranks/gear and observer position independently
verified from read-only DB after restart; no live test probe process remains.
No commit/push requested. Preserve unrelated WOLF-REWORK.md changes.

Final client reopened successfully as LabPetTest with LabCrow,13226HP/6700MP, no target. Original crow training/gear restored. Agentv2/GameWorldv25healthy; all test probes ended.

## Crow skill animations and 500% burst — 2026-10-23

User requested500% clone death damage and animations for every crow skill.
`broodDeathMultiplier=5` multiplies the native attack coefficient before normal
mitigation/kill settlement. Radius8m, max8monsters, ten summon cap and lifetimes
are unchanged. Canonical design + generated server/client copies + both tooltip
paths now state500%. Earlier200% entries above are historical test evidence.

Owned feather mesh: curved tapered vane with barb/shaft texture, transparent
edges/tips; no square billboard, retail edit, new dependency or gameplay timing.
Cues are generated only by accepted casts/committed effects:
- Plume: soft red descending feathers on the crow and actual eligible recipients,
  including five healing pulses; initial full-HP cast still has feedback.
- Stormbrood: muted brass ground nest on lay, pale rising hatch fan. These replace
  the generic blue summon column for owned eggs/clones only. Death wind retained.
- Mana Spring: soft blue inward wisps when mana or character/pet reuse is recovered.
- Tailwind: pale ground feather trails on stack gains; outward victim gust on
  an admitted full-stack stun.
- Guiding Feathers: gold orbit on charge gain, brighter fan at full charges and
  consumption. III cues are published at each eligible party recipient.
Books add feather density (four/five/six); cues do not interrupt crow actions.

Port-only0x3FBB: u32actorGID,u8cue(1..8),u8book(1..3),u16region,f32X/Y/Z.
The same ordered position feedback owner handles0x3FBA death wind (unchanged18byte
format) and new20byte cues. Queue bounded64, effects expire1.2s and clear on reset.
Wire validation rejects invalid length/kind/book/nonfinite coordinates. Cosmetics
survive actor retirement; they never cause damage, healing, stacks or cooldowns.

Validation: full action/companion/domain suites and scoped lint pass; all12 client
gates pass. Focused tests cover all24 cue/book combinations, wire rejection,
transparent feather/wind geometry and independent expiry/reset. Native summon
behavior remains unchanged; owned brood spawn tests assert no stock summon cue.
Live owner Plume and egg cast effects observed; hatch succeeded and tooltip500%
verified. New ManaSpring/Guiding party visuals were not separately field-tested
this run (server effects/recipient tests and all render profiles pass).

Field note: LabCrow was dead on reopening; revived normally using one existing
Grass of life and resummoned. No direct DB changes/GM/fixture grants this run.
Regular casts consumed normal reuse/charges. Pictures: crow-plume-feathers.png,
crow-egg-feathers.png, crow-hatch-feathers-0.png under
E:/CodeProjects/SRO/outputs/pet-design-codex/. The hatch picture predates final
stock-column suppression; do not claim it proves that last cosmetic adjustment.
Final deployment verified healthy: Agentv2/GameWorldv27. Uncommitted; no
commit/push requested. Preserve unrelated WOLF-REWORK.md changes.

Final field recovery: player died to roaming Devil Eyes during reconnect. Used
one existing100%resurrection scroll, then one Return Scroll; no disconnect before
EXP recovery. Read-only DB check confirms LabPetTest EXP281672372 exactly equals
brood-cap-before-test.db baseline, level90. Final UI Hotan Kingdom,13226HP/6700MP,
LabCrow alive/summoned. Picture crow-effects-final-safe.png. No GM/DB writes or
fixture grants; normal test consumables used: one Grass of life, one100%revival
scroll, one Return Scroll. Leave characters in town before future long checks.
Final no-stock-column brood tweak passed lifecycle tests/lint; its dedicated hatch
fan was not field-captured after that last tweak. All24cue/book render tests and
packet validation pass. New Mana/Guiding party FX still need optional field review.


## Mana Spring 10% and safe-zone Tailwind — 2026-10-23

- All seven legacy/current Mana Spring definitions use `value: 10` and
  `valuePerLevel: 0`; generated server/client/shared data regenerated. Recovery
  uses actual monster HP damage, so overkill cannot inflate MP. Existing max-MP
  clamp, book II party sharing and book III character/pet cooldown recovery stay.
- Tailwind alone opts into safe-zone companion/party eligibility. All books gain
  one stack every five seconds and grant up to50% movement speed in town. Nearby
  eligible party members receive their own stacks with book III. Combat companion
  eligibility and active-skill town restrictions remain unchanged.
- Tests cover10% at every rank/book, actual-damage and zero-damage recovery,
  party/cooldown behavior, all three books charging in Hotan, the50% speed bonus,
  book III party charging, the combat town gate and feature-off cleanup.

- Deployment: Agentv2/GameWorldv28 healthy. Full action/companion/domain suites,
  scoped Go lint (zero issues), all12 client gates, formatting, encoding and diff
  checks pass. Live Mana Spring III tooltip reads10%; screenshot:
  `E:/CodeProjects/SRO/outputs/pet-design-codex/crow-mana-10-tooltip.png`.
- Live character was already in Mystery Desert (X124/Y1502), not the previously
  saved Hotan position. No town relocation, GM, fixture or DB edits were performed
  for this change. Tailwind charging was visible in the field; safe-zone owner and
  party charging/speed are automated Hotan tests, not a new live town acceptance.
  Character remains in the user's current field session; do not assume it is safe
  to leave unattended. No commit/push requested.


## Distinct HP / MP cosmetics — 2026-10-23

Rejuvenating Plume now uses soft red descending feathers; Mana Spring uses blue
inward/rising feathers. Recovery bursts add alternating smaller, fainter glints
with gentle height variation and shimmer. Feather textures are64px with finer
barbs, a central shaft and highlights; geometry still follows the feather outline
with transparent edges. Other crow cues retain their colors and particle counts.
Recovery cues remain bounded12actors/bookIII, expire after1.2s, do not affect
stats or movement, and need no server restart or PK2 edits.

All38 character-effect tests and all12 client gates pass, including red/blue tint,
different paths, small-mote scale/opacity, transparent edges and expiry. Formatting,
encoding and diff checks pass. Browser reloaded and native Plume cast accepted;
no isolated live Mana Spring/party visual comparison this run. Existing field
monsters were nearby; do not leave LabPetTest unattended. No fixture/GM/DB changes.
Source uncommitted. Agentv2/GameWorldv28 unchanged.


Final recovery-color correction: native unlit particles bypass material tint.
HP and MP therefore use separate owned `crow-heal-feather` / `crow-mana-feather`
resources with the red/blue color baked into BGRA textures, not instance tint.
The shared feather geometry/detail remains unchanged for all other crow cues.
Tests inspect actual texture channels as well as particle paths/lifetime/count;
all12 client gates pass after this correction (32.6s). Browser reloaded final build.

Live field check encountered an attacking Edimmu. Two native Plume casts plus one
existing HP recovery potion protected LabPetTest; the crow killed its attacker.
One existing Return Scroll returned the character to town alive at13226HP/6700MP;
no death, GM/DB edits or fixture changes. Town Tailwind reached10/10 before final
refresh, also providing live safe-zone coverage for the preceding change. Final
red/blue resources are renderer-tested; no new isolated live MP/party comparison.


## Live owner/party recovery visual test — 2026-10-23

Used the existing BondParty character and normal crow casts/attacks against level
45–46 Eastern Hotan monsters. No GM granted or monsters spawned. Consistent DB
backup: `.state/crow-recovery-fx-before.db`; narrow fixture manifest:
`.state/crow-recovery-fx-fixture.json` (cleanupRequired=false after restoration).
A clean character sign-out was necessary: resumed sessions retain their admitted
entry snapshot and initially overwrote the temporary owner position.

Live recorded assertions (`.state/crow-recovery-fx-evidence.json`):
- Red healing cues: owner18, party7. Party HP10303→11978 on first heal publication;
  subsequent pulses reached13226. Distinct recipient positions were published.
- Blue mana cues: owner5, party1. Party MP6664→6700 on that hit (max-MP clamp).
  Later full-mana hits did not emit redundant party recovery cues when there was
  no character/pet reuse to recover; this is expected.
- Browser received and rendered the current owned feather assets; party and owner
  were stationary for the first healing test, then moved together for comparison.
  Red screenshots are short live samples. The blue screenshot samples missed some
  short peaks; actual owner/party blue cue receipt and MP gain are in the wire log,
  with the existing renderer tests pinning blue texture channels and animation.
- Existing38 effect tests and12 client gates already passed the exact final assets;
  no runtime code change was required during this test.

LabCrow was dead before summoning; revived with one existing Grass of Life and
left alive. No player death. Ordinary test kill rewards remain. After clean logout,
only temporary world/currentHp/currentMp fields were restored for both players;
learned crow ranks unchanged, DB quick_check=ok, observer disconnected, temporary
party ended. LabPetTest restored to Hotan/full13226HP/6700MP. No commit/push asked.
Screenshots: `E:/CodeProjects/SRO/outputs/pet-design-codex/crow-red-party-live.png`
and `crow-blue-party-live.png` / `crow-blue-party-live-2.png`; do not treat a single
still image as proof of the full timed effect. Backup/probe files are ignored.


## Recovery visual redesign — 2026-10-23

Replaced only HP/MP flat feather rings with `crow-heal-wisp` and `crow-mana-wisp`.
Healing uses a loose upward drift of small soft red motes; mana uses narrow blue
wisps drawing inward around torso height. Phases are staggered instead of every
particle forming one synchronized ring. Other crow rows retain their current art.

Owned64px Gaussian textures and three crossed planes keep small particles visible
from different angles. Red/blue colors are baked for native unlit rendering. The
production WebGPU preview exposed a second issue: the old `fadeAlphaOnly` policy
ignored the texture alpha during fading, producing rectangular sprites. Recovery
materials now preserve texture alpha and use straight-alpha blending, keeping the
colors legible over bright ground. No shared renderer/native material behavior
was altered. Still12 actors maximum per cue,1.2s lifetime, bounded existing queue.

Verified in the actual production renderer using an ignored, isolated preview
`.state/crow-wisp-preview.html` importing the real resources and effect controller;
no game session, DB fixture or synthetic network packets involved. Saved proof:
`E:/CodeProjects/SRO/outputs/pet-design-codex/crow-recovery-wisps-preview.png`.
All12 client gates pass (31.1s), including typechecks and the recovery tests pinning
color channels, alpha-fade policy, actor size/count, different paths and expiry.
Formatting, encoding and diff checks pass. Game refreshed for user review; no new
field/party combat test after this visual-only redesign. Agentv8/GameWorldv36 remain.
No new dependency, PK2 edit, database mutation, server restart, commit or push.


## Automatic passive tiers — 2026-10-23

Removed manual passive selection from the sequential tree UI. Passive icons stay
inspectable; only the highest learned book is highlighted. Row help explains
automatic replacement. Active spell buttons retain casting. Server resolution
uses the highest learned/live book instead of saved Slotted values. Old lower,
zero or invalid selections are ignored. Wire state/highlights use that same book;
old-client slot requests cannot downgrade it. No points/ranks/equipment wiped.
Legacy version1 alternative trees retain their old server behavior.

Tests cover four species/all passive rows/books, stale saved selections, exactly
one highest-book wire flag, downgrade rejection and refund cleanup. Fixtures now
remove ranks when testing unlearning rather than toggle passive selections.
Player/operator/site guides updated. Source uncommitted.

Validation: full action/companion suites pass, scoped lint zero issues, all12 client
gates pass (114.4s), formatting/encoding/diff checks pass. Agentv8/GameWorldv37
healthy; client refreshed. No DB migration, commit or push.

Live UI verified: Mana Spring/Tailwind/Guiding Feathers I–III are non-selectable;
only learned III has active/checked state. Screenshot passives-highest-tier-only.png
in outputs/pet-design-codex. Client alive13226HP, LabCrow summoned. No manual
retraining required for saved characters; other species covered by server tests.

## Commit readiness — 2026-10-23

Stored egg casts add optional persisted capacity/charges/rechargeMs fields.
Schema29 and release compatibility now declare them; the offline authority
upgrade accepts schema28, retains a backup and rewrites no character records.
Existing v28 field manifests remain unchanged. Tests verify preserving upgrade,
idempotence, current record shapes and stored casts across a database reopen.
Deployment requires the normal offline store upgrade before the new server;
this commit task does not upgrade or restart the running local authority.

Client validation: all12 gates pass. Crow counter tests live in their own module;
Mana Spring packet handling belongs to the cooldown owner; landed-hit Tailwind
handling belongs to its crow module. These preserve behavior and satisfy source
size limits. Unrelated wolf documentation is excluded from this commit.

Final precommit validation: all12 client gates pass; full server tests pass.
Repository source gates pass except the server race step: local Go reports
`-race requires cgo` and no C compiler is available on PATH. Race detection
remains unverified locally; no checker or hook was disabled.

## Main merge — 2026-10-23

Merged origin/main ee0c581f into the crow branch. Resolved overlapping penguin
changes without restoring the retired crow kit or manual passive selection.
Preserved main's stale-presentation behavior: crow one-shot effects drop from
old hidden-tab batches, and crow packet events use the current journal time.
A presentation regression test covers both stale suppression and live delivery.
Canonical design was regenerated into its three consumers.

Verification: all12 client gates pass (170.9s); full server tests pass (93.3s).
All other repository source gates pass; race detection remains blocked locally
by missing cgo/C compiler. No live server/DB upgrade or combat retest in this
merge task; the running schema28 server remains unchanged. Deploying this branch
still requires the documented offline schema29 upgrade. Wolf notes preserved.
