/*
===========================================================================
training_dummy_test.go - a training kill has no progression or loot settlement.
===========================================================================
*/
package action

import (
	"testing"

	"opensro.online/server/internal/game/world/monster"
	"opensro.online/server/internal/game/world/simulation"
)

/*
================
TestTrainingDummyNoSettlement
================
*/
func TestTrainingDummyNoSettlement(t *testing.T) {
	rt := &Runtime{}
	result := rt.settleMonsterInsideDoor("test", nil, rewardRoster{}, simulation.MonsterDamageResult{
		Fatal: true, Instance: monster.Instance{Ref: monster.MonsterRef{TrainingDummy: true}},
	}, monster.Pose{}, 0)
	if len(result.drops) != 0 || len(result.actorFrames) != 0 || len(result.others) != 0 || len(result.public) != 0 {
		t.Fatal("dummy paid a reward", result)
	}
}
