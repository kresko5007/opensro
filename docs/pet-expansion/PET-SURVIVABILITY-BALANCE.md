# Pet survivability balance — 2026-10-24

Port-only attack-pet expansion. Native behavior with the expansion disabled stays unchanged.

## Targets

Against a same-level party giant, a full-health, ungeared pet without defensive
skills should die in approximately: Wolf 2 ordinary hits, Bear 3, Penguin/Crow 1.
These are balancing benchmarks, not fixed damage overrides. Critical hits, other
monster attacks, magical damage, shields, passives and rolls can change the count.

The retained `TestPetPartyGiantSurvival` uses real retail default attacks at their
normal midpoint roll, native rarity 0x14 scaling and actual COS defenses. It
checks all four species at levels 10,20,40,60,80,90. All 24 cases pass.

| Level | Bear HP | Wolf HP | Penguin/Crow HP |
|---|---:|---:|---:|
|1|20|16|10|
|10|185|165|100|
|20|245|235|160|
|40|390|350|230|
|60|1025|900|590|
|80|5000|4500|3000|
|90|11000|8100|4800|

Intermediate levels interpolate. The current retail-cap curve stops at level90;
levels above90 retain that endpoint and require a separate higher-cap balance pass.
Bear defense is100% of native reference defense, Wolf70%, Penguin/Crow40%.
Existing role-specific attack multipliers and all learned skills are unchanged.

## Gear

The requested growth mainly affects survivability. Each valid item adds an
explicit white maximum-HP stat: degree ×100/3 percent. Bonuses add across the
three correctly matched, level-eligible slots, capped at +900% maximum HP.

A full D1 set gives2× base HP; D2 gives3×; ...; D9 gives10×. Existing flat defense
and blues still work, so this is an HP cap, not a hard cap on effective survival
with defensive skills. No new global attack multiplier was added.

Equipping increases capacity without free healing. Removing gear clamps HP;
revival, summoning, growth, restoration and potions use the same effective maximum.
Clone hatch HP snapshots source HP once, without applying equipment twice.
The item tooltip shows the HP bonus in white; owned pet gauges use the new curve
and equipped HP when Resolve expires.

## Editing

Edit `docs/pet-expansion/pet-design.json`:

- `pets[].healthByLevel`: strictly ascending level/HP anchors.
- `pets[].defensePercent`, `magicDefensePercent`: native defense multipliers.
- `gear[].items[].baseStats.maxHPPercent`: per-item HP bonus.

Run `python scripts/tools/pet_design_export.py`, then the action, companion and
enterworld tests plus the client check. Generated copies are not edited by hand.
No persisted field or schema change is needed. Existing gear adopts the new base
stat automatically. Existing over-cap pet HP clamps on restore/summon.

## Deployment / Claude handoff

Initial balance deployment used Agent14 / GameWorld44; the subsequent rollout
restores SRO_ATTACK_PET_EXPANSION=on (plain deploy defaults it off). Always set
that environment variable when deploying this experimental branch. Shared credentials remain in
`../opensro/apps/server/.state/cluster`; authority stays in this worktree. Schema29
was upgraded earlier with verified backups; all four original records were byte
identical immediately after that upgrade. The old temporary crow owner/party
positions and HP/MP have now been restored (`.state/crow-merged-fixture.json` has
`cleanupRequired=false`). No GM was granted and no valid item was consumed in that
unfinished crow-test attempt. Full post-merge crow live acceptance remains pending;
do not count its setup as a successful skill test.

Validation: all action/companion/enterworld suites pass, scoped lint0 issues.
The retained tests also check D1-D9 HP totals, expansion-off behavior, no free
healing on equip, removal clamping and tooltip color. All12 final client gates pass (107.7s); source gates pass except
the known local cgo/race limitation. The final client gate log is
`.state/pet-survival-client.log`. No commit/push requested for this balance.

Final local deployment: Agent14/GameWorld45 both1/1healthy, expansion flag
verified on and transport readiness200. Deploy explicitly with
`SRO_ATTACK_PET_EXPANSION=on`; the default deploy otherwise disables pets.

Live client acceptance: LabPetTest entered safely with full13226HP/6700MP.
Existing level90 LabWolf and its D5 collar show15927/21600HP, matching
8100×(1+166.6667/100). Existing learned wolf books and highest passive selections
remain intact. Initial stale native39434HP was a spent client ask budget after
the feature-off rollout: resetting asks on re-entry and opening the pet window
fixes automatic refresh. No live party-giant fight was staged in this pass.

Final client retry fix verified by the full12-gate suite (107.7s). Live HP
evidence: `.state/pet-survival-live.png`, cropped `.state/pet-survival-hp-proof.png`.
