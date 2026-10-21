# Wolf rework - implemented offensive kit

Status: all five rows implemented; source tests pass. Live field acceptance
is recorded below; implementation is not a claim of completed balance testing.
No new animations, particles, sound or asset changes in this pass.
Keep two manual actives and three passives, with books at pet10/40/90 and
10 ranks per book. The previous book must be mastered. Preserve existing
book IDs1..15, character data, equipment and the other three pets.

## Execute - requested behavior (IDs7/8/9)

- I: retain current wolf-only execution on a successful damaging hit.
  Preserve the existing threshold curve and existing bleeding-target bonus.
- II: also give the owner execution while the summoned wolf is alive/nearby.
- III: also perform a10m execution sweep every seventh qualifying attack.
  Execute only monsters below the current book's threshold, not a flat damage
  attack. Confirmed by the user: wolf and owner outgoing attacks.
- Count wolf and owner
  successful attack actions independently. One multi-hit/AoE cast counts once,
  not once per target/projectile. Center each sweep on its triggering attacker.
- Retain unique/boss immunity. Do not execute players or friendly companions.
  Use the normal hit/death/reward/loot doors, so every kill settles once.
  Sweeps, DoTs and proc damage never increment attack counters or chain sweeps.
- Proposed owner eligibility: ordinary-world PvE, alive summoned wolf within20m,
  no town/PvP/job/instance bonuses; remove the effect immediately on unsummon,
  death, passive changes or separation. Range is provisional, not user-locked.
- Existing thresholds, before gear: I5..11.3%, II12..18.3%, III19..25.3%.
  The existing bleeding bonus is +5 percentage points after proficiency5
  (and inherited by advanced books). Preserve I; final II/III values remain
  tunable during kit review. Health must be strictly below the threshold.

## Four approved replacements

All ranges below mean rank1 through rank10. Values are starting balance,
not final. Keep shared cooldowns across the three books in an active row.

| Row / IDs | Skill | I | II | III |
| --- | --- | --- | --- | --- |
| Active I /1..3 | Hunting Howl | Wolf gains10..100% attack speed for8s | Wolf and owner gain120..300% for8s | Wolf, owner and nearby party gain320..500% for8s |
| Active II /4..6 | Savage Rend |160..250% physical hit and6s bleed |220..310% hit; cleave up to3 enemies within4m |280..370% hit; cleave up to5 within6m; +25% direct damage against already bleeding targets |
| Passive II /10..12 | Bloodscent | Damaging attacks build up to5 stacks, each +1..2% damage | Up to8 stacks, each +2..3% damage; owner builds a separate stack pool too | Up to10 stacks, each +3..4% damage and0.5% critical chance |
| Passive III /13..15 | Blood Hunt | Four wolf hits mark prey; Rend consumes for50..100% bonus damage | Owner hits share charges;75..125% bonus |100..150% bonus; up to5 other bleeding enemies within6m take50% of the bonus |

### Hunting Howl

- Manual self-buff, no enemy target needed, base recharge25s.
- Party range20m, party eligibility checked at cast; players receive only one
  instance of the strongest eligible howl, not multiplied by multiple wolves.
- Attack-speed math follows the existing character/pet attack interval rules.
  Item attack speed remains governed by existing limits, not a new multiplier.
- No fear/taunt: this is an offensive replacement for Terrifying Howl.

### Savage Rend

- Manual targeted melee ability, base recharge12s, ordinary approach/range checks.
- Primary target required; cleave cannot hit through walls or across instances.
- Bleed uses the existing status/resistance engine:6s, one tick every2s.
  Initial proposal:2x pet level per tick in I,4x in II/III.
- Reapplying refreshes one bleed; it does not create independent stacking DoTs.
- Remove the old Rending Bite's separate30% execution rule. Execute owns all
  execution thresholds, so learning Rend does not bypass its progression.

### Bloodscent

- One stack per successful attack action, capped by book.6s duration;
  another successful action refreshes it. Misses/blocks/DoTs/procs add none.
- Owner pool unlocks in II; wolf and owner do not feed each other's stacks.
- III critical bonus is capped at5 percentage points at10 stacks.
- Losing wolf eligibility clears the owner's temporary bonuses and counters.
- Present each active stack pool through authoritative counters; no guessing
  from attack animations. Owner charges now also appear on the top-left status board, with counters and progress bars. Gold means full Bloodscent/Blood Hunt stacks or a next-hit Execute/Crushing Paw release.

### Blood Hunt

- IDs13/14/15 replace Killing Spree without resetting learned ranks or slots.
- Four landed damaging actions on the same enemy prepare one shared mark.
  I counts wolf hits; II/III also count owner hits. A multi-hit/AoE action
  adds one charge, on its first damaged victim. Blocks, DoTs and procs add none.
- Mark lasts8s; further hits refresh it. Attacking different prey replaces it.
  Book changes, expiry, prey death or loss of ordinary-world wolf eligibility
  clear progress. Pet and owner counters show0..4; gold means Rend is ready.
- A landed Savage Rend on marked prey consumes the old mark and deals an
  additional50..100 /75..125 /100..150% of its committed direct damage.
  The Rend itself starts the next charging cycle. Misses/blocks/cancelled
  casts cannot consume marks; no consumption by an ordinary attack.
- III deals50% of that bonus to up to5 other bleeding enemies within6m of
  the marked prey. Normal hostile population, plane, range and LOS checks
  apply. Damage uses the expected-HP/credit/reward door, with HP updates;
  no extra cast, bleeding application, attack count or recursive burst.
- These values are starting balance. No new assets/animations/sounds.
- Private counter packet0x3fb6 now adds hunt count and target GID (17bytes).
  Client accepts legacy8/10/12byte snapshots too; reload old clients on deploy.

## Execution order once the kit is settled

1. The owner approved all four replacements; Execute direction/counters confirmed.
2. Update canonical pet-design.json and run pet_design_export.py. Keep IDs.
3. Implement pure tier/scaling/eligibility rules in companion with tests.
4. Wire wolf and owner strikes into normal combat and settlement; count attack
   actions once, not per AoE target, and keep all expansion behavior flag-gated.
5. Add transient stacking/cooldown state through existing pet session/tick,
   refresh displayed pet stats and replicate owner-only counters where needed.
6. Update concise tooltips, requirements and manual quickslots. No new cast
   animation, aura, particle, sound or new animation opcode in this pass.
7. Unit/integration tests: I unchanged; II owner admission/loss; seventh-hit
   boundary,10m radius, target HP boundaries, unique immunity, exactly-once
   rewards, blocked/multi-hit attacks, no recursive AoE, mark consumption and bleeding-only burst.
8. Back up the test DB, deploy, and test on weak monsters using a disposable
   wolf test character. Verify all tiers and owner interactions, relog cleanup,
   unchanged Bear/Penguin/Crow and expansion-off behavior.
9. Revise balance after testing. Only add animations after the user locks skills.

## Execute implementation and verification - 2026-10-20

All existing IDs and threshold values retained. Transient separate modulo-7
counters extend the private 0x3FB6 snapshot from8 to10 bytes; the client still
accepts the old8-byte payload. Execute III displays wolf stacks at top right.
Owner progress is authoritative and explained in the row tooltip.
Eligibility resets progress on death, separation, unsummon or book changes.
Only damaging committed monster attack actions count. Linked stages, proc and
periodic damage do not charge; one multi-hit/area action charges once.

Server tests cover owner tier gates, exactly-once kill credit, independent
wolf/owner seventh sweeps, strict10m/HP boundaries, no recursive counters,
eligibility cleanup, and real owner single/area multi-impact and wolf attacks.
Full Go module tests and module lint pass. Client training tests and four
source gates pass; portable repository checks pass14 tasks. Those checks do
not substitute for live field verification. Deployment/live results follow.

Backup before deployment: external outputs/pet-design-codex/
wolf-execute-backup-20261020-224913; SQLite online backups integrity checked.
No migration or persistent character edits required. Changes uncommitted.

Deployment: Agent healthyv2, GameWorld healthyv3. Initial live world entry
failed because the already-running old simulation worker rejected10-byte
0x3FB6. A full browser reload loaded the new decoder and auto-resumed into the
world successfully. Reconnecting inside the same old page is insufficient.
The updated row tooltip visibly displays separate wolf/owner0/7 counts.
Actual group execution sweep is verified by combat integration tests, not yet
by a completed live field trial. Do not describe the full Wolf rework as done.

## Offensive kit implementation - 2026-10-20

All four replacements now use the approved book IDs and scaling above. Legacy
unmigrated trees retain their original definitions; current tree version2 keeps
learned arrays, passive slots, gear and quickslot IDs intact. No migration or
manual character rewrite is required. No new art, cast animation, VFX or sound.
Howl uses native action-speed projection/frames and the existing row cooldown.
Its temporary party grant is snapshotted at cast and strongest-only; source
ineligibility or logout removes grants. Existing attack animations follow speed.
Rend uses the ordinary approach/attack, cleave and resisted bleeding pipeline;
the old bite's separate30% execution is absent from the replacement.
Bloodscent stacks and Killing Spree damage add once, capped at+100% combined,
with tierIII critical bonus capped at5 points. Stack/kill expiry is6seconds.
TierIII Spree cooldown recovery is1..2seconds, max once per second per wolf;
remaining timers stop at ready, and no automatic/repeated cast is generated.

Private counter payload0x3FB6 is now12bytes: earlier8/10bytes plus wolf and
owner Bloodscent counts. Decoder accepts8,10,12 only and validates every field.
Both passive rows show authoritative wolf stacks; row help includes owner
progress. FULL BROWSER RELOAD is required when updating an already-open client.

Verification:14 client training tests, four client source gates, all Go module
tests and module lint,14 portable repository checks passed. New real owner
attack test confirms Bloodscent changes damage. New real pet attack tests
verify Rend1/3/5 targets and bleeding; deterministic tests cover all Howl target
sets, party range, expiry, strongest-only, no emotes, town rejection, stacks,
owner tiers, kill buff refresh and cooldown cut throttling. An unrelated mentor
async test failed once and passed its targeted retry and subsequent full run.
Backup: external outputs/pet-design-codex/wolf-kit-backup-20261020-231108.
Source changes remain uncommitted; live deployment/field results follow.

Live smoke test: full client reload auto-resumed LabPlayer/LabPetTest with
LabWolf90,13226HP and no target. All five renamed rows and existing learned
ranks appear. Number1 retained its binding and now casts Hunting Howl III
without an enemy; the shared cooldown renders on all three books and on the
quickslot. No extra emote/stand-up/cast animation was emitted. Existing worn
items and characters were not rewritten. This was a UI/cast smoke test;
party field combat and long-form balancing remain manual acceptance work.

Additional correction: a real Savage Rend bleeding kill now grants Killing
Spree through the abnormal damage source's owner/companion identity; it never
charges either attack counter. The test stops direct attacks before the pulse
and verifies the kill,6-second momentum and unchanged counters. An uncredited
or different companion's periodic hit cannot impersonate the wolf.

Reports: apps/server/.state/wolf-kit-final-go.log (whole module),
wolf-kit-final-tests.log (action/companion after bleed fix), wolf-kit-bleed.log,
wolf-kit-final-deploy.log; .state/wolf-kit-client-final.log (4 gates),
wolf-kit-source.log (14 portable gates). These reports are ignored local files.

Final deployment verified: Agent healthyv2 / GameWorld healthyv5. Full browser
reload resumed successfully. Hunting Howl III casts from the learned skill
cell too: tooltip shows+30%,8s duration,party20m and25s base recharge; all three
books and quickslot show the same ticking cooldown. Main character13226HP,
LabWolf90 remains summoned; no target or combat order. Final live screenshot
is outside Git at outputs/pet-design-codex/wolf-kit-live.png. Final client4
source gates,14training tests, action/companion tests, modulelint0issues and14
portable repository gates pass. No commit/push performed. Further live party
and grouped-monster balance acceptance remains; do not claim it was tested.

## Field verification and Howl expiry correction — 2026-10-21

Resume here. The complete wolf kit is still uncommitted on
`feat/Attack-pet-expansion`. Use the `opensro-lab` checkout, not the shared
`opensro` source tree. LabBlader and LabPetTest were not used for combat or
rewritten by these test fixtures.

Two disposable level-90 characters, BondOwner and BondParty, entered the real
server beside native level-45 Bunwang (3454 HP). FieldWolf is level 90, without
pet equipment; the owner has a basic sword and defensive character equipment.
A test-fixture duplicate of learned skill 2 initially caused S2 / "Invalid
skill/bootstrap bindings". This was a fixture mistake, not a client parser bug;
removed the duplicate rather than weakening validation. The ignored fixture
now asserts unique source skills and uses the actual `0xf00000` pet shortcut
base. Howl III and Rend III were also bound through ordinary UI drag/drop.
Separate `localhost` and `127.0.0.1` game origins avoid shared browser cookies
replacing the two test sessions. Local helper: `.state/tools/wolflive` (only run
with authority stopped; it resets the disposable records).

Verified live so far:
- Two characters form a party and stay alive in the weak-monster field.
- Howl III casts without a target; its row and quickslot cooldowns agree.
- Rend III kills Bunwang in ordinary combat; the two nearby attackers were
  eliminated. This is not a measurement of its maximum five-target cleave.
- Killing Spree III rank 1 shortened the *absolute* saved Howl deadline by
  exactly 1000 ms after a real kill. Before/after JSON evidence is outside Git
  in `outputs/pet-design-codex/wolf-cooldown-{before,after}.json`.
- Execute help shows independent wolf/owner counters. Owner progress passed
  seven and rolled over while the wolf counter stayed separate. A live
  multi-victim low-HP execution sweep has NOT yet been accepted.
- Bloodscent help showed wolf 1 / owner 10 during combat, confirming independent
  authoritative pools and the owner cap. Screenshot: `wolf-field-bloodscent.png`.
- A temporary authenticated native-protocol test participant observed Howl III
  publish action-speed 130 for owner GID 100003, party GID 100004 and wolf GID
  33554435. No administrative access or combat-state mutation was used.

The observer found an actual bug: after eight seconds, the expiry frames were
only in the owner's private tick batch. Party/viewer animation speed stayed at
130 even though authoritative modifiers expired. `advanceWolfKit` now also
queues reset frames through the existing simulation publication lane, with
each recipient as SourceGID. That lane includes the recipient itself and its
own viewers, even after leaving the wolf's view. The generic action broadcaster
and wire format are unchanged.
`TestWolfHowlExpiryBroadcastsToRecipientViewers` fails on the old implementation
(missing public expiry), and passes with the correction. Action/companion tests
and whole-module lint pass; deployment/live recheck status follows below.

Remaining acceptance: live multi-victim Execute threshold/radius kills, a
maximum-cleave sample and extended balance testing. Deterministic real combat
planner tests cover these mechanics; do not label those live acceptance.

Final deployment/live verification: Agent healthy v0 / GameWorld healthy v2.
The first attempted broadcast adjustment was replaced before final acceptance:
`register.go` is unchanged. The final correction uses the existing simulation
queue per recipient, which includes the recipient's own session. This matters
because the synchronous generic observed-action broadcaster excludes an actor
that has not published itself. Do not reintroduce that generic routing change.

Final native observer log proves **all three** identities receive 130 at
1792560286160 and return to 100 at 1792560294328 (8.168 s, including tick time).
Owner 100003, party 100004, wolf 33554435. Evidence outside Git:
`outputs/pet-design-codex/wolf-party-final.log`. The observer is stopped.
Whole server module tests, action/companion tests, module lint (0 issues) and
`git diff --check` pass. Logs: `apps/server/.state/wolf-field-fix-{tests,full-go,lint,deploy}.log`.
No new client source changes, animations or asset edits were needed in this
field-testing continuation. No commit/push was requested or performed.
Live multi-victim low-HP Execute kills remain a specific manual acceptance gap;
counter rollover and independent pools were seen live, while radius/threshold
victims are covered by deterministic real-combat tests. Do not overstate that.


## Requested tuning and owner HUD — 2026-10-21

Hunting Howl now progresses +10..100%, +120..300%, +320..500% across
books I/II/III (rank1..10). The maximum skill bonus is +500%, including
+skills equipment; this means six times the unmodified attack rate before
existing combat interval floors. Duration, cooldown and recipient rules remain.
Bloodscent previously reset to +1% per stack in every book. It now progresses
1..2%, 2..3%, 3..4% per stack, so promotion never lowers the damage value.
Stack limits remain 5/8/10; III still adds at most five critical chance points.
Canonical JSON, generated server data and client data match.

Owner Bloodscent, Execute III and Bear Crushing Paw II/III now have status
icons on the native top-left buff board. They use the selected book's owned
art, authoritative owner counters and the normal progress strip. A gold frame
means full damage stacks, or that the next qualifying hit releases a charged
passive. It is automatic readiness, not an extra manual button. Zero/reset
charges remove the gold state. Pet-tree badges still show the pet's own pool.
The display respects the client experimental setting and a living active pet.
No packet format or learned-rank migration is required.

Proposed Killing Spree replacement, pending the owner's approval: **Blood Hunt**.
I: four wolf hits mark prey; Savage Rend consumes the mark for a damage burst.
II: owner hits also charge the mark. III: consuming the mark also bursts nearby
bleeding enemies. Final values/radius/caps should be agreed before implementation;
no new animations until the skill direction is locked. Killing Spree is retained
in the deployed code meanwhile; do not claim Blood Hunt is implemented.

Validation for this tuning: full Go module tests and lint (0 issues), 38 focused
client runtime tests, four client source gates and 14 portable repository gates
pass. GameWorld healthy v3 / Agent healthy v0. Live LabPetTest shows the owner
0/7 Execute and 0/10 Bloodscent icons and hover help; screenshot outside Git:
`outputs/pet-design-codex/wolf-owner-hud.png`. Charged/gold/reset behavior is
covered by tests; a fresh full-charge combat screenshot is not yet recorded.
Source is uncommitted; no native archives or new animations were changed.

## Blood Hunt and speed/stat correction — 2026-10-21

- Blood Hunt replaces the approved Killing Spree proposal; current mechanics
  are described above. Saved IDs/ranks/slots remain unchanged. No migration.
- Fixed reversed Howl: native0x8c is a duration denominator. Owner receives
  a reciprocal FactorProduct; wolf animation/entry also uses the reciprocal.
  Melee/area action brackets shorten with Howl while preparation, projectile
  flight and authored non-action cooldown tails remain intact.
- Test of actual successive HP-changing attacks at maximum Howl: wolf1200ms
  to200ms; owner1300ms to300ms in the synthetic level1-owner fixture, sampled
  by100ms simulation ticks. This is not an assertion that every retail skill
  has exactly sixfold total cadence; reuse tails/flight still apply.
- Owner Bloodscent now writes attack-min/max parameters13..16 and critical12
  through the shared keeper. Removed the former extra post-formula owner
  damage multiplier to avoid doubling. Thus actual attack stats, login and
  0x343C character panel agree. Only changed numeric stats republish; the
  existing pet tick withdraws expiry/eligibility changes. Wolf damage keeps
  its existing bounded post-formula path.
- Server integration tests cover all mark books, owner tier gates, same-prey
  charge caps, retarget/expiry/unslot/flag-off reset, blocked/wrong-prey Rend,
  real Rend bonus amounts, bleeding-only burst and no repeated consumption.
  Existing owner multi-impact/AoE tests now also assert one Hunt charge.
  Client tests cover17byte packet bounds/target consistency, legacy packets,
  atomic refusal and4/4 owner HUD readiness; native/disabled HUD unchanged.
- Reports: apps/server/.state/wolf-{blood-hunt-go,blood-hunt-full,
  blood-hunt-lint,cadence-evidence,speed-stats-deploy}.log;
  .state/wolf-blood-hunt-{client,check,portable}.log. Temporary reports ignored.
- A long-idle pre-correction browser session hit “Damage effect capacity
  exceeded”. Reload clears it; no unrelated effect-pool rewrite in this pass.
  Record any recurrence with the corrected build rather than label it fixed.

- Final speed fix also covers peer companion snapshots, which otherwise
  overwrote the corrected howl animation speed on every scope update. A test
  compares peer, entry and cast values at maximum Howl. Action/companion tests
  and lint pass after this fix. Live resummon issue was diagnosed read-only:
  LabWolf had0HP (dead). LabPetTest returned safely to Hotan at fullHP;
  native Grass of Life revival and resummon succeeded.

- Final deployment: Agentv0 / GameWorldv6 healthy. Live final client shows
  revived LabWolf, preserved learned/slotted Blood HuntIII and0/4HUD/row help
  in safe Hotan. External screenshot: wolf-blood-hunt-ready.png. Fresh charged
  field combat/party regression and long-session effect-pool soak remain next;
  do not confuse the integration fixtures with complete live acceptance.

## Animations (2026-10-21, revised)

The wolf has its own look; the first pass reused the bear's roar aura and
shockwave and read as a bear copy. Now every wolf visual is a retail effect
program (no new asset files) listed in one table,
`apps/client-next/src/engine/foundation/animation/wolf-effects.ts`; the bear's
port models are never used. Every visual is driven by a COS emote (0x324B) on
the object it belongs to; gameplay never reads it.

| Signal | Sent on | Motion | Effects |
| --- | --- | --- | --- |
| 1..3 Hunting Howl | wolf; stops and holds 1.4 s | `pet-howl`: paws planted, chest dips, neck and head throw the muzzle at the sky, jaw pulses, ears fold (the bear rears up instead) | dark-red flush; white-tiger beast howl ring; II/III war cry on the owner; wolf shout |
| 4..6 Savage Rend | wolf, with the cast at the windup | `pet-rend` replaces attack1 on its timing: crouch, lunge, jaw snaps at 45 %, head-shaking tear | wolf-monster strike, large blood spray, II/III slash arc (bigger on III); blood sound |
| 0xF0 executed | victim | - | red blood death burst and blood-flower spikes where it was struck |
| 0xF1 Execute III sweep | wolf or owner | - | a wave of blood-flower eruptions in rings at 5 m and 10 m; battle howl, light shake |
| 0xF2 Blood Hunt consumed | prey | - | blood-touch strike and heavy blood spatter; life-drain sound |
| 0xF3 Blood Hunt III burst | each bleeding enemy hit | - | wide blood spatter on the ground |
| 0xF4 Bloodscent full | wolf or owner | - | crimson spiral wrapping the body and a pooled red glow |

Live (LabPetTest/LabWolf 90, Mangyang field): Howl III and Savage Rend III in
real combat (crouch, lunge, blood spray and slash on a 60,336 critical). All
signals were also inspected on the live client through a temporary preview
hook (removed). Tests: `wolf-effects.test.mjs` (every part published, compiles,
no bear model, sweep reaches 10 m), `wolf-howl.test.mjs` (both clips on all
four rigs: planted feet, muzzle to the sky without rearing, head shake),
petwolfkit_test.go / petwolf_test.go (signals sent and received).

## Test and bug-fix pass (2026-10-21, after the animation work)

Fixed:
- Quickslot pet skills did nothing after a fresh login or a world re-entry
  (teleport, return scroll, resurrection) until the pet window was opened: the
  bar asked for the 0x3FB1 state once per pet and never again. `petStateAsk`
  (foundation/ui/pet-training.ts) now re-asks while the state is missing, three
  times 3 s apart, and again whenever a received state is cleared. Live: a
  fresh login's Howl hotkey reached the server with the window never opened.
- "Damage effect capacity exceeded": a hit effect whose model never became
  resident (failed/stale asset) stayed in the 2048-slot pool forever.
  effects.ts now drops such independent one-shots 15 s after spawn
  (`UNREADY_ONE_SHOT_SECONDS`); damage-visuals.test.mjs reproduces the old
  throw with 2100 hits on a never-loaded model.
- An owner's hit on a player (ordinary-world PK) built owner Bloodscent stacks
  and Blood Hunt charges; `wolfExecuteAttack` now keeps monster victims only
  (TestWolfOwnerPlayerHitsBuildNoStacks).
- Full asset build crashed on the pet-loot GLB (`drop_pet_caravan_collar.bsr`
  has no retail BSR); buildEffectPrograms skips it (it borrows the chest's
  particles). The live "Unsupported particle rotation assignment" errors and
  invisible attacking monsters were stale assets plus the browser's
  `sro-next-verified-v1` cache; rebuilt assets and a cleared cache fixed them.
- resourceBuildGraph.test expected list missed main's `server-action-data` root.

Results: Go suite, typecheck, format, encoding, pipeline contracts and 4300
client tests pass. Environment-only failures here: race detector (no cgo/C
compiler), govulncheck (local Go 1.27.2 toolchain), four Python asset tests
and check-client-preparation (need Python 3.12 `os.path.isjunction`);
asset-stream-progress is timing-sensitive under full-suite load and passes alone.

Still not live-accepted: Savage Rend, Execute (incl. multi-victim sweep),
Blood Hunt bonus/splash and Bloodscent visuals; Southern Hotan White Spiders
killed LabPetTest twice before a target could be selected. Use weaker monsters
and HP potions for that pass.
