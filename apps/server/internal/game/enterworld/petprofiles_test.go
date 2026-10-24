/*
===========================================================================

petprofiles_test.go - explicit expansion catalog profiles preserve native off

===========================================================================
*/
package enterworld

import "testing"

/*
================
TestPetProfilesOnlyChangeAttackPetsAfterExplicitApplication
================
*/
func TestPetProfilesOnlyChangeAttackPetsAfterExplicitApplication(t *testing.T) {
	bear := &CharacterRef{Codename: "COS_P_BEAR_040", Level: 40, TidWord: 3 << 11, MaxHP: 1000}
	bear.Parameters.PhysicalDefense, bear.Parameters.MagicalDefense = 100, 100
	horse := &CharacterRef{Codename: "COS_T_HORSE1", TidWord: 1 << 11, MaxHP: 1000}
	items := &TextdataItems{charactersByCodename: map[string]*CharacterRef{bear.Codename: bear, horse.Codename: horse}, summonableCharacters: []CharacterRef{*bear, *horse}}
	items.once.Do(func() {})
	if bear.MaxHP != 1000 {
		t.Fatal("native catalog changed before opt-in")
	}
	items.ApplyAttackPetProfiles()
	if bear.MaxHP != 390 || bear.Parameters.MaxHP != 390 || bear.Parameters.PhysicalDefense != 100 || bear.Parameters.MagicalDefense != 100 || items.summonableCharacters[0].MaxHP != 390 || horse.MaxHP != 1000 {
		t.Fatal("profile did not consistently update attack-pet references only")
	}
}
