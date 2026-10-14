/*
===========================================================================

petgeardrop.go - monsters drop attack-pet gear with rolled blue options

Port-only, not native (companion/gear.go, SRO_ATTACK_PET_EXPANSION). Pet
gear has no shop: a kill may drop one piece of its level band's degree
(uniques one higher) at the degree's chance times the monster rank's
multiplier. The killer's summoned pet raises the magic and rare odds with
Lucky Feather or "of Fortune" blues.

===========================================================================
*/
package action

import (
	"time"

	"opensro.online/server/internal/game/companion"
	"opensro.online/server/internal/game/enterworld"
	"opensro.online/server/internal/game/item/grounditem"
	"opensro.online/server/internal/game/item/inventory"
	"opensro.online/server/internal/game/world/monster"
	"opensro.online/server/internal/game/world/simulation"
)

/*
================
dropRoller

The drop RNG as a companion.Roller; a failed draw reads as the top of the
range, which never rolls a drop or a blue.
================
*/
type dropRoller struct{ rt *Runtime }

func (r dropRoller) Float() float64 {
	if r.rt.DropRoll == nil {
		return 1
	}
	draw, err := r.rt.DropRoll()
	if err != nil {
		return 1
	}
	return float64(draw%dropRollDomain) / dropRollDomain
}

/*
================
preparePetGearDrop
================
*/
func (rt *Runtime) preparePetGearDrop(killer *enterworld.Character, mob monster.Instance, at simulation.Spawn, now time.Time) (grounditem.Item, bool) {
	items := rt.deps.ItemReferences()
	if !rt.AttackPetExpansion || items == nil {
		return grounditem.Item{}, false
	}
	unique := mob.Rarity()&0x0f == 3 || mob.Rarity()&0x0f == 8
	degree, ok := companion.DegreeForLevel(mob.Ref.Level, unique)
	if !ok {
		return grounditem.Item{}, false
	}
	roll := dropRoller{rt}
	if roll.Float() >= companion.DropChance(degree, mob.Rarity()) {
		return grounditem.Item{}, false
	}
	find := 0.0
	if killer.ActiveCOS != nil && killer.ActiveCOS.Summoned {
		find = companion.ModifiersFor(killer.ActiveCOS).FindPct
	}
	slot := min(int(roll.Float()*float64(len(degree.Items))), len(degree.Items)-1)
	ref, found := items.ItemRefByCodename(degree.Items[slot].Codename)
	if !found || ref == nil {
		return grounditem.Item{}, false
	}
	row := inventory.Item{RefObjID: ref.RefObjID, Codename: ref.Codename, TypeFlags: ref.TypeFlags(), Quantity: 1,
		MagicOptions: companion.RollGear(degree, slot, find, roll)}
	return PlanItemDrop(row, 1, at, killer.Name, now), true
}
