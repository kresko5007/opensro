# Attack-pet review follow-up

Port-only, not native. Both the server opt-in `SRO_ATTACK_PET_EXPANSION=on`
and client Experimental > Pets > Attack-pet training are required.

## Changes

- Merge upstream native client/server changes without losing the pet tabs,
  native inventory reference helpers, projectile options or COS window binding.
- Schema 28 combines upstream academy-honor schema 27 and the earlier pet
  schema history. The offline upgrader preserves raw character JSON and keeps
  a backup; schema 23 through 27 fixtures verify idempotence and preservation.
  Stop the shard, run `sro-authority-upgrade -authority-dir <authority-dir>
  -commit`, then deploy matching binaries. Older binaries must not write it.
- Shields absorb monster damage only, including monster DoTs. Player strikes
  and player DoTs bypass them. Hit-time job/free-battle/instance exclusion is
  retained. Disabling the expansion stops absorption immediately.
- Retribution accumulates post-shield HP damage; damage-trigger counters use
  committed impacts. The separate retaliation passive intentionally counts
  landed incoming hits even when a shield absorbs their damage.
- Party membership is rechecked before shield retention/expiry. Actor teardown
  cancels shields received or cast by a departing actor without an explosion.
- Native bear appearance alone no longer prefetches expansion skill audio.
- Merchant filtering requires the server opt-in. Custom item wire layout stays
  intrinsic to the reserved pet references so saved items remain decodable
  after disabling the feature; existing native item layouts are unchanged.
- Binary source sheets/XLSX and the workstation diary are removed. Text recipes
  generate the collar atlas and 27 icons; canonical JSON owns balance. See
  [asset provenance](ASSET-PROVENANCE.md) for sources and native input hashes.
- Architecture gates admit only explicitly readonly literal tables, rejecting
  constructors, reference captures, spreads and executable initializers. The
  procedural effect dispatch uses explicit calls visible to execution checks.

## Verification

| Check | Result |
| --- | --- |
| Complete Go test suite after upstream merge | Passed |
| Action/store/wire/GameWorld tests after follow-up fixes | Passed |
| Go vet: action, companion, store | Passed |
| Portable source pipeline, all 14 tasks | Passed |
| Client typecheck, ownership, capabilities, execution map | Passed |
| Focused pet, shield, resource/effects and audio tests | 96 passed |
| Merged options/native material/published character checks | 37 passed |
| Procedural icon and collar asset tests | Passed; 27 unique icons, valid GLB/atlas |
| Offline local upgrade and backend restart | Passed; backup retained |
| Live level-90 bear inventory, learned tiers, shield/roar and shared cooldown | Passed smoke test against weak Chakji |
| Separate untouched character | Original record preserved across upgrade/test |
| Full client runtime suite | Not green; native effect/scene and UI cases remain, see below |
| Every advanced skill/proc and two real party clients | Not re-certified; required before full acceptance |

The broad client run initially reported 21 failures among 4,240 tests. The
options overflow and custom-collar assumptions were corrected (37 relevant
checks now pass), and the server item projection was rebuilt. Other failures
involve published/native effect schedules (including rotation assignments),
item-use effects and the Magic Pang panel sweep. The rotation-program source
is unchanged from upstream main. These results are not represented as full
client acceptance or as exhaustive multiplayer verification.

## Repeatable checks

Set `SRO_GAME_ROOT` to the directory containing your licensed `extracted/` tree;
use the repository's documented Python dependencies and Go toolchain.

```sh
pnpm task check:source-portable
pnpm --filter @sro/client-next verify:quick
pnpm --filter @sro/client-next test
pnpm assets refresh pet-loot
python scripts/tools/pet_design_export.py
cd apps/server
go test ./...
go vet ./internal/game/action ./internal/game/companion ./internal/data/store
```

Balance and animation work remains iterative. New independent maintainer
review and exact-head GitHub CI are still required; local tests do not replace
those approvals. No peer approval has been manufactured or marked complete.
