/*
===========================================================================
runtime_movement.go - live actor placement and admitted walk constraints

Keeps position sampling and owner-aware movement on one action runtime lane.
===========================================================================
*/
package action

import (
	"opensro.online/server/internal/game/enterworld"
	"opensro.online/server/internal/game/world/simulation"
)

/*
==================
liveSpawn

liveSpawn samples the character's LIVE position - the bug-D plane. Every
position-dependent op reads THIS, never the goal in WorldState.Spawn.
==================
*/
func (rt *Runtime) liveSpawn(
	worldKey string,
	character *enterworld.Character,
	nowMs int64,
) simulation.Spawn {
	snapshot := rt.Worlds.Snapshot(worldKey, func() simulation.WorldState {
		return simulation.SeedWorldState(character)
	})

	return snapshot.LiveSpawnAt(nowMs)
}

/*
==================
LiveSpawnFor

The character's live position now, for lanes outside action that gate on
native range (the party invite's CGObjChar_CheckHitRange).
==================
*/
func (rt *Runtime) LiveSpawnFor(divisionID string, character *enterworld.Character) simulation.Spawn {
	return rt.liveSpawn(simulation.WorldKey(divisionID, character.Name), character, rt.Now().UnixMilli())
}

/*
==================
liveNav

liveNav is liveSpawn plus the surface owner retained at that point.
==================
*/
func (rt *Runtime) liveNav(
	worldKey string,
	character *enterworld.Character,
	nowMs int64,
) (simulation.Spawn, simulation.NavOwner) {
	snapshot := rt.Worlds.Snapshot(worldKey, func() simulation.WorldState {
		return simulation.SeedWorldState(character)
	})

	return snapshot.LiveSpawnAt(nowMs), snapshot.LiveOwnerAt(nowMs)
}

/*
==================
constrainWalk

constrainWalk routes a character move through the owner-aware constraint,
degrading to the owner-less one only in compositions that lack it.
==================
*/
func (rt *Runtime) constrainWalk(
	characterName string,
	from simulation.Spawn,
	fromOwner simulation.NavOwner,
	to simulation.Spawn,
) (simulation.Spawn, simulation.NavWalk, *simulation.MoveError) {
	if rt.ConstrainWalk != nil {
		return rt.ConstrainWalk(characterName, from, fromOwner, to)
	}

	if rt.ConstrainMovement != nil {
		committed, refusal := rt.ConstrainMovement(characterName, from, to)
		return committed, simulation.NavWalk{}, refusal
	}

	return to, simulation.NavWalk{}, nil
}

/*
==================
admitGroundWalk

Player approaches retain their intended goal while the world owner checks
each elapsed movement step. A skill displacement still resolves its whole
authored chord through constrainWalk before it commits.
==================
*/
func (rt *Runtime) admitGroundWalk(
	characterName string,
	from simulation.Spawn,
	fromOwner simulation.NavOwner,
	to simulation.Spawn,
) (simulation.Spawn, simulation.NavWalk, *simulation.MoveError) {
	if rt.AdmitGroundWalk != nil {
		return rt.AdmitGroundWalk(characterName, from, fromOwner, to)
	}
	return rt.constrainWalk(characterName, from, fromOwner, to)
}

/*
==================
samePlacement

samePlacement compares where a move lands. Walked goals stand on their
surface's height, so the requested int16 Y is not part of the comparison.
==================
*/
func samePlacement(a, b simulation.Spawn) bool {
	return a.RegionID == b.RegionID && a.X == b.X && a.Z == b.Z
}
