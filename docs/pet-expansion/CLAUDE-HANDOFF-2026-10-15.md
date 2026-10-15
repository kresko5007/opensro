# Claude handoff: pet training, sequential books and manual casting

Updated 2026-10-15. Work ONLY in `E:/CodeProjects/opensro-lab`, branch `feat/Attack-pet-expansion` (created from `AttackPetRework`). Skill testing is postponed at the user's request; this checkpoint is saved in Git. Read `REVIEW-2026-10-14.md` here for the earlier bug review. Hub `E:/CodeProjects/opensro` supplies generated game assets and cluster credentials; do not edit its sources.

## Current level-90 checkpoint — read before historical notes

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
