# Gear proc live acceptance — 2026-10-24

Tested the running local server through ordinary authenticated game transport,
using LabPetTest, its level-90 wolf and weak level-37 party-giant archers.
The user approved temporary GM for spawning and cleanup. Guaranteed-chance
fixture charms made cooldown/damage checks deterministic; global loot/drop
rules and normal rolled probabilities were never changed.

## Results

All **20 combinations** passed: five spells × two trigger directions × D3/D9.
Each case checked the actual equipped reference and encoded blue before combat.

| Spell | D3 | D9 | Trigger coverage |
|---|---:|---:|---|
| Chain Lightning |325 initial damage|1,000 initial damage|Dealt and received|
| Fire Burst |325 damage|1,000 damage|Dealt and received|
| Blizzard |81/81/81/82 pulses =325|250×4 =1,000|Dealt and received|
| Poison Cloud |81/81/81/82 pulses =325|250×4 =1,000|Dealt and received|
| Mend |661 HP|661 HP|Dealt and received, injured owner|

Mend correctly uses 5% of 13,226 maximum owner HP, rounded down, independently
of damage scaling. Full-HP owner cases also caused no overhealing.

Attack-triggered Chain/Fire proc intervals were at least 2,000 ms. In the
three-attacker retaliation test, damaging hits arrived 899 ms apart while
first chain hits remained at least 2,200 ms apart: hits during recovery did
not bypass the shared 2 second timer. The chain hit multiple distinct targets
with 1,000/800/640 damage; earlier D3 chains showed 325/260/208/166.

Poison/Blizzard fields can overlap. Absolute HP packets may include direct
attacks from the same tick, so isolated retaliation sequences were used to
prove exact four-pulse totals. Native cast impacts were subtracted when
checking fixed proc damage. Field pulse cadence is separate from the
internal proc cooldown and must not be mistaken for extra casts.

## Findings and limits

No production gameplay defect was reproduced. The test harness was corrected
to respect the normal 20 second combat lock and locate items by their actual
inventory slots after swaps; rejected swaps were excluded from acceptance.
Tests never bypassed that combat rule. A transient transport 502 during a
restart was retried after server readiness recovered.

This pass verifies live gameplay damage, healing and recovery. It does not
verify naturally rolled proc frequency, D1–D9 distribution or new bespoke
spell visuals. Existing server tests cover all degree data and spell guards;
only D3/D9 were measured live. Blizzard reuses its existing frost visual.

## Evidence and restoration

Ignored local evidence: `.state/pet-procs-live.jsonl`,
`.state/pet-procs-live-proof.json`, `.state/pet-procs-incoming-evidence.json`.
`.state/pet-procs-live-assert.py` passes 20 live cases, exact field totals,
Mend healing and both cooldown checks. Raw bootstrap/backup files remain
local and are not intended for Git.

The original LabPetTest record/inventory is preserved in
`.state/pet-procs-live-fixture.json` and the full consistent database backup
`.state/pet-procs-live-before.db`. Initial ice-caster AoE reached the nearby
BondParty observer; its affected HP and pet inventory state were also restored
from that backup. LabBlader and BondOwner were untouched. All fixtures are
removed by restoration, and the backend restart removes transient GM spawns.
No source-code fix or commit/push was needed for this testing pass.
Final cleanup verified: all four character records match the pretest backup semantically; temporary GM revoked. Agent26/GameWorld62 are healthy, both readiness checks pass, and the client was refreshed.
