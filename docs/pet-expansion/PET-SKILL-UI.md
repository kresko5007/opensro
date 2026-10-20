# Pet skill UI handoff - 2026-10-20

Implemented on `feat/Attack-pet-expansion`, after ba727457. Not committed yet.

- Twenty original painted family icons match the native character skill style.
  The three sequential books share family art; their names and bottom-right
  rank distinguish progression. Tree, numbered slots and drag preview all use
  the same atlas. Source, cell layout and publishing: `assets/README.md`.
- Removed row-side captions/status. Native question icons on the left expose
  controls, unlock rules, shared recharge, restrictions and separate hit counts.
- All twenty families use compact effect/stat lines with native gold diamond
  sections. Requirements stay at the bottom, individually red when unmet.
  Unlearned books retain effects. General controls no longer fill skill help.
- Top-right native-style badges show Resolve, bear retaliation hits, crow
  burst progress and Mark Prey's attacks remaining. Owner retaliation hits
  remain separate and are shown in the row information tooltip.
- Port-only private 0x3FB6: LE u32 pet GID, then u8 attacks modulo40, bear
  hits0..9, owner hits0..9, Resolve0..10. The existing pet tick sends only
  changed values; opening the tree requests a fresh snapshot. Flag off sends
  none. Decoder rejects malformed packets, ignores other pets and preserves
  cooldown receipt time. No client prediction, persistence or global GID lookup.
- Fixed existing next-rank preview: include worn +skills, so learning no longer
  appears to reduce a skill's current effect. Covered with actual worn gear.

## Verified

- Twelve targeted client training tests pass; all four client source gates pass.
- Action, companion and item/wire Go package tests pass; module lint0issues.
  Counter tests cover initial publication, deduplication, off flag, independent
  values, death/unknown pet, modulo8/10 progress and gear-aware previews.
- All14 portable source gates passed. Formatting/encoding/diff checks passed.
- Published through `SRO_GAME_ROOT=... pnpm assets refresh pet-loot`: one UI
  pack rebuilt; atlas is a claimed build output, not a loose local-only file.
- Backend Agent healthy version1, GameWorld healthy version2. Client reloaded
  at127.0.0.1:5180 and remains open on LabPetTest/LabBear's Skills tab.
- Live weak Bunwang combat: owner's separate incoming-hit count reached7/10;
  after Roar transferred aggro, Resolve reached10 and bear retaliation badge
  advanced4 then7 while the owner stayed at full13226HP. Native icons,
  row-help and compact tooltips displayed. Current3.2% Resolve preview now
  correctly shows next3.3%; unmet pet94 requirement is red.
- Screenshot outside Git: E:/CodeProjects/SRO/outputs/pet-design-codex/pet-skill-ui.png.

No schema migration or balance change. No new skill ranks/gear granted.
Other pets were covered by mapping/logic tests, not new full live combat tests.
The pre-existing unsupported native particle-rotation warning remains; no new
counter/texture decode error appeared. No video or screenshot is committed.

## Layout follow-up

The three books now occupy adjacent native cells at36px pitch. Five unused
cells use the character tree's `skl_mastery_nothing.png` gray placeholders;
locked books use `skl_mastery_disable.png`, revealed unlearned books use its
128/255 preview alpha. Locked skill descriptions remain available. Restored
character skill cells to their original36px pitch as well: the first icon UI
change had accidentally changed their spacing through a shared text replacement.
