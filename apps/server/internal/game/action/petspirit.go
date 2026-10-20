/*
===========================================================================
petspirit.go - port-only Unbroken Spirit, owned by the normal pet tick.

Resolve is transient. HP grows only by the newly earned maximum, and drops
clamp without killing. A successful empowered cast spends stacks atomically.
===========================================================================
*/
package action

import (
	"opensro.online/server/internal/domain"
	"opensro.online/server/internal/game/companion"
	"opensro.online/server/internal/game/enterworld"
	"opensro.online/server/internal/game/item/wire"
	"opensro.online/server/internal/game/world/simulation"
)

const petSpiritOpcode uint16 = 0x3fb5
const petSpiritLifetime int64 = 15000

/*
================
spiritBraced
================
*/
func (rt *Runtime) spiritBraced(owner *enterworld.Character, pet *domain.CharacterCOS) bool {
	skill, _, ok := companion.Spirit(pet)
	return rt.petExpansionAllowed(owner, pet) && ok && skill.Option >= 2 && pet.ResolveStacks == companion.ResolveLimit
}

/*
================
petSpiritFrame
================
*/
func petSpiritFrame(pet *domain.CharacterCOS, until, now int64) wire.Frame {
	skill, _, _ := companion.Spirit(pet)
	return wire.Frame{Opcode: petSpiritOpcode, Payload: wire.NewWriter(10).U32(pet.GID).
		U8(pet.ResolveStacks).U8(uint8(skill.Option)).U32(uint32(max(int64(0), until-now))).Payload()}
}

/*
================
setPetSpirit

Called inside the owning character's transaction; immutable reference stays intact.
================
*/
func (rt *Runtime) setPetSpirit(pet *domain.CharacterCOS, stacks uint8) {
	before, ok := rt.cosReference(pet)
	pet.ResolveStacks = stacks
	after, found := rt.cosReference(pet)
	if !ok || !found || pet.CurrentHP == 0 {
		return
	}
	if after.MaxHP > before.MaxHP {
		pet.CurrentHP += after.MaxHP - before.MaxHP
	}
	pet.CurrentHP = min(pet.CurrentHP, after.MaxHP)
}

/*
================
gainPetSpirit

One stack per landed monster impact, including shielded hits; blocks do not count.
================
*/
func (rt *Runtime) gainPetSpirit(division string, owner *enterworld.Character, pet *domain.CharacterCOS, now int64) []wire.Frame {
	if !rt.petExpansionAllowed(owner, pet) || rt.inTown(division, owner) || pet.CurrentHP == 0 {
		return nil
	}
	skill, _, ok := companion.Spirit(pet)
	if !ok {
		return nil
	}
	state := rt.petSessionFor(division, owner.Name, pet.GID)
	if state == nil {
		return nil
	}
	if state.trained.resolveBook != skill.ID && pet.ResolveStacks > 0 {
		rt.setPetSpirit(pet, 0)
	}
	state.trained.resolveBook = skill.ID
	state.trained.resolveUntil = now + petSpiritLifetime
	rt.setPetSpirit(pet, min(companion.ResolveLimit, pet.ResolveStacks+1))
	return []wire.Frame{petSpiritFrame(pet, state.trained.resolveUntil, now)}
}

/*
================
spendPetSpirit

Only successful Roar/Shield write doors call this; refusals preserve Resolve.
================
*/
func (rt *Runtime) spendPetSpirit(owner *enterworld.Character, pet *domain.CharacterCOS) bool {
	skill, _, ok := companion.Spirit(pet)
	if !rt.petExpansionAllowed(owner, pet) || !ok || skill.Option != 3 || pet.ResolveStacks != companion.ResolveLimit {
		return false
	}
	rt.setPetSpirit(pet, 0)
	return true
}

/*
================
advancePetSpirit

Expiry, death, town, slot changes and resummons cannot retain a free heal.
================
*/
func (rt *Runtime) advancePetSpirit(key petOwnerKey, now int64) []simulation.Frame {
	state := rt.petSessionFor(key.division, key.name, key.gid)
	if state == nil || state.character == nil {
		return nil
	}
	owner := rt.characterSnapshot(key.division, state.character)
	pet := owner.CompanionByGID(key.gid)
	if pet == nil || pet.ResolveStacks == 0 {
		return nil
	}
	skill, _, learned := companion.Spirit(pet)
	if learned && skill.ID == state.trained.resolveBook && rt.petExpansionAllowed(owner, pet) && pet.Summoned && pet.CurrentHP > 0 &&
		enterworld.CharacterAlive(owner) && !rt.inTown(key.division, owner) && now < state.trained.resolveUntil {
		return nil
	}
	if !rt.deps.UpdateDeferred(state.character, "pet-spirit-expire", func() bool {
		live := state.character.CompanionByGID(key.gid)
		if live == nil {
			return false
		}
		rt.setPetSpirit(live, 0)
		return true
	}) {
		return nil
	}
	live := state.character.CompanionByGID(key.gid)
	state.public = append(state.public, petSpiritFrame(live, now, now), wire.Frame{Opcode: simulation.OpVitalsUpdate,
		Payload: simulation.HPRefreshPayload(live.GID, 0, live.CurrentHP)})
	return simFrames(append([]wire.Frame{petSpiritFrame(live, now, now), {Opcode: simulation.OpVitalsUpdate, Payload: simulation.HPRefreshPayload(live.GID, 0, live.CurrentHP)}}, rt.petTrainingStateFrames(live, now)...))
}
