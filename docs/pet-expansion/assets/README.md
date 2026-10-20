# Pet skill icons

`pet-skills.png` is original AI-generated artwork created for the pet expansion.
Native character skill icons supplied the visual reference, not the subjects.
No retail PK2 is edited.

The unchanged atlas has five equal columns (the two active and three passive
rows) and four equal rows: Wolf, Bear, Penguin, Crow. All three books in a
family share the symbol; book names and the bottom-right learned-rank badge
show progression. `pet-skill-icons.ts` selects cells using normalized UVs.

`buildPetItemIcons()` publishes this source through full CIF and focused
`pnpm assets refresh pet-loot` builds, with the normal publication ledger and
UI icon packs. Set `SRO_GAME_ROOT` to your licensed extracted client root.

Top-right badges show server-observed Resolve, bear retaliation hits or crow
burst progress. Mark Prey shows attacks remaining to recharge. The left row
help also shows the owner's independent retaliation count. These are transient
combat values, not saved skill ranks or client-predicted animation counts.
