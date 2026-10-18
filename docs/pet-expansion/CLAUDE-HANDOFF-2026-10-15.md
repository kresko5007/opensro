# Claude handoff: pet training, sequential books and manual casting

Updated 2026-10-15. Work ONLY in `E:/CodeProjects/opensro-lab`, branch `feat/Attack-pet-expansion` (created from `AttackPetRework`). Skill testing is postponed at the user's request; this checkpoint is saved in Git. Read `REVIEW-2026-10-14.md` here for the earlier bug review. Hub `E:/CodeProjects/opensro` supplies generated game assets and cluster credentials; do not edit its sources.

## Current level-90 checkpoint — read before historical notes
**2026-10-16 flat equipment + DB blue rules (current):** pet gear now sums
flat physical/magical attack, physical/magical defense, hit and parry before
percentage modifiers. Collars: attacks/hit; harnesses: defenses/parry; charms:
smaller bonuses to all six. The shared exporter emits baseStats for Go and TS.
Implicit damage/defense/cooldown percentages were removed; these exist only
as actual rolled blues. Old workbook implicit columns are legacy. Saved blue
values/IDs are unchanged, not rerolled. Tooltip has native stat labels, then
blue effects, then pet requirements; no drag instructions or stack amounts.

Runtime loads validated authority table `pet_affix_rules` (100 catalogue tiers)
with minimum, maximum, selection_weight and roll_power. Seeds only absent rows,
preserves edits. Only implemented/degree/slot-eligible tiers can roll. Weight0
excludes a tier. Power1 is uniform, power3 favors low rolls; max20. Cooldown
code77 defaults13..50%, weight40, power3; codes75/76 retain5..8 and9..12.
Degree floors still apply. Total cooldown reduction remains capped80% and is
shown in blue under the gold equipment summary in Pet Inventory. Config edits
apply after restart to future drops only. See PET-LOOT-DB-CONFIG.md.

Wire0x3FB1 profile extension2 carries six flat bonuses and effective cooldown;
new client still accepts extension1. Deploy matched client/server. The server's
reference already has species defense applied; petTrainingDefense must apply
species scaling only to added equipment, not multiply the reference twice.
Final regression explicitly covers this. Source remains uncommitted.

Verification: all companion/store/action/wire/gameworld tests pass
(pet-base-stats-tests-final.log), 12 client tooltip/training/SoX tests, 3 asset
projection tests, tsc and Go vet pass; pinned lint0 issues (pet-stats-lint.log).
Existing client ownership/format debt documented above remains outside scope.
Live LabBear90: swapped Rawhide Collar D1 for existing Dragonbone Collar D9;
hit89->97, physical min1299->1396, magical16->46. Restored the original Rawhide
Collar with its blue options; Rope Harness D1 and Primal Charm D9 untouched.
Pet Inventory displays Equipment3/3 and cooldown0% (this loadout has no cooldown
blue). No new50% item was granted/rolled in this test. Tooltip screenshot:
pet-base-stats-tooltip.png. Owner position Niya X-1454,Y2440, HP full; pet HGP13%,
so do not start combat without feeding it. No farming or full pet-skill retest.
Final deploy log pet-stats-deploy-final.log; rates remain20/mix-on/cap16,
petGearDropFactor0.10. Refresh DBeaver Tables to see pet_affix_rules.
**Pet tooltip header follow-up:** headings now use the workbook's plain gear
name, removing the published `(Degree X)` suffix. Gold identity rows below
show native "Mounting part: Collar/Harness/Charm" and "Degree: X degrees".
All27 item/degree combinations plus ordinary equipment regressions and tsc pass.
This is shared tooltip presentation only; item IDs, saved names/data, rolls and
equip behavior are unchanged. Client refreshed for the new code.
**2026-10-16 pet equipment tooltip footer:** shared item-tooltip.ts suppresses
maximum possessing/quantity rows for pet gear only, removes the legacy inline
"Needs pet level" sentence, and appends "Level: Pet level X required" then
"Pet" after blue options. X comes from current workbook-exported gear data
(D9=76), not stale published descriptions (which still said77). Normal ETC
quantity rows remain. No item references, quantities, rolls or requirements
were changed. Client refreshed; owner visually checked and approved the result.
Five targeted tooltip/regression tests pass, including all27 gear refs and
ordinary stack rows; TypeScript passes. verify:quick remains blocked by existing
ownership violations in viewer-camera.ts, pet-design-data.ts and pet-training.ts.
Formatting check also reports existing unformatted tooltips.test.mjs; changed
files were formatted. Source changes remain uncommitted.
**2026-10-16 drop-rate experiment REVERTED at owner request:** restored
`SRO_BETA_DROP_RATE=20`, `SRO_BETA_DROP_MIX=on`, cap16. The temporary
1000x parser-limit increase and its test changes were also reverted; supported
maximum is again100. Pet DB factor remains0.10. No character/item rollback.
Focused progression parsing tests pass. Deployment log:
`drop-rate-reverted-deploy.log`. Do not restore the superseded 100x/1000x
settings on a later deploy.
**DB RULE IMPLEMENTED; LIVE PET PICKUP STILL PENDING, 2026-10-16:** the owner requested
reuse of normal equipment drop probabilities/degrees and a DB multiplier.
The temporary workbook-based100% experiment was cancelled BEFORE live kills;
all four files were restored byte-for-byte and normal binaries redeployed
(`live-drops-normal-deploy.log`). Do not run its restore script again.

New code derives pet loot only from admitted character-equipment drops, using
their native itemClass degree; normal loot probabilities, rank, beta passes,
capacity and level-gap rules therefore apply automatically. No extra unique
degree promotion or independent workbook drop probability remains. Blues retain
their existing separate degree-based rules. DB meta key `petGearDropFactor`
is a finite0..1 chance per normal equipment drop, default0.10, read at startup.
Safe offline tool: `go run ./cmd/tools/sro-pet-loot -authority-dir <dir> -factor <n>`.

The live test used temporary DB factor 1.0 (`pet-db-factor-deploy.log`).
The backend was then stopped cleanly and the tool restored the DB to **0.10**.
Restart completed: Agent and GameWorld both 1/1 healthy, deploy exit 0
(`pet-db-factor-restored-deploy.log`). Live GameWorld stdout at 08:13:49 reports
`pet loot: DB factor 0.1 per normal equipment drop`. Actual authority is
`E:/CodeProjects/opensro-lab/apps/server/.state/shards/global-official/authority`.
The DB backup is `live-drop-backup/authority-before-factor.db`.
Do not restore the whole backup after gameplay, because that would discard
new character/item progress; change only the factor.

Live evidence: normal Niya General/Royal Guard kills completed through pet
Attack commands. AutoGrab's visible action was double-clicked for real pickups:
gold, Special Universal Pill (small), Forgotten horn, Broken shield, Soft desert
sand and General knife. **No native equipment or new pet equipment appeared**;
same-degree matching and blue tooltips remain unverified in the live client.
The old Chain Harness D5 in the bag is NOT evidence of a new monster drop.
Several moving-monster clicks hit ground and moved the owner instead; use a
fresh screenshot and confirm target in AX before Attack. Close guard selection
did work. Do not replace this missing live evidence with fixture results.

Owner LabPetTest remains level 90; LabBlader was not modified. User changed
Bear to LabWolf before leaving the session idle. During the final return-scroll
cast the owner died to an unselected guard (Niya X1428,Y2325); town resurrection
was clicked before shutdown. Reconnected successfully: **Hotan X113,Y15,
HP13226/13226, level90, LabWolf summoned, gold943852**, all six named pickup
types still in inventory. Screenshot `pet-loot-db-restored-town.png`.
About 15 of the
50 X-large HP potions were consumed by recovery during this run, and minor death
XP was lost. On reconnect the HP potion stack displayed 50 again (existing
login resupply behavior; no manual refill was performed). Pickups/progression
were preserved; no DB rollback was performed.

Focused/full action, store, companion and gameworld tests pass; added factor
boundaries, non-equipment exclusion and saved DB validation/restart coverage.
Vet and final pinned lint pass with zero issues (`pet-native-table-lint-final.log`).
Source remains uncommitted. Next: verify a native equipment + same-degree pet
drop/pickup together, inspect its degree/blues, then test other degrees and
save screenshot evidence. Use safer combat positioning and monitor HP; do not
leave the character taking damage while reading source or casting a long scroll.

**2026-10-16 count-overlay fix (committed `6fd8325a`):** `item-count.ts` now uses the
existing `isPetGearRef` predicate to suppress stack digits for pet equipment.
Normal consumables still show quantities, including their final unit. Six
count-rendering tests and client TypeScript check pass. Reloaded and logged
back into LabPetTest; Chain Harness D5 visibly has no `1` in the player bag.
Proof `pet-gear-no-count.png` in the evidence folder. User moved the character
to Niya Remains X1568,Y2573 and changed the active pet to Bear; these were
preserved. No equipment, item or server state was edited for this fix.

**2026-10-16 monster-only loot tests and NPC restriction:** shared merchant
offer enumeration now rejects pet equipment references, both standalone and
inside packages. This hides them from catalogues and rejects forged direct
purchase requests, with expansion on or off. Normal merchant purchases remain
covered by the existing commerce suite; returning a player's own sold item
through buyback does not create fresh gear and is unchanged.

`petloot_test.go` covers all27 degree/slot drop plans with forced random draws,
their blue caps (including D9 six), NPC listing/purchase rejection, and a real
fatal attack through ground publication, ground snapshot restore and ordinary
pickup. Blue options and ownership survive; replayed kills/pickups cannot
duplicate the item. Ordinary native loot still drops alongside pet gear.
These are deterministic server integration tests, not a live random-drop claim.
Action, companion and commerce package tests pass; action vet/lint pass with
zero issues. Logs: `pet-monster-source-tests.log`, `pet-monster-full-tests.log`,
`pet-monster-lint.log` under the evidence folder. Runtime drop probabilities
are unchanged; no guaranteed-drop testing override was deployed.

**Latest degree balance and artwork checkpoint (2026-10-15):** see
`PET-GEAR-DEGREES.md`. D1–D9 use character thresholds1/8/16/24/32/42/52/64/76,
blue caps1/2/2/3/3/4/4/5/6 and increasing roll floors0–50%. D9 rare rolls
can reach six blues. Worn storage expanded to six; legacy five-option saves
still load. Existing items are not rerolled. Never downgrade to a five-option
server after issuing six-option gear. All27 degree-specific icons, the richer
collar ground model and the workbook source are included in this commit.

Verification: companion, action, store and item/wire Go package tests pass;
focused Go vet and lint pass (zero issues); nine asset/pipeline and seven
client pet tests pass, including six-option client decoding. Client TypeScript
check passes. The broader `verify:quick` ownership gate still flags existing
shared object constants in viewer-camera, pet-design-data and pet-training;
this change adds no shared state and does not change that architecture.
Skill/combat testing remains postponed. Evidence logs: `pet-degrees-*.log`
under `E:/CodeProjects/SRO/outputs/pet-design-codex/`.

Deployed successfully: fresh server binaries, asset publication and game-data
bundle revision `workspace-pet-degrees`, manifest SHA256
`bdd64310da1759f57ff50b19d23f93d74644903f0641f957d86b97551a6249f7`.
Agent0 and GameWorld0 both1/1 healthy. Browser reload resumed LabPetTest90 in
Hotan X110,Y15, full HP/MP, Penguin summoned and inventory intact; no renderer
warnings/errors. Proof `pet-degrees-live.png`. No live random-drop/combat sweep
was performed; the new roll/cap behavior is covered by server tests above.

**2026-10-15 loot visual follow-up:** skill testing remains postponed. Owner-selected
Caravan collar concept2 is now an owned, textured low-poly ground prop, bound to all27
pet gear items and published live. See `PET-LOOT-MODEL.md` for editable source, rebuild
command and validation. Live comparison with the native gold chest passed; test collar
and Cloth Shell both recovered, Penguin re-summoned, owner safe in Hotan. Inventory
slots changed from normal pickup (collar now bag6, Cloth Shell bag17); no item lost.
These new asset changes are uncommitted after checkpoint `72c4378b`.
Owner follow-up applied: collar geometry uniformly scaled1.8 (80% larger),
native armor-chest ambient glow reused through existing particle modifiers.
Seven focused tests and scripts check pass; enlarged glowing drop checked in-game
and recovered. Preview `pet-loot-collar-large-glow.png` in the same evidence folder.
Metadata-only BSR publisher now preserves the owned synthetic resource entry.
Texture enrichment follow-up: original1536x1024 six-tile atlas now replaces the
simple64x64 swatches in the live GLB (old swatches retained). Rich stitched teal
leather, floral engraved brass, turquoise veining, braided trim and crimson silk;
one shared embedded texture, inset UVs and corrected radial medallion/gem mapping.
Scale1.8 and native chest glow unchanged. See PET-LOOT-MODEL.md.
Live textured drop/pickup verified without renderer warnings/errors; item recovered,
Penguin restored. Proof `pet-loot-collar-rich-textures.png`. Seven focused checks pass.
Inventory icon follow-up:27 distinct owned32x32 gear icons, three families across
degrees1–9. See PET-ITEM-ICONS.md for sources, export path and server reference
reload requirement. Nine focused asset/pipeline tests pass. Still uncommitted;
skill testing remains postponed.

Icon deployment completed: all27 client bindings and `ui-icons` pack entries
verified; server bundle rebuilt with revision `workspace-pet-icons`, then Agent0
and GameWorld0 restarted1/1 healthy. Live inventory confirms new pet gear artwork;
all27 exports validated, not all degrees individually tested in-game. No renderer
warnings/errors. Proof `pet-icons-live-inventory.png` and `pet-icons-*.log` in
the evidence folder. Latest browser state: inventory open, LabPetTest90 safe in
Hotan X110,Y15 with Penguin90; full HP/MP. No database edits or skill testing.

Final browser state: **LabPetTest90 safely in Hotan Kingdom X113,Y15**, HP13226/13226, MP6700/6700; Penguin90 summoned, highest passive books selected, BasicInfo open. Original **Free Camera restored and confirmed selected**, then saved. Screenshot `E:/CodeProjects/SRO/outputs/pet-design-codex/pet90-final-safe-town.png`. Tab6 retained for continuation. ReturnScroll completion was visibly verified; do not resume from the old field/death checkpoints below.

LabPetTest is the separate level90 test owner; LabBlader and its pets remain unchanged. The offline repair below was **applied**, both Agent/GameWorld restarted healthy at Nomad version0 (same combat source as prior v5). Owner now wears native Hades Pegasus armor and has a half-level XP buffer. No new backend defect was reproduced or backend source changed during these live tests.

Live acceptance this continuation:

- **Crow Mend III:** manually triggered from number7 with no enemy; all three heal books disabled together. Owner was full HP, so healing magnitude is not accepted. Evidence `crow90-tier3-shared-cooldown.png`.
- **Crow Mark III:** selected stationary Ultra Blood Devil, pressed8; native weakness status appeared, pet struck/killed target. Row displayed **10 attacks** remaining afterward; repeated command was refused as row on cooldown. All three books disabled together. Evidence `crow90-markIII-counter.png`. Full12-hit recharge completion and precise defense reduction remain unmeasured live.
- **Wolf Howl III:** selected Ultra Blood Devil, pressed1; row timer disabled all books, pet attacked/killed target. Evidence `wolf90-howlIII-cooldown.png`. Exact fear duration/radius not measured on surviving monsters.
- **Wolf Bite III:** pressed2 with a different selected Ultra Blood Devil; pet approached, attacked/killed it; row showed4s remaining with all books disabled. Evidence `wolf90-biteIII-cooldown.png`. Bleed duration not measured on surviving monsters.
- **Penguin Freeze III:** targeted cast killed weak monsters; immediate repeat was refused with “Deep Freeze III is not ready: its row is on cooldown.” Do not infer surviving-target freeze duration from this.
- **Penguin Nova III:** selected plant target and pressed5; nearby weak monsters disappeared, XP advanced. Cooldown had expired before screenshot after a slow browser response, so this is cast/kill evidence, not a captured timer-duration measurement.
- **Penguin role and passive:** live HP27603, physical attack0, magical11684–13691, defenses1413/3867. Switching Cold Mastery III1 to I10 immediately reduced magical attack to9654–11312; III restored and verified selected. Evidence `penguin90-role-stats.png`, `penguin90-coldmastery-I.png`.
- Bear RoarIII/IronHideIII shared timers and ThickHideIII defense increase were verified earlier in this level90 run (details below). Thus all eight active commands have been exercised; this is **not full effect/proc acceptance**.
- Fixed attack-range hover was verified live: `bear90-full-attack-hover.png` shows “Physical attack:2490 ~2917”. Previous source/typecheck/21-test results below remain valid. No further code change was needed this continuation.

TEST character hotbar now has all eight highest books: **1 HowlIII,2 BiteIII,3 RoarIII,4 IronHideIII,5 NovaIII,6 FreezeIII,7 MendIII,8 MarkIII,9 HP X-large x50,0 MP Large x50**. Wrong-species abilities remain dim/unavailable. Preserve slot9: native automatic HP recovery uses it. No potion consumption or additional owner death occurred this continuation; HP stayed13226/13226 at final field observation. Current maxMP is6700 after native heavy-armor equipment calculation.

Remaining live acceptance: nonlethal status durations/radii/target limits and party/unique rules; exact damage/heal/defense effects; Mark full counter completion; advanced periodic procs (Crushing Paw/Static Feathers/Murder) on a sufficiently durable target, conditional Execute/Scent/Carrion/LastStand and speed behavior. Existing integration fixtures cover these implemented paths but are not live game evidence. Do not claim Planned workbook perks are implemented. Use a durable isolated target rather than letting a level90 pet erase a level46 plant before status/proc observation. Never stand in combat while doing long source reads.

## Level-90 setup and earlier checkpoints (historical)

Safety correction: isolated **LabPetTest died once** while standing among Maong during source inspection; ReturnScroll was interrupted and its large HP potion stack depleted. Native death dropped owner90→89, correctly preventing90 pets from summoning. Original LabBlader unaffected. Resurrected in Hotan; rebound TEST slot9 to stocked HP X-large x50. Prepared/validated `repair-pet90.go` on dry-run DB: restores test owner90, STR227/INT110, banks half native level90 XP (140836186) to avoid immediate delevel, equips six native degree8 heavy armor pieces with correct references/type flags/durability, moves previous test armor into free bag slots. Uses store.UpdateCharacter, no GM access/changes to original character. Repair source preserved in scratch; logs `pet90-repair*`. Stop battle testing before doing lengthy code inspection; go to safety rather than trusting a return cast under attack. Be explicit about the one test death; older no-death notes refer to earlier checkpoints.

Earlier checkpoint: ReturnScroll went to **Hotan** (copied appointed town). Switching ThickHideIII→I changed displayed defenses2859/3673→2417/3108 immediately; III restored before reload. Screenshot `bear90-hide-I-stats.png` records lower book. Found/fixed attack min/max ellipsizing: expansion BasicInfo supplies full physical/magical range on hover via existing `region` helpText controls (`pet-stat:67/77`), preserving native layout/off behavior. Source runtime/ui/ui.ts. `pet90-types.log` typecheck PASS and `pet90-client-tests.log`21 pet/COS tests PASS. Hover subsequently verified (see current checkpoint).

Live: LabPetTest90 enters world successfully (HP13226/13226, MP6817/6817). Wolf90 summons; allIII actives enabled, passiveIII rows slotted. Bound Wolf HowlIII/BiteIII to4/5 on TEST character only. Switched Bear90; RoarIII activated with no selected enemy and drew nearby weak Mangyang. IronHideIII activated immediately without a basic attack; all3 books in each active row share their timer (screenshot `bear90-tier3-shared-cooldowns.png`). Selected one taunted Mangyang and ordered a normal Bear attack. Started one ReturnScroll to travel to sturdier low-level targets; weak Mangyang die on one strike, preventing useful proc-duration observations. Temporary Third Person camera is useful: it follows character facing; Quarterview merely locks pitch, not overhead. Restore Free Camera when finished.

User explicitly chose a separate level90 character, preserving LabBlader. Created **LabPetTest**, characterID2, same LabPlayer account. Cloned test inventory/pet gear only for this local test character. Original LabBlader matched its stopped backup byte-for-byte immediately after provisioning; later logins may update normal lastSeen timestamps.

- Graceful Nomad stop completed. Backups: `pre-level90-tests.db` (online) and **`pre-level90-stopped.db`** (after clean shutdown), both integritycheck OK.
- Used store.Open/CreateCharacter (native ID watermark and authority lock), correct native `_090` character references and actual companion.Learn gates. Previewed against a backup first. Provisioning source preserved in scratch `prepare-pet90.go`; ignored build source is server `.state/tools/pet90/main.go`. Tool refuses an existing LabPetTest and never overwrites it.
- Four cloned pets90: Wolf ref6195 HP39434; Bear ref23729 HP86754; Penguin ref23028 HP27603; Crow ref22888 HP35490. HP includes role profiles. All five rows I10/II10/III1, highest passive books auto-slotted, gear/blues retained.74 operator bonus points per pet plus31 natural points funds105 ranks. Original pets40/ranks/gear retained on LabBlader.
- Test owner level90, STR/INT +50 over the level40 template; no GM privilege added. Full test HP/MP provisioned, current values normalized by normal gameplay. No host protection/network settings changed.
- Logs: `pet90-stop.log`, `pet90-dryrun.log`, `pet90-provision.log`, `pet90-deploy.log`. Restarted Agent/GameWorld both healthy at Nomad version0 after job re-registration, same GameWorld source as priorv5 (no code rollback).
- Character selection, all four summons and all eight advanced shortcut bindings subsequently verified; see current checkpoint rather than repeating setup.

## Earlier level40 advanced passive verification (historical)

Final state: browser remains in LabBlader40 at Grassland X6404 Y587, full3831/1450, LabPenguin40 Defensive, skills window open. No live skill ranks/points/gear were changed this follow-up. Verified the **unlearned Static Feathers III tooltip in-game**: current/next effect says up to5 targets, unmet level90 and predecessor max-rank requirements are red. Screenshot `E:/CodeProjects/SRO/outputs/pet-design-codex/advanced-feathers-tooltip-fixed.png`. This is live tooltip acceptance; its actual TierIII proc remains simulation-tested. Original Free Camera option restored and confirmed selected. Existing hotbar4–8 preserved. Final check covers all12 implemented advanced passive families, five offensive TierIII status casts, Mark recharge/recast and MendII magnitude. No backend combat defect reproduced; production changes this follow-up are the three shared tooltip corrections only.

- User confirmed they will leave the browser idle. Continue preserving all existing characters, pet ranks, gear and quickslots. No database edits, pet-level boosts or backend deployment were needed in this follow-up; GameWorld remains v5.
- Fixed **three actual tooltip regressions** in shared `petEffect`: advanced Crushing Paw showed every6th/single target instead of every5th/up to5 targets; Static Feathers still claimed3 targets instead of5; Murder of Crows still claimed every10th instead of every8th and omitted current Myopia. Current effect text now follows inherited proficiency at higher books and at rank5/10. Original workbook templates stay canonical; dynamic current-effect display is derived from their family/proficiency, as for Mend/Howl.
- Reproduced the old tooltip failure first (`passive-tooltips-before.log`), fixed it, and passed regression assertions (`passive-tooltips-after.log`). Source: `apps/client-next/src/engine/foundation/ui/pet-training.ts`; tests: existing pet-training.test.mjs.
- Added `action/petadvanced_test.go`: all12 implemented passive families at TierIII, reached through real sequential learning/prerequisites and automatic slotting. Actual attack-order/tick/status path verifies advanced Crushing Paw stun, Static Feathers shock and Murder of Crows Myopia. Other checks exercise Scent critical condition, Carrion killing-only healing, Last Stand strict40% threshold/native-off, all defense passives, actual Cold Mastery skill damage, Swift Wings attack interval factor, Execute normal-target finishing and unique immunity. These cover implemented effects, NOT the workbook perks explicitly labelled Planned.
- Mark Prey II now has a full simulation test: spends12 attacks, subsequent real hits drain to0, then a second manual cast applies Decay. Mend II test verifies exact inherited extra50% healing without a target. Expanded existing status tests to Howl/Bite/Nova/Freeze/Mark TierIII with valid pet90 learning gates. No live pet levels or ranks changed for fixtures.
- Integration report `advanced-passives-integration.log`: all checks PASS. An initial unique-immunity test mistakenly retained the fixture nest's rarity override; corrected fixture to actually be unique, then passed. No product immunity defect was found. Do not present fixture corrections as gameplay fixes.
- Client typecheck and19 pet/quickslot tests PASS (`advanced-passives-types.log`, `advanced-passives-client.log`); targeted Go action/companion and vet pass in `advanced-passives-go.log` / `advanced-passives-vet.log`. Final rerun includes all new assertions.
- Live browser was reloaded with the corrected text. No captured console warnings/errors. Owner stayed full3831/1450, no death, weapon/ammo untouched, only short walks around the Grassland tree. Current pets remain40; TierIII effects are **server fixture acceptance, not in-game visual acceptance**. Weak monsters previously died on one strike, so exact status durations/AoE magnitudes remain unmeasured live. Temporary Quarterview option did not materially change the view; restored original Free Camera before handoff.

## Species stats and other-pet testing update (2026-10-15, latest)

User reported identical base stats across species and no visible equipment/passive improvements. Root causes: Basic Info read immutable browser asset stats only; expansion had no species profiles; the server scaled actor attack but NOT native COS skill fixed min/max damage (the main damage source).

- Canonical workbook now has **Combat roles** inputs. Relative percentages HP / physical attack / magical attack / physical defense / magical defense: Wolf100/130/25/100/85; Bear220/65/20/180/145; Penguin70/35/160/70/120 (magic primary); Crow90/55/95/90/110. Roles are balance choices editable in workbook, not native facts.
- Startup calls enterworld.TextdataItems.ApplyAttackPetProfiles ONLY with SRO_ATTACK_PET_EXPANSION=on, before authority admission. HP and defense references feed summon, growth, healing and combat consistently. Existing current HP is preserved and clamped on summon/restore if above the new maximum; no free full heal from the profile change. Schema stays25.
- companion.AttackScales multiplies role baseline by equipment/passive bonuses. Actual skill.Attack.Min/Max now scales too. Penguin attacks route through native magical lane, so Cold Mastery and magic affixes affect real damage. Physical-affix bonus now stays physical-only; collar implicit remains both types.
- Optional version1 combat-profile tail on0x3FB1: version u8=1, maxHP u32, magicPercent u16, magicDefensePercent u16, magicPrimary u8. Existing attackPercent/defensePercent now include species factors. New decoder accepts old no-tail state, validates the extension strictly, rejects trailing/unknown/malformed tails. Reload browser after deployment; old runtime cannot read this new optional tail.
- foundation/ui/pet-training.ts petReference and petAbilities project HP/defenses/attack into Basic Info and status gauges. They use current server training state, so learning/slotting/equipping refreshes the numbers. Native-off display remains unchanged. Basic Info still does not invent attack-speed/crit fields absent from the native layout.
- Workbook command descriptions now say commanded strike / immediate Mend; Roar no longer promises nonexistent unique-taunt/damage-reduction perks.
- Backup: `E:/CodeProjects/SRO/outputs/pet-design-codex/pre-role-balance.db`, SQLite integritycheck OK, actual worktree authority. Preserve it.
- Tests: full Go tests/vet/lint passed for initial role patch; latest targeted action/companion/enterworld/wire/gate rerun covers physical-affix correction. Client typecheck, pet/quickslot/COS tests, test-type debt gate and execution contract pass. New advanced tests exercise real manual commands: Howl II fear, Bite bleed, Nova frostbite, Deep Freeze freeze, Mark Prey decay, cooldown repeat rejection, and immediate no-target Crow Mend. Profile test proves gear/Cold Mastery increase actual magic skill damage and native-off unchanged. Test fixture Mend initially failed due missing sword reference after fixture source replacement; fixed fixture, not a fabricated game bug.
- Sources added: companion/profile.go, enterworld/petprofiles.go, action/petprofile_test.go and enterworld/petprofiles_test.go. Existing source files updated for startup, scaling, wire, HP clamp and UI. Generator remains only writer of embedded/generated design.
- Latest source deployed to GameWorld v5 (1/1 healthy verified); Agent unchanged0. Logs `roles-*` and `advanced-manual-tests.log` in scratch directory. Live acceptance results are appended below; do not treat server tests as visual/game acceptance.
- At start of this run the user had independently tested pets: Wolf I10/II1 Howl, Bite I3; Penguin Deep Freeze I10/II1 with harness/charm degree5; Crow Mend I10. Preserve these updates and the user's changed quickslots. Character at Grassland X6423 Y848, weak Mangyang nearby. No new character death during this run.

### Latest live stats evidence

- Wolf: equipped existing Steel Collar degree5 from bag slot38; attack now720-843. Learned Thick Fur I1, physical/magical defense rose199/270 to204/276 without reload. Screenshots wolf-role-baseline.png, wolf-collar-stats.png, wolf-passive-stats.png. Collar remains on Wolf; item not lost.
- Found and fixed another real UI bug during switching: attack pets reuse their band GID, so petTrainingAsked cached by GID retained Wolf gear/skills/stats on Penguin. Request cache now uses refObjId; both call sites changed. Explicit client reload loaded correction. Preserve penguin-stale-cache-before-fix.png as failure evidence.
- Penguin now correctly shows4800/4800 HP, physical attack0, magical1008-1180 (its existing gear retained). Learned Cold Mastery I1: magical attack immediately rose1053-1233. Screenshot penguin-mastery-stats.png. Baseline corrected in penguin-magic-baseline.png.
- Learned Frost Nova I1; main slot7 Nova I, slot8 Deep Freeze II. User Wolf bindings slot5 Bite I and6 Howl II retained. No new death. Owner still3831/1450.
- Final targeted Go tests pass, client18 combined pet/COS tests pass, latest lint0issues; typecheck passed after cache fix.

### Resume verification and remaining limits

Final browser left open after full reload and same-Wolf unsummon/re-summon: LabBlader40, full3831/1450, Grassland X6417 Y604; LabWolf40 Defensive, HP6851/6858, physical942–1103, defenses204/276. Gear/passive bonuses and quickslots persisted. Screenshot `wolf-resummon-profile-persisted.png`. Main4=MendI,5=BiteI,6=HowlII,7=NovaI,8=FreezeII; other character slots preserved. Last source-only change clears the training request cache during no-pet frames; loaded by full reload and re-summon verified.

- Actual weak-Mangyang live casts: Penguin Frost Nova I via key7 killed nearby monsters and started its row/hotbar timer; Deep Freeze II via key8 also killed the selected weak target and put BOTH learned Freeze books on the same cooldown. Screenshots `penguin-nova-command.png`, `penguin-freeze-II-cooldown.png`. These monsters died too quickly to measure full freeze duration or damage scaling visually; server status/scaling tests cover those assertions separately.
- Crow Mend I cast immediately without an enemy through key4. Timer appears on the Crow row and slot4 only; Wolf/Penguin shortcuts remain dim and inherit no timer. Screenshot `crow-hotbar-cooldown-fixed.png`. Owner was full HP, so live healing magnitude is NOT accepted. Earlier Mend II shared-row timer evidence is in `crow-mend-shared-cooldown.png` (before the other-pet hotbar correction).
- Crow's attack-based Mark Prey recharge decreased12→11→10 on two successful weak-monster attacks; counter did not masquerade as seconds. Completion/advanced debuff duration not yet measured live. Counter cooldowns appear numerically in the tree row; elapsed-time sweep is intentionally reserved for timers.
- Bear Basic Info now shows6321/15087 HP, physical327–383, magical0, physical defense358 and magical defense461. Existing wounds were preserved; no free heal. Screenshot `bear-tank-role-stats.png`. After latest physical-blue fix and full reload Wolf physical is942–1103 with collar/blues (earlier720–843 was before that final correction); compare Penguin magical1053–1233 after Cold Mastery, Crow physical277–324 (gear differs; these are live examples, not controlled equal-equipment benchmarks).
- Fixed wrong-species hotbar timer projection: use the same learned/current-pet command validity as activation; unavailable species are dimmed and get no timer. Quickslot command also requires a living summoned COS. Cached training requests use reference identity rather than shared band GID; clear that cache when no attack pet exists so re-summoning the same species requests fresh state too.
- Corrected current effect text for inherited higher-book proficiency: Mend +50% healing, Mark +20 defense reduction, Howl radius/duration, Bite bleed, Nova radius and Last Stand threshold. Unimplemented workbook proficiency promises remain labelled **Planned, not active**. Do not claim these promised party-heal or party-speed perks work.
- During testing Crow's ranks changed from MendI10/II1 + MarkI1 to Mend0 + MarkI10/II1 with bonusPoints10, and owner weapon/ammo moved to bag outside our recorded actions. Asked whether another controller was active; no answer recorded. Audited server CompanionByGID: it rejects dormant and duplicate live identities, so no evidence that band-GID reuse mutated the wrong server pet. Do not silently reset either pet or character data. After combat, learned MendI2 (two ranks), spending2 points; Crow now11 free, Mark ranks retained. Slot4 now binds learned Mend I (not unlearned II).
- Latest validation: `advanced-client-tests.log`31 combined tests pass; after final one-line re-summon cache invalidation, `resume-types.log` typecheck and `resume-client-tests.log`19 pet/quickslot tests pass. Latest physical-only blue assertion is in `physical-blue-final-test.log` (action/companion pass). Initial broad Go suite/vet/lint and other targeted gates remain recorded above; no full release-gate claim.
- Remaining explicit live acceptance: exact healing/damage/defense magnitudes, nonlethal status duration, Mark counter completion, TierIII at pet90, party/unique rules, all advanced passives and planned proficiency perks. Server integration tests are not a substitute for these game tests. No new character death in this run; owner remains level40.

## User requirements

- Owner-triggered active pet skills, draggable into normal numbered quickslots.
- Two active and three passive families per species. Each row has three sequential books of ONE family, rather than three unrelated alternatives.
- Confirmed unlock levels: **10 / 40 / 90**, preceding book must be maxed before learning the next. Ten ranks per book; Tier I finishes at40, Tier II at90. Tier III finishes at120 as an editable balance default, not a confirmed user requirement.
- Hover descriptions even on unlearned/disabled skills. Unmet requirements red. Tree/cooldowns styled like character skills.
- Test on weak monsters, preserve characters/items/points, keep tokens low, document exact acceptance and gaps.

## Current deployment and data

- Current source deployed: **Agent v0 / GameWorld v5**, both 1/1 healthy verified. Latest deployment log: `physical-blue-deploy.log`. Earlier v2 sequential-tree deployment is retained in `tiers-deploy-corrected.log`; version numbers restarted after earlier graceful stops, not a source rollback.
- Actual authority: `E:/CodeProjects/opensro-lab/apps/server/.state/shards/global-official/authority/state.db`. Do not confuse with the EMPTY hub authority.
- New optional `training.treeVersion` requires **schema25**. Added schema24 offline upgrade, v25 strict field fixtures and release compatibility. Upgrade validates and rewrites no character record.
- First upgraded the empty hub DB by mistake; startup correctly refused the real schema24 worktree DB. Stopped the job, backed up and upgraded the actual worktree DB, then successfully redeployed. No character was lost.
- Correct pre-upgrade SQLite backup: `E:/CodeProjects/SRO/outputs/pet-design-codex/pre-sequential-trees/worktree-authority-backup.db` (integritycheck OK). Additional upgrader backup beside live DB: `state.before-upgrade-3660758524.db`. Hub-only backups: `pre-sequential-trees/authority-backup.db` and hub `state.before-upgrade-3149969243.db` (empty authority; NOT the character backup).
- Historical game state: http://127.0.0.1:5180/, account LabPlayer (credentials kept outside Git), character LabBlader level40, maxHP3831, MP1450. Near Jangan south gate Grassland X6406 Y738, LabBear40 and Sylph summoned. Bear Defensive. Main slots1-3 and9-0 unchanged; new Roar I bound to main slot4. See current checkpoint above for the separate level90 tester.
- Before this run: bear Iron Hide1, Retribution1, Last Stand8, Crushing Paw2, 12 free points. Migrated row investment to Iron Hide I2, Last Stand I8, Crushing Paw I2; gear/cooldowns preserved. After acceptance testing: Roar I10, Roar II1, Iron Hide I2, Last Stand I8, Crushing Paw I2; **1 free point** remains. Slot4 upgraded to Roar II, slot5 Iron Hide I.

## Canonical design and generation

`docs/pet-expansion/pet-design.xlsx` is the source of truth. New **Skill families** sheet contains20 mappings. Original Skills sheet retains60 effect templates. Export using `scripts/tools/pet_design_export.py`; generated consumers are server companion/petdesign.json, scripts/build/shared/pet-design.json and client foundation/ui/pet-design-data.ts. Never edit generated consumers directly.

Families by row0-4:

| Pet | Active I | Active II | Passive I | Passive II | Passive III |
| --- | --- | --- | --- | --- | --- |
| Wolf | Terrifying Howl | Rending Bite | Execute | Scent of Blood | Thick Fur |
| Bear | Challenging Roar | Iron Hide | Thick Hide | Last Stand | Crushing Paw |
| Penguin | Frost Nova | Deep Freeze | Cold Mastery | Static Feathers | Frost Armor |
| Crow | Mend | Mark Prey | Carrion Feast | Swift Wings | Murder of Crows |

These family selections are editable design choices. Old alternatives (including Retribution) remain template/history entries, not additional current row choices. Three books share a row cooldown. Existing effect dispatch uses SkillDef.EffectName(), retaining family behavior and prior proficiency perks at higher tiers. Higher learned passive books auto-slot; only one book per passive row contributes.

Workbook backup `pet-design-before-tiers.xlsx` and readable preview `skill-families-preview.png` are under the scratch directory. Added sheet was authored with artifact-tool; original workbook sheets retained. Tier rank requirements interpolate from unlock to tierEnd using ceiling, so rank10 lands exactly on40/90/120.

## Implementation

- Server companion/tiers.go: SkillsForPet selects treeSkills after TreeVersion2. UpgradeTree combines spent ranks per old row, allocates admissible sequential ranks, refunds excess via existing unspent-point calculation, preserves gear and row cooldowns. Do NOT add BonusPoints for unallocated ranks: that double-refunds. Conversion is idempotent.
- Client requests state operation0 arg2 once per active pet even if pet window is closed. Server transaction persists upgrade, refreshes snapshot and returns state. Legacy requests remain readable until per-pet conversion.
- Learned active icons drag into normal quickslots. Existing persisted action kind0x4a, payload `0xf00000 + skillID` (within24bits, outside native action IDs). Current pet and current target are resolved on activation; unsummoned/unlearned pet yields no command. Existing native quickslot types retain their path.
- New F0 training activation is11 bytes: legacy7 bytes plus target GID u32LE. Only op2 admits11 bytes. Server validates owner/pet/alive/learned/cooldown/target permissions. Legacy7-byte queue commands remain compatible.
- action/petmanual.go applies self buffs/heals immediately, with no basic attack needed. Targeted abilities explicitly order/approach/strike and advance nextAttackMs; they still use native attack handling and animation. Select an enemy first. No arm-next-click cursor or new cast animation/VFX was added.
- Bear Challenging Roar: immediate no-target, NO damage. Tier I3 normal monsters, base8m; Tier II3 incl party monsters, base12m; Tier III6 incl party monsters, base16m; +0.4m per local effective rank. Uniques excluded. Shared hostility targets pet; no eligible monsters refuses without cooldown. Unit test asserts monster HP unchanged and pet GID in opponents.
- Client help shows book unlock/end, predecessor-max requirement and current/next effects. Red predecessor/level/point requirements. Existing character cooldown sweep/digits reused in tree and hotbar.
- Potential limit: dragging an active during its disabled cooldown remains blocked by generic UI guards; bind it while ready. Offensive commands require selected target. All-species animations and exact balance are not fully accepted yet.

## Source files

Client: foundation/gameplay/quickslots.ts, contracts/gameplay.ts, foundation/ui/pet-training.ts and generated pet-design-data.ts; runtime/ui/ui.ts; runtime/platform/ui/ui.ts hover filtering; simulation/worker/session/world/gameplay/gameplay.ts command encoding. execution-contract.json and ownership.json register existing pet state ownership/callbacks.

Server: domain/character.go optional TreeVersion; companion/{design,training,tiers,gear}.go; action/{coscommand,pettraining,petmanual,pettrained,monsterstrike}.go; schema.go, authority_upgrade.go, new v25 testdata, release compatibility.json. Tests in companion/tiers_test.go, action/pettraining_test.go and client tests/runtime/pet-training.test.mjs.

Earlier bug fixes retained: publish event cooldown counters; execute respects block; proc internal cooldown; Last Stand actual threshold40 at proficiencyII; Retribution stores postmitigation damage; Cold Mastery modifies magical attack; inventory remainder checks on pet gear moves; redraw pet timer state; disabled-hover and red requirements. Generated workbook descriptions corrected too.

## Actual verification

- Go all package tests PASS after schema and CRLF correction. Go vet PASS, lint0issues. Focused action/companion tests cover immediate buff without attack, roar no-damage threat, exact tier unlock/max/endpoints, predecessor requirements, migration points/gear/cooldown conservation and idempotence.
- Client typecheck PASS. Five pet tests and existing quickslot tests PASS, including learned active binding, current target resolution and no-pet rejection. Test-type debt gate PASS (existing2778 errors unchanged), execution contract PASS.
- Broad client gates still carry previous unrelated/tooling debt: generated design file size, shared object ownership gate, unrelated tooltips.test.mjs formatting/asset paths. Do not claim a clean complete release gate.
- Before redesign, actual weak-Mangyang combat verified Iron Hide legacy queued activation, both same-row icons matching countdown/sweeps, alternate activation rejected during cooldown, both reenabled on expiry. Retribution initialized30hits instead of false seconds. Screenshots `bear-shared-cooldown-mangyang.png`, `bear-retribution-hit-recharge.png`.
- Disabled/unlearned tooltip and red Last Stand requirement pet42 versus40 verified before redesign: `pet-requirement-red.png`. Explicit reload needed; Vite old runtime closure can survive HMR.
- New live tree shows five family I/II/III rows. Learned Roar I1, dragged to empty main slot4. Pressed4 with target NONE; immediate activation, tree/hotbar matching timer sweeps, weak Mangyang approached bear, owner HP stayed full. Screenshot `roar-number-key-cooldown.png`.
- Retained legacy hit recharge visibly decreased30,28,23,4 from weak Mangyang hits, proving counter publications reach UI. Further learning attempted during combat was correctly refused, free points remained11. Counter then reached0 and Iron Hide I became enabled. Bound it to main slot5, pressed5 with target NONE: immediate 29-second row cooldown appeared in both tree and hotbar, without any pet basic attack. Screenshot `iron-hide-manual-five.png`. This verifies counter completion and owner-triggered self-buff admission; exact damage-reduction magnitude still needs measurement.
- Earlier dangerous pack test lost87746XP; no new death in these weak-monster follow-ups. Earlier travel used Hotan-Donwhang-Jangan gates (two5000-gold fares) and oneReturnScroll.

## Next acceptance steps

1. DONE: weak-monster hit recharge reached0; Iron Hide I bound to5 and triggered without target/basic attack. Timer appeared immediately. Main slots4/5 now contain Roar I / Iron Hide I.
2. DONE: cleared weak Mangyang with normal owner attack, no death. Maxed Roar I10 at pet40, II learn control appeared, learned II1. II next rank needs46, displayed red at current40. Bound II to slot4. Screenshot `roar-tier-two-learned.png`. TierIII remains unavailable; exact90 gate/prerequisites unit tested.
3. DONE: full browser reload resumed LabBlader. Slot4 Roar II and slot5 Iron Hide I remained; pet tree retained I10/II1, other ranks and1 free point. Screenshot `pet-tree-persisted.png`. No repeat conversion observed.
4. Test selected-target offensive command and no-pet hotbar behavior in actual game, then other species. Test party/unique eligibility with appropriate safe fixtures; unit checks are not live acceptance.
5. Full effect magnitude, advanced proficiency, all-species animations/equipment, hit recharge completion and stored-damage behavior need explicit evidence before claiming all skills finished.

## Commands and evidence

Prepend `E:/CodeProjects/SRO/AssetImports/tools/go/bin` to PATH. Deploy from lab server module with `SRO_ATTACK_PET_EXPANSION=on`, `SRO_SERVER_GAME_DATA_ROOT=E:/CodeProjects/opensro/apps/server/.generated/game-data/1.150/server`:

```
E:/CodeProjects/SRO/AssetImports/tools/sro-nomad-wolf.exe deploy -build -module-root E:/CodeProjects/opensro-lab/apps/server -state-dir E:/CodeProjects/opensro/apps/server/.state/cluster
```

Use same options for status/stop (without-build). Upgrade only offline with `go run ./cmd/tools/sro-authority-upgrade -authority-dir <ACTUAL worktree authority> -commit`; it acquires exclusive authority lock and saves backup. Job Env's SRO_AUTHORITY_STATE_DIR is authoritative; --state-dir controls cluster state, NOT the shard authority location.

All scratch/logs/screenshots: `E:/CodeProjects/SRO/outputs/pet-design-codex/`. Relevant logs tiers-go-all-final.log, tiers-go-vet-final.log, tiers-lint-final.log, tier-schema-test.log, tiers-quickslots.log, tier-tests.log, manual-pet-tests.log, tiers-deploy-corrected.log, tiers-upgrade-worktree.log. First tiers-deploy.log documents the corrected schema-path failure.

Browser: existing IAB tab6 at localhost. Keep it open. Use cua browser controls. DOM mirror buttons have `data-ui-id`, e.g pet-skill-up:16 for learn versus pet-skill:16 for activate. Role labels duplicate across these; use exact IDs from observed DOM. Do not inject game state. Right-click inventory consumables to use. Map clicks pan, not move. User agreed to leave session idle. All files must be UTF8 LF (explicit encoding with Python on Windows).


### Pet tooltip color and cooldown cap (2026-10-16)

Pet equipment base combat stats now render white; blue modifiers retain their blue styling. Total cooldown reduction from all equipped items and passives is capped at 80% on the server, and the client accepts/displays up to 80%. Individual DB roll maxima (including 50% cooldown rolls) are unchanged. Regression coverage verifies three 50% items produce 80% effective reduction and 20% remaining cooldown, unequipping restores the lower total, all 27 gear tooltips use white base stats, and the client rejects totals above 80%.

Deployed and healthy: Agent v1 / GameWorld v6 (pet-cooldown80-deploy.log). Eight targeted client tests, companion/action/wire Go tests and client typecheck pass. Live Dragonbone Collar tooltip verified white (pet-white-stats.png). No synthetic cooldown items granted; stacked 150-to-80 behavior tested in regression. LabPetTest died from field damage during UI verification; gear was not changed.

### Live 80% cooldown cap acceptance (2026-10-16)

- Used only the separate LabPetTest90 / LabBear90. Moved to the previously verified low-level Grassland spawn region24488 X689 Y3.900245 Z111 (map X6404 Y587), with weak Small-eyed Ghosts. Owner remained13226/13226 throughout casts; bear took only12HP from the taunted monsters. No death or LabBlader changes.
- Reversible stopped-store fixture: scratch `cap80-fixture.go`, runnable ignored source `apps/server/.state/tools/captest/main.go`. Uses store.Open/UpdateCharacter and normal authority lock, owner/account/pet/level guards. Original three worn pieces/options saved in `cap80-original-gear.json`; never restore a whole character or DB over subsequent progress.
- Temporarily equipped D9 Dragonscale Harness and D9 Primal Charm, each with encoded affix77 value50. These are valid slots/degrees; pet_affix_rules permits max50. Existing collar retained. No drop/blue probabilities changed. This is a provisioned test fixture, not evidence of a randomly dropped50% roll.
- Live inventory displayed Skill cooldown reduction:80% from the100% sum (`cap80-stacked-inventory.png`). With no +skill charm, Iron HideIII rank1 base30s produced exactly6000ms: input1792147751692..1698, persisted ReadyAtMs1792147757698. Tree all3books and hotbar countdowns showed the same shortened timer (`cap80-six-second-cast.png`). After expiry all3books reenabled; immediate double activation correctly returned “Iron Hide III is not ready: its row is on cooldown.”
- Against weak Small-eyed Ghosts, Challenging RoarIII base18s produced3599..3617ms relative to the input interval (expected3600ms). Pet received their attacks; owner remained fullHP. Screenshot `cap80-weak-monster-roar.png`. Original baseline0% Iron Hide showed28s because the original charm grants+2skills; do not mistake that proficiency change for a cooldown bug.
- Normal gear change during combat correctly refused with “Recall the pet and leave combat before changing its skills or gear.” Single-item follow-up therefore uses the stopped-store fixture; restoration and final state pending below.
- Raw evidence: `E:/CodeProjects/SRO/outputs/pet-design-codex/cap80-live.jsonl`, `cap80-cast-timing.json`, `cap80-repeat-timing.json`, `cap80-roar-timing.json`. Live assertions confirm ReadyAtMs is input+6000ms, rather than0ms or the old12s cap. No runtime code defect found so far.
- Follow-up PASS: with only the D9 harness50% and empty charm (same effective skill rank1), live inventory showed50%; Iron HideIII produced15000..15008ms from input to persisted expiry (`cap80-single-timing.json`, `cap80-fifteen-second-cast.png`). Thus the50% and80% behavior is measured live, not inferred from UI alone.
- Final restoration PASS: original Rawhide Collar30101 / Rope Harness30201 / Primal Charm30309 and every original option exactly match `cap80-original-gear.json`. Fixture pieces were only temporary replacements of worn records; none were inserted into the bag. Final effective cooldown reduction0%. Repositioned to appointed safe Hotan town region23687 X1138 Y250 Z153. LabPetTest remains90/full13226HP; normal progression/pickups/quickslots preserved. Bear lost91HP in total during weak-monster testing, no owner damage/death. No runtime code changes were needed. Server resumed with the same built cap80 binary and normal rates/DB blue rules unchanged.
- Final GameWorld allocation running at Nomad job version14 after the reversible count0/count1 cycles; transport listening12:53:15, pet factor0.1 and normal20x drop passes preserved. Agent unchanged. All fixture/stage work is complete; continue future tests from Hotan, not the earlier Niya/death checkpoints.

### Attack Pet System website guide and operator manual (2026-10-16)

- Added `docs/pet-expansion/site/attack-pet-system.html` + scoped CSS. Standalone, no JS/dependencies; intended new website navigation entry: Attack Pet System. Matched the current live opensro.online/guide parchment panels, dark ground, gold/blue navigation and palace masthead. Existing public hero image is referenced, not downloaded/bundled. Public guide covers all20 current skill families, progression10/40/90, quickslots/shared cooldowns, the80%cap, three gear slots, degrees1–9, monster-only loot and troubleshooting.
- Added `docs/pet-expansion/ATTACK-PET-SYSTEM.md`, indexed in docs/README.md. Contains website integration instructions, correct live authority DB path, stopped-shard SQL/CLI examples for petGearDropFactor, pet_affix_rules limits/weights/power, exact roll formula, per-degree odds/caps/floors, general beta rate limits/category mix, generated-data workflow, restart/revert rules and source map. Distinguishes DB settings from workbook/source/deployment settings and100×maximum general drop passes from unaccepted1000×requests.
- The live site's complete Next.js frontend is not in this checkout; ops/site/index.html is the older minimal landing page. Guide is prepared for later integration, not published to production. Copy HTML/CSS into site public and add one nav link, or port just guide main into existing Next layout. No gameplay code, database settings or rates changed.
- Verified HTML anchors/uniqueIDs, all20 names against actual treeSkills, all9 level/blue-cap rows against generated data,10details controls and zero scripts. Browser checked desktop and390px narrow layout (single-column cards323px, no horizontal overflow), FAQ expansion and section navigation. Hero loads. Preview at http://127.0.0.1:5182/attack-pet-system.html uses local-only Python static server, exec session98098; restart with Python http.server if needed. Screenshots under scratch: attack-pet-guide-desktop.png and attack-pet-guide-mobile.png. Preview tab retained as deliverable; game session not modified.

### Pet skill point cadence changed to every2levels (2026-10-16)

Owner requested one point per2petlevels. Changed workbook Rules!B9 (Points per pet levels)3→2 and regenerated server JSON/shared JSON/client TS through pet_design_export.py. Starting point remains; normal totals now level1=1,2=2,3=2,4=3,40=21,90=46. Existing spent ranks and operator BonusPoints are untouched; a level90 fixture with74bonus now has120total before spending (instead of105). Existing pets gain15available points at90 without a respec or DB mutation. HTML guide and operator formula updated. Added explicit progression boundary assertions; companion/action/wire Go tests and8client tests pass. Workbook edit authored with artifact-tool, then only its B9value merged into original package to avoid export style drift; all other ZIP parts verified byte-for-byte unchanged. Backup/evidence in scratch pet-design-before-points2.xlsx and points2-rules.png. Deployment log pet-points2-deploy.log; final readiness pending below.
Final deployment succeeded: Agent v1 and GameWorld v15 each1/1healthy; pet-points2-deploy.log exit0. Guides reflect every2levels. No new combat test needed for this cadence-only change.

### Merge latest main into pet feature branch (2026-10-16)

Merged upstream main a22af709b722102bcd6c12ba24bc59eec29c3a30 into feat/Attack-pet-expansion after pet work commit a08f02b8. Resolved UI options/hotbar/pet inventory conflicts preserving both upstream trade/gacha/UI behavior and pet training. Game options remain within5rows: Grey disabled tabs moved to Other (Windows and diagnostics), Attack-pet training stays in Game. Source checks remain subject to existing generated-data size/encoding and ownership/asset gates.

Database history collided: lab schemas24/25 carried pet training while main24/25/26 carried mostWanted/economy ledger/guild founding. New combined schema27/layout10 preserves main historical goldens and adds combinedv27goldens; offline migration admits both histories. Release manifest uses upstream protocol10/asset schema4 with store27. Regression exercises pet ranks/treeVersion/blue options across sources23/24/25/26, preserving raw character JSON and idempotence. Actual live lab SQLite was backed up with SQLite backup API into scratch merge-main-upgrade-probe; only that disposable copy was upgraded. All20existing tables and both character rows compare unchanged, including pet config; new ledger/layout and schema stamps verified. Live authority was NOT upgraded.

Preserved upstream applyCOSHitInDoor refactor: monster-only pet damage reduction and hit counters stay in the monster transaction, never applied to player-versus-COS damage. Fixed silent questinventory automatic merge by sharing grant/receipt planning between pet inventory and upstream gacha, retaining suppressed gacha delete receipts.

Validation: full Go server go test ./... PASS (merge-main-server-tests.log); client typecheck PASS;29targeted pet/experimental-option tests PASS. Full source gate blocked by existing generated pet-design-data.ts size limit(5725lines) and encoding debt; full client check pending final result below. No gameplay deployment, production DB migration or push performed. Before running the merged build on lab data, stop its shard and run the preserving authority upgrade to27, then deploy matching protocol10 client/server and updated assets. Do not mix the currently running older binary with the new client protocol.
Final merge validation: all Go packages PASS; production client typecheck PASS; test-type gate PASS with no new errors;37targeted pet/options/window-fit tests PASS. Fixed pet-tooltip fixture typing and shortened the pet-option description to fit upstream's window. Full client run is not green: missing retail extraction at E:/CodeProjects/extracted, outdated published asset assertions (including Magic Pang presentation), and shared-state ownership findings remain. Source gate also reports generated pet-design-data.ts size and encoding debt. Logs: merge-main-client-check.log, merge-main-source-check.log, merge-main-targeted-final.log. These broader results are documented, not treated as full gameplay acceptance. Merge only: no push, live database migration or deployment.

### Live schema27 migration and deployment (2026-10-16)

Owner authorized live backup/migration/deployment and pet smoke tests. Stopped the GameWorld, made consistent/integrity-checked SQLite backup `E:/CodeProjects/SRO/outputs/pet-design-codex/schema27-backup-20261016-180739/state.db` (locator schema27-latest-backup.txt), then committed the preserving upgrade on the real lab authority. Upgrader also retained live `state.before-upgrade-2540921890.db`. Schema25/layout9→27/layout10; all20existing tables compared byte-value unchanged, both LabBlader/LabPetTest preserved, pet factor0.1 untouched.

Built current merged-source Nomad CLI into scratch sro-nomad-merged.exe, deployed matched updated Agent and GameWorld (initially Agentv2/GameWorldv17, each1/1healthy). Client reload reaches world at13226HP; server logs confirm normal20drop passes/cap16/mix and petfactor0.1. Migration/deploy logs schema27-live-migration.log and schema27-live-deploy.log. Bear tierIII IronHide works and shares cooldown across books. Worn collar right-click removal→bag then drag-re-equip works with original blue options; all four pets' saved gear/ranks/passives/BonusPoints/treeVersion verified identical to backup. Wolf summons and retained III tree displays after species switch. No runtime bug reproduced so far. Brief stopped-store field travel uses ignored captest modes field/town, added without modifying training/gear; weak Grassland location24488 X689 Y3.900245 Z111. Further smoke results/final state below.

Final smoke results: Bear, Wolf, Penguin and Crow all summon and display their persisted tierIII trees. Crow Mend casts and shares cooldown across its three books; healing amount was not measured at full HP. Bear Challenging RoarIII and Iron HideIII both cast against weak Small-eyed Ghosts with shared book cooldowns; no crash, owner remained13226/13226HP. Targetless Wolf Howl correctly refuses without an enemy; its offensive effect was not measured. Returned using a normal Return Scroll to Hotan town (minimap X113/Y15), with Bear summoned. Agent and GameWorld remain running (GameWorld jobv19 after safe travel restart). No drop-rate or gear-roll changes.

PR #1092 review: fork branch published to kresko5007/opensro and targets opensro-dev/opensro main. Updated the empty PR template with scope, opt-in flags, migration requirements, player-note trailers and verified limits. Added the cohesive generated design-table size exemption allowed by root AGENTS.md, and registered petItemIcons/petLootCollar/portItemRows in the assets suite. All six pet asset tests and all14 portable source gates pass locally. GitHub's previous head passed server tests/race/static/lint and client-source. Latest CI must still complete; no merge or gameplay redeployment performed during PR fixes. Source checkout CRLF normalized mechanically for local gates; no content changes from normalization.

### Gemini Roar changes reviewed and run (2026-10-16)

Reviewed seven uncommitted client/server files: Bear Roar action-emote broadcast, Tier III25m radius/tooltip, attack1 motion, procedural aura/shockwave resources and visual tests. Fixed two blockers: the new Go test used a nonexistent MonsterState.Spawn API (replaced with existing SpawnGMMonsters), and finished visual sequences discarded their consumed emote revision, causing persistent emotes to restart the effect indefinitely. Keep consumed revisions until entity removal/replacement; regression now steps past five seconds and rejects replay/camera shake.

Production TypeScript PASS;35focused effects/presentation/residency tests PASS; full Go action package PASS. verify:quick remains blocked by the already documented foundation module-state ownership findings (viewer-camera, pet-design-data, pet-training). Logs gemini-client-typecheck.log, gemini-client-tests.log and gemini-client-quick.log under scratch. Deployed current source: Agentv3 and GameWorldv20 each1/1healthy (gemini-roar-deploy.log); no DB/rate edits. Reloaded client, entered LabPetTest with LabBear and full13226HP; RoarIII's new glow rendered on command without a crash. No eligible target in range, so this was a visual-path smoke test, not a new taunt/balance acceptance test. Screenshot gemini-client-running.png. These changes remain uncommitted; no PR push this run.

### Bear Roar weak-monster test and fixes (2026-10-16)

The earlier short visual smoke check missed a delayed failure: TierIII emitted amplitude200 with period20; the camera contract requires period25. Fixed effects.ts and passed emitted events through the actual camera handler in the regression. Found missing borrowed EFP dependencies and a blinding additive burst during live testing. Removed the borrowed layers and predicted per-monster taunt markers (the emote carries no authoritative victim list), retaining the owned aura/shockwave; lowered additive opacity and burst size. A visual ring is not proof that every monster inside was taunted. No taunt balance or cooldown formula changes this run.

Used the existing stopped-store field-only travel helper after an integrity-checked backup: scratch/bear-roar-before-travel-20261016-194944.db. This changed only LabPetTest's position; no level, skills, gear, rates or privileges changed. Active shard resumed on the same built binary (new Nomad job versions from scale0/1). In Grassland against Small-eyed Ghosts, RoarIII drew the charge, expanding ring and completed recovery without the delayed crash/resource error; monsters reached/attacked LabBear and owner HP stayed13226. Bear HP58994 at timed cast,58966 later; safely weak encounter.

Measured live cooldown expiry17013ms after keypress (17seconds plus input transit) for learnedIII1 with+2gear/effective3 and0%CDR. All three Roar books visibly shared the countdown and became available together; a later valid cast worked again. Evidence scratch/bear-roar-live-timing.json, bear-roar-fixed-650.png, bear-roar-fixed-1450.png, bear-roar-fixed-2750.png and bear-roar-shared-cooldown.png. Exact radius verified deterministically from the follower's actual pose:24m target taunted,26m target not taunted (fixture body radius0.6m). A second book cannot bypass/restart the row cooldown, and the row becomes ready at its exact expiry. Do not label these boundary assertions a measured live25m survey.

43focused camera/effects/presentation client tests PASS; production TypeScript PASS; focused Go Roar test PASS. Existing ownership debt still limits verify:quick. Refreshed the effect asset family through its publisher (465resources,0packs rebuilt); no manual pack/index edits. Animation still borrows the existing attack1 clip, not a bespoke authored roar clip. Changes remain uncommitted; return-scroll travel to town queued after the combat test. Full party/unique/target-cap gameplay regressions and balance remain pending.

Final state: normal Return Scroll completed to Hotan Kingdom X113/Y15 with LabBear still summoned and LabPetTest13226/13226HP. Full Go action package passes after the new boundary/cooldown assertions. Client remains open and stable beyond multiple completed Roars. No commit or push requested/performed.

### Revised Roar rules approved by owner (2026-10-16)

Owner clarified TierIII starts30m at effective skill1 and gains1m per level; TierI starts10m with the same progression. TierII's existing12m+0.4m/level remains unchanged. Central Go RoarRadiusMeters and client petRoarRadius feed the taunt query, tooltip and owned pet's visual radius, including+skills gear. Peer emotes contain no skill rank, so remote visuals currently use the tier's base radius.

Casts now spend/start their shared cooldown even with no targets. The existing pet tick holds the follower during a1000ms windup and only then applies threat to eligible monsters. Pending casts cancel on death, unsummon, blocked movement/displacement or town entry. Both owner and pet positions use the existing native town-region gate; a town refusal sends no emote and spends no cooldown. No background timer or delayed store write introduced. Presentation gameplay projection now carries petTraining so predicted/moving frames retain the effective visual radius.

47focused client tests and production TypeScript PASS; full Go action+companion packages PASS. Tests cover999ms no-taunt/1000ms release, TierIII level1 range29m in/32m out, shared cooldown, empty-field cast, town refusal, town-entry cancellation and level formulas. Local deployment Agentv3/GameWorldv23 healthy (roar-rules-deploy.log). Owner reports the updated result looks good and requested committing it plus a short presentation video. No balance beyond the requested radius/cast rules changed.

Fixed a merge regression in client ui.ts: Basic Info must select hiddenInfo before the attack-pet training setup mask, otherwise HP is replaced by Rental period and empty-stat placeholders. Live reload visually verified HP restored; added pet-info-layout.test.mjs using the actual UI fixture. Production client typecheck and test-type gate PASS;38targeted client tests PASS,0fail (schema27-client-regressions.log). Screenshot evidence: schema27-pet-info-fixed.png, schema27-bear-weak-combat.png and schema27-pets-running-town.png under scratch. Changes remain uncommitted for review. Full advanced passive/effect/balance acceptance and the pre-existing broader source/asset gate failures were not resolved or claimed passed.

### Dedicated Bear Roar animation (2026-10-16)

Added the port-only `pet-roar` clip at admission of the two retail bear models. `foundation/animation/bear-roar.ts` authors a 2.2-second neutral/rear-up/roar/recover motion from the stand pose, not attack1: pelvis pitches upright, thighs counter-rotate to plant the hind feet, forepaws rise, neck/head face forward and the lower jaw pulses. Original mesh, textures, skeleton and clips remain unchanged. Bear-only emotes16/17/18 select this clip; actor-motion admits it using the loaded duration. Existing server town/cooldown/one-second taunt rules are unchanged. This is browser-client animation data, not a native BAN export; no new sound was authored.

Live localhost test: LabPetTest/LabBear level90 outside Eastern Hotan, full owner HP throughout. Cast from quickslot3, observed rear-up/open jaw and shockwave, then return to all fours without a crash. Evidence outside Git: `E:/CodeProjects/SRO/outputs/pet-design-codex/bear-dedicated-roar/` (before.png, timestamped frames.json, frame-01.png buildup, frame-03.png upright roar, frame-07.png recovered). No video created. Both cub/adult rigs tested through the production pose evaluator for finite transforms, planted hind feet and neutral recovery; presentation test covers bear-only routing and expiry. 116 focused bear/effects/character-presentation tests PASS; production TypeScript and capability checks PASS. Broader gates still fail existing ownership state in viewer-camera/pet-design-data/pet-training and execution `resources.ts: synth`; the new code adds no unresolved execution edge. No commit/push for this animation yet. Remaining: user visual review and multi-client/long combat regression; no balance changes.

### Iron Hide shields: resumed after Gemini (2026-10-18)

Roar animation was subsequently committed/pushed as90a91c73. Current uncommitted work replaces Iron Hide's old damage reduction with5s absorption. TierI shields bear+owner, II includes living party members within20m of owner, III detonates each player's remaining absorption at expiry for50% fixed damage within8m against world monsters. The bear's shield does not detonate. Existing rank values and shared row cooldowns remain; absorption is capped at100% maxHP. No stacking: a stronger existing shield keeps its amount/expiry; equal or stronger new shield replaces it. No DB migration, character/gear/points/rate edits or PK2 changes.

Gemini supplied cyan shell/expiry effects, HP-bar segments on owner/pet/party/target panels, shield-specific help, Iron Hide cast emote and generated tier descriptions. Reviewed these changes; retained animation interruption on movement/hits/casts to avoid a pet moonwalking in an uninterruptible rear-up. The shield cast can use pet-roar, but Roar's offensive shockwave still only belongs to actions16-18. Generator overrides the Iron Hide family like the existing Roar override; the workbook's legacy template text is not the current tier description. Never hand-edit generated TS/JSON.

Additional fixes: refresh shield rows after acquiring the division lock, preventing stale amounts/expiry after a concurrent hit or recast; require a live bound caster session; cancel after death/logout/unsummon/town/job/instance entry or feature disable without an explosion; admit party recipients only in permitted ordinary-world contexts; credit burst damage and monster hostility through existing settlement. Absorption runs inside actual player/COS hit doors and periodic-damage owners. It precedes Snow Shield mana redirection, so a fully warded hit drains neither HP nor MP. Removed unused old Iron Hide reduction fields.

Verification: full Go action+companion packages PASS. New real-monster-hit tests cover both player and pet absorption/overflow; expiry test leaves20 shield and confirms exactly10 monster damage; tier/party distance, exact5s expiry, cancellation, division isolation and mana-shield ordering tests PASS.44 focused shield-state/pet-training/effects/bear-roar client tests PASS; production TS, test-type ratchet, capability check, formatting and diff checks PASS. Fixed prior bear-roar fixture type omissions without changing runtime behavior. Existing verify:quick ownership failures remain in viewer-camera/pet-design-data/pet-training; execution map still reports the pre-existing unresolved `resources.ts: synth` edge.

Local environment: Nomad dev agent uses opensro-lab/apps/server/.state/nomad/dev-agent; deploy CLI must use `-module-root E:/CodeProjects/opensro-lab/apps/server -state-dir E:/CodeProjects/opensro/apps/server/.state/cluster` (accounts/catalog live in the hub). Authority DB remains opensro-lab/apps/server/.state/shards/global-official/authority/state.db. Final source deployment completed: Agentv0/GameWorldv2 each1/1healthy. Featureon, growthon, drop20/cap16/mix unchanged. Vite already listens on127.0.0.1:5180 from this worktree; attempted duplicate launch exited because the port was occupied.

Live browser testing resumed after the owner reloaded the tab. LabPetTest/LabBear90 cast Iron HideIII from slot4: owner and pet white HP segments, Bear rear-up, cyan barriers, five-second expiry and player-origin burst all rendered without a crash. Slots4/5 share the visible cooldown. Initial Gemini effects were blinding: reduced additive dome/ring opacity and point lights, then reloaded and visually verified characters remain readable. Added a camera-contract regression for the shield burst. Removed the extra shield number from the compact owner HP text because it overflowed the retail label; the white segment and detailed pet absorption value remain.

Live evidence (outside Git): E:/CodeProjects/SRO/outputs/pet-design-codex/shield-live/. Original timed frames.json/frame-03.png show the active shield; frame-17.png shows expiry around5.5s. shield-fixed.png shows the toned-down effect. Against nearby Small Bunwang/Bunwang (level44 visible on selected Small Bunwang), owner HP was13193 when casting; combat-00 through21 show incoming hit numbers with HP unchanged during the first second of shielding. Subsequent native HP returned to13226 and XP messages appeared. This short visual check is not a measured exact absorption/burst-damage test; those assertions passed through actual server hit paths in the engine tests. No giant/high-level monsters were used. Live two-client party protection and an exact in-game burst damage survey remain unverified. Final44focused client tests, production TS and test-type ratchet pass after the visual fixes. All shield work remains uncommitted/unpushed pending review.

Final visual follow-up: final-frames.json/final-00..17 capture another complete6.4s lifecycle on the toned-down effects, including expiry at~5.27s. Camera was occluded by the nearby bear/foliage, so shield-fixed.png remains the clearest effect evidence. Kept compact HP/maxHP text and added a black offset shadow while shielded for contrast over the white segment; production TS passes. Existing test-type ratchet passes (no new errors). Client remains open on LabPetTest with LabBear, full13226HP; no account/gear/rate edits, commit or push. Next: live two-player party shield/range test and exact burst damage observation, then owner review/commit.

### Owner ward anchoring / shield pose correction (2026-10-18)

Owner reported missing player barrier unless overlapping bear, intermittent expiry effect, and unwanted stand-up. Reproduced live with owner and bear separated on clear Eastern Hotan ground: HP shield segment existed, but only bear dome drew and player burst was absent. Changed only the procedural shield/burst actors to use their existing per-recipient presentation world pose directly, without root attachments inheriting character transforms. Both owner ward and player-origin burst now render at separate positions. Limited the dedicated pet-roar routing to actions16-18; Iron Hide19-21 leaves the bear on all fours. No server behavior, damage, balance or original Roar clip changed.

Live after full reload: two consecutive tierIII casts while standing beside bear each show separate domes and expiry ring, with bear staying down throughout; no overlap/movement needed, no crash, owner13226HP. Evidence outside Git in shield-live/: separate-before-3.png/13.png reproduce failure, anchor-fixed-3.png/12.png and anchor-repeat-2.png/12.png show corrected ward/burst. Browser stays open. Tests add shields19/20/21 never choosing rear-up, recipient pose separation/live local movement anchoring, and rearming/detonating a subsequent shield.33focused effects/bear tests PASS; production TS/test-type ratchet/diff check PASS. Party live testing and exact burst damage survey still pending. All shield changes remain uncommitted/unpushed. Reminder: only tierIII with absorption remaining bursts; tiersI/II, depletion and cancellation intentionally do not explode.

### Stationary shield metadata fix / bear burst (2026-10-18)

The previous anchor change was incomplete. Reproduced stationary owner with white HP shield segment but no dome/burst. Found the shared effect anchor merge spreading the entire gameplay.pose over the fresh entity: movement poses can retain old entity fields, including a stale shield. Thus a new shield/expiry could be overwritten until movement refreshed the pose. The regression now deliberately carries an expired shield in gameplay.pose: it failed before the fix (zero owner domes instead of2), and passes after copying ONLY region/x/y/z/heading from movement. Fresh entity shield revisions and expiry flags remain authoritative. Removed temporary anchor console diagnostics.

Owner additionally requested a pet explosion. TierIII now flags the bear's shield for natural-expiry detonation too; its8m/50%-remaining damage uses companionLiveSpawn, while player bursts retain each player's actual position. Depletion/cancellation still never detonate. Both owner and bear publish their own burst packets. Updated generated tier descriptions via the exporter and the user guide. Existing fixture leaves20 owner/40 bear absorption and confirms30 total monster damage plus both recipient burst GIDs. Client regression verifies both bursts, old-pose rejection, repeated-cast rearm and no shield rear-up.44focused client tests and full Go action+companion packages PASS; production TS and test-type ratchet PASS. Live verification/deployment results follow below.

Deployment complete: Agentv0 and GameWorldv3 each1/1healthy (shield-owner-pet-deploy.log); existing flags/rates unchanged. Reloaded browser. First completely stationary tierIII cast immediately drew both domes, with no walking, then both expiry rings at~5.24s; bear stayed on all fours. Evidence shield-live/stationary-fixed-times.json, stationary-fixed-3.png active, stationary-fixed-12.png dual burst. Early recast was correctly refused on row cooldown; no crash, owner13226HP. No DB/gear/skill-point edits. Changes remain uncommitted.

Final live regression PASS: cast while stationary; cast again and move during the ward; then wait for shared row cooldown and cast a third time without any more movement or reload. All three show owner+bear wards and both expiry rings. The third stationary-after-movement case specifically exercises the stale-pose bug. Evidence moved-fixed-3.png (moving ward), moved-fixed-10.png (separate bear/player bursts), stopped-repeat-3.png (stationary recast ward), stopped-repeat-13.png (expiry), stopped-repeat-times.json. No rear-up/crash;13226HP throughout. No live party test performed. Handoff/browser preserved; no commit/push.

### Light-gray shield gauges / pet audio (2026-10-18)

Owner approved shield feature commit2a579bfe, pushed to fork/feat/Attack-pet-expansion; the following changes are new/uncommitted. Replaced the flat blue-white shield rect on all6HP display paths with shared shieldGaugeFill: neutral light-gray horizontal strips with a subtle raised vertical highlight/darker edges, retaining bar dimensions, clipping and actual health math. No world shield-dome color change requested/made.

Added positional retail cues through the existing effect/audio owner: COS bear2 shout1 at the Roar's1s release (gain0.8), warrior physical-fence protection cue at Iron Hide activation (gain0.65), one sound per accepted cast. Expired/stale snapshots and partial absorption never replay the ward; late Roar releases skip stale audio. Bear sound preparation includes both paths before first use. Assets already come from the normal retail sound publisher; no PK2 edits, extra binary assets, dependencies or standalone audio subsystem. Paths are immutable scalar constants in sound-selectors.ts. Existing sound sliders/spatial audio still apply.

42focused shield/effects/audio-preparation tests PASS; production TS, capability check and test-type ratchet PASS. verify:quick still stops on the same5existing ownership errors (viewer-camera, pet-design-data, pet-training); new code adds none. Diff/format checks pass. Live client reloaded, Iron HideIII cast via key2 and RoarIII via pet Skills panel; no browser warnings/errors or crashes. Gray shield screenshot: E:/CodeProjects/SRO/outputs/pet-design-codex/shield-live/gray-hp-shield.png. Panels closed, quickslots unchanged, full13226HP. Audible volume/timbre is for owner listening review; no microphone/output recording or subjective listening claim. No server rebuild required. No commit/push for these latest changes.

### Pet mini-bar bounds / explosion audio (2026-10-18)

Owner reported the shield below the character was too wide/thick. Inspected native pmi_pet_hp.png:112x8canvas, alpha bounds109x5, coloured interior107x3. The shield was painting the full canvas, including transparent padding/frame. The pet-mini shield now clips to the107x3native colour interior; HP ratio and other panels are unchanged. Production UI fixture regression checks that exact clip, including real asset warmup.

Added a0.95s retail explosion cue (usk_warlock_blood_explosion_bomb.wav) at each authoritative tierIII burst position, gain0.35 to soften overlapping owner/bear/party detonations. Gated by the existing one-shot burst latch; partial absorption, cancellation, depletion and repeated render frames do not trigger it. Added it to bear audio preparation so first burst is already decoded. No asset files/PK2 or server edits. Tests cover preload, positional burst cue and once-only dispatch. Also completed missing identity/shield types in the touched effects test fixtures instead of adding test debt.

44focused UI/shield/effects/audio-preparation tests PASS; production TS, capability check and test-type ratchet PASS (no new errors); diff check PASS. Reloaded localhost and cast Iron HideIII: pet gray segment visibly matches the thin HP fill; full shield/expiry sequence completed without a crash or browser warning/error. Evidence E:/CodeProjects/SRO/outputs/pet-design-codex/shield-live/thin-pet-bar-2.png; no speaker-volume listening claim. Browser remains open/full13226HP, quickslots unchanged. Prior gray/activation audio work plus this follow-up remain uncommitted/unpushed.
### Crushing Paw incoming-hit redesign (2026-10-18)

Owner requested replacing the bear's last passive across its three books.
Removed the outgoing every-fifth/sixth-attack proc. The new post-hit owner
`action/petcounter.go` is called from the actual monster-to-player and
monster-to-COS hit doors after their transactions. Every ten landed damage
impacts (physical or magical, including fully shielded hits) attempts the
existing duration-scaled native stun on the attacker. Tier I protects only
the bear; II/III add an independent owner counter. III also rolls 50% separately
for each other eligible monster within a strict 8 m center radius around the
hit recipient. No damage is dealt. Blocks/misses/status-only casts/periodic
damage do not count. Unique monsters, PvP/companion attackers, town and existing
expansion-excluded contexts remain excluded. Counters are transient pet-session
state, not saved ranks or points. Retained skill IDs, names and duration values.

Updated the design exporter (same explicit tree override pattern as Iron Hide),
regenerated all three matching data outputs, current-effect tooltips, user guide
and website passive summary. The workbook still contains the preserved legacy
template; the exporter override defines the approved sequential-tree behavior.
No workbook, DB, gear, point, PK2 or drop-rate changes.

Verification: full action+companion Go packages and scoped go vet PASS; new tests
exercise both real monster hit doors for all tiers and both damage schools,
fully absorbed hits, tenth-hit timing, owner exclusion at I, separate counters,
zero damage, 7.9 m/8.1 m boundary, 49.99%/50% RNG boundary and native-off behavior.
All nine pet-training client tests, production TS, capabilities, test-type
ratchet (no new errors), source encoding and diff checks PASS. verify:quick
still fails the same five existing ownership findings in viewer-camera,
pet-design-data and pet-training; no new findings.

Deployed from opensro-lab through the existing Nomad CLI/state directory:
Agent v1 and GameWorld v4 healthy; GameWorld deployment
d47172a4-fa48-1114-5f5b-15da2a3baf48 successful, allocation
4584d207-8ae9-8fc9-7e06-169e116063d8. Client source is served by existing Vite;
reload browser to display new tooltips/reconnect. No manual live combat test
performed for this passive yet. Changes are uncommitted/unpushed.

### Crushing Paw live acceptance and summon lookup fix (2026-10-18)

Supersedes the earlier no-live-test deployment checkpoint above. Found and fixed
an actual runtime issue: retail attack pets are bag-backed summon records, not
`ActiveCOS` (legacy/transport). `petCounterStun` now resolves the canonical
summoned bear through `owner.Companions()`. The real-hit regression fixtures now
use bag slot 13 and clear ActiveCOS, exercising all three books, both recipients
and physical/magic hit flags 5/9. Removed misleading generic proficiency-5/10
trailers from this sequential-family tooltip. Added a throttled tenth-impact
release diagnostic using the existing helper (its generic message says "attack
pet did not fight"; inspect reason/tier/hits/stun_applied instead).

Live PASS on LabPetTest/LabBear90 with weak native monsters: books I/II/III each
stunned after incoming bear impacts on Lv2 Small-eyed Ghosts; screenshots show
multiple simultaneous stuns for III. With Lv20 Chakji attacking both recipients,
I produced bear releases and no owner release; II and III each produced an
independent owner release at ten impacts. No outgoing attack needed. The native
stun animation is visible. Exact strict-8m/50% boundaries and magical/fully
shielded admission are deterministic regression checks, not claimed as a live
spell test or probability-distribution survey.

Evidence outside Git: E:/CodeProjects/SRO/outputs/pet-design-codex/counter-live/.
`before-test.db` is a verified SQLite backup; `tier3-bear-04.png` (also 05/06/17/18/19)
shows simultaneous nearby Ghost stuns. `tier2-owner.png` and
`tier3-owner-area.png` are current Chakji test captures. Earlier
`tier1-owner-no-proc.png` predates the summon lookup fix and is NOT acceptance.
Ghost log allocation e151a6af-ad54-ee48-b85d-1c94c10c1a5e:
15:55:31 tier I, 15:57:19 tier II, 15:59:10 tier III, stun_applied=true.
Current allocation e0b8b207-c597-5d80-c56e-5ad63649befb, gameworld.stdout.0:
19:56:14/19:56:50 bear I; 19:57:09.530 owner II; 19:57:27.330 bear III;
19:57:41.230 owner III; each hits=10 and stun_applied=true (local +02:00).

The whole local stack had disappeared between sessions; no cause established.
Restarted the existing pinned Nomad via sro-nomad dev-agent with the SAME worktree
data directory, then reconciled Agent/GameWorld using explicit
SRO_ATTACK_PET_EXPANSION=on and the existing hub cluster state. Both are healthy
version0 on the restarted development agent (versions reset with dev-agent).
Agent allocation693b163f-ba1f-7e00-e6aa-12f8c9ce7f7b; GameWorld allocation above.
Vite restarted on127.0.0.1:5180 from opensro-lab. No new GM privileges, drop rates
or feature defaults changed. An earlier deployment without the explicit pet flag
was corrected before these successful tests.

Only LabPetTest was repositioned using the guarded ignored counterfield helper
while authority was stopped. It selects a real native Lv20 aggressive Chakji
nest and only changes spawn/move segment. LabBlader is outside that helper's
scope. Test bow was temporarily unequipped through inventory, then re-equipped;
Crushing Paw III restored. No points/ranks/gear blues were changed for testing.
Normal combat/potion/return-scroll consumption and HP/position changes remain.

Full action+companion tests and scoped go vet PASS again; all9 pet-training
client tests PASS. Prior production TS/capabilities/type-ratchet/encoding checks
remain as recorded above; existing five ownership findings remain unresolved.
Changes are uncommitted/unpushed; no media belongs in Git.

Final live state: returned normally to Hotan Kingdom (X113/Y15), full13226HP,
bear summoned, original bow equipped, Crushing Paw III selected. Return Scroll
completed normally; final-safe-town.png records this. Read-only comparison of
LabBlader character record against before-test.db is byte-identical.

### Crushing Paw high-level stun reliability correction (2026-10-18)

Owner reported five attackers but usually only one visible stun. Shared owner
counting was already correct: all ordinary monster impacts on the owner charge
one counter, independent of attacker identity; the tenth hitter is the primary.
III separately rolls each other monster within8m around the hit recipient.
Found an actual reliability defect: the authored fixed stun grade3 feeds native
level-delta scaling. Against Lv45/90 mobs it reduces nominal100% primary and
secondary stun applications (in addition to the authored50% aura roll). Earlier
Lv2/20 live tests never exposed this. Switched only this passive's stun argument
to grade0, the native derive-from-caster-level mode. Bear90 now casts grade9;
native higher-level/immunity/replacement restrictions otherwise remain intact.
Added area_in_range/area_stunned to the existing throttled release diagnostic.

New TestPetCounterGroupedOwner uses six Lv90 monsters and a bag-backed bear90:
nine owner impacts alternate four attackers, the tenth is a previously unused
fifth attacker; bear is30m away. Primary must stun, four in-range extras each
roll once, the8.1m monster never rolls. Tests cover all-success/all-fail50%
boundaries and alternating independent success/failure. Confirmed this test
fails with the old fixed grade and passes with level-derived grade. Full action
and companion tests plus scoped go vet PASS; focused counter tests PASS after
adding the mixed draws. No player/gear/skill-rank/database changes.

Built/reconciled with explicit pet expansion ON; Agent/GameWorld version1
healthy, GameWorld allocation5b55af37-cc5a-104c-deec-667c9556cf0d,
deployment51a1166d. Additional fix is uncommitted/unpushed.

Post-deploy: reopened the existing LabPlayer/LabPetTest session successfully.
The Bunwang pack had dispersed; no grouped post-fix live proc was captured in
this run. Do not relabel the earlier low-level screenshots as proof of this
high-level correction. New acceptance evidence here is the real-runtime grouped
Lv90 regression, including old-code failure and corrected-code success.

### Subtle retaliation III radius cue (2026-10-18)

Added one faint muted gray-gold ground ripple at the hit recipient when its
third-tier ten-hit counter releases. Expands to8m and fades over0.55s; max
opacity0.09. No sound, camera shake, character animation or attack interruption.
Reuses the existing procedural roar shockwave resource; no assets/PK2 changed.
Port-only broadcast0x3FB3 carries exactly[u32 recipientGID], separate from emotes
so a passive cannot overwrite an ongoing roar. Decoder validates length/nonzero
GID and retains a cosmetic revision; effects freeze the origin and never replay
an expired revision. Emit even if every secondary stun roll fails, since the
radius roll still occurred. Entity despawn/disposal clears the small visual map.

Tests: grouped server counter asserts exactly one correctly-addressed pulse;
36 client effects/shield-state tests PASS including8m extent, faint fade,
stationary origin, expiry/no replay, silent/no-shake and independent emotes.
Full action+companion tests and scoped go vet PASS; production TS/capabilities
PASS, test-type debt unchanged2785, source encoding/diff PASS. verify:quick
still reports the same five existing ownership findings. Built/deployed
GameWorld version2, allocationf599f88f-3885-755d-b7b6-c591b9cdea68.
Live visual appearance still needs an actual grouped proc; tests validate the
renderer output, not a screenshot of combat. Changes remain uncommitted.

### Retaliation live combat / ripple refinement (2026-10-18)

Tested against native Lv20 Chakji with LabPetTest/LabBear90. Repositioned only
LabPetTest with the existing guarded counterfield helper while authority was
stopped. Current healthy GameWorld version4, allocation
8dfc8409-eea1-4f19-e470-db54378b8d06. Fresh gameworld.stdout.0 confirms both
recipient counters plus primary+secondary stuns in the same release:
21:09:29.438 bear, 21:10:04.940 bear, 21:10:19.442 owner,
21:11:05.841 owner, 21:14:05.338 owner: area_in_range=1,
area_stunned=1, stun_applied=true. The owner also produced a failed secondary
roll at21:09:46.943, as expected. This is a two-monster in-range live sample,
not a five-monster statistical probability survey. Primary and secondary native
stun markers are both visible in ripple-live/second-279.png and gray-122.png.

Refined the cosmetic to a dedicated procedural thin gray annulus instead of
the busy roar mesh. Unit radius1, soft grayscale1x16 texture, no walls/spokes;
max opacity0.22 with a smooth sine fade over0.55s. Existing8m expansion and
silent/no-camera/no-posture behavior remain. No PK2 or external asset changed.
Explicitly reload the client to load source updates. Captured the refined
ripple growing and disappearing in live combat on a bear release at21:17:39.832:
E:/CodeProjects/SRO/outputs/pet-design-codex/counter-live/ripple-live/
fresh-438.png through fresh-447.png; fresh-442.png shows the clear thin ring
and stunned Chakji. Full screenshots and timestamp JSONs stay outside Git;
contact sheets are inspection aids, not substitute acceptance screenshots.

59 effects/resource/packet tests PASS; production TS PASS; test-type debt stays
2785 (no new errors); diff check PASS. Earlier full Go checks still apply since
this refinement changes only the client resource/effect and its test. Test owner
remains alive with full13226HP in the field; no skill rank/point/gear changes.
The user approved the live appearance and requested commit/push.
