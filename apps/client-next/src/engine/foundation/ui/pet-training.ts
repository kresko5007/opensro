/*
===========================================================================

pet-training.ts - how the pet window presents the attack-pet tree and gear

Port-only, not native (the server's SRO_ATTACK_PET_EXPANSION and the
Experimental window's attack-pet training row). The server decides every
rule and sends each skill's level, requirement and effect values (0x3FB1);
names, effect text, ranks, icons and affix text come from the design
workbook's export (pet-design-data.ts). Pure.

===========================================================================
*/
import type { PetTraining, PetTrainingSkill } from "@/engine/contracts/gameplay";
import { PET_DESIGN } from "./pet-design-data";

// The server's training operations (action/pettraining.go).
export const PET_TRAINING_OP = { state: 0, learn: 1, auto: 2, equip: 3, unequip: 4, refund: 5, slot: 6 } as const;

// Blue options of pet gear: param id = base + affix code (companion/gear.go).
export const PET_AFFIX_PARAM_BASE = 0x8000;

export type PetSkillDesign = (typeof PET_DESIGN.skills)[number];

// The tree's rows and the gear slots, with the character equipment socket
// art each slot borrows (necklace, chest, ring).
export const PET_ROW_NAMES = [ "Active I", "Active II", "Passive I", "Passive II", "Passive III" ] as const;
export const PET_GEAR_SLOTS: readonly { readonly name: string; readonly socket: number; }[] = [
	{ name: "Collar", socket: 10 },
	{ name: "Harness", socket: 1 },
	{ name: "Charm", socket: 11 }
];

/*
================
petSkillDesign
================
*/
export function petSkillDesign( id: number ): PetSkillDesign | undefined {
	return PET_DESIGN.skills.find( s => s.id === id );
}

/*
================
petRows

The pet's skills laid out by row (0-1 actions, 2-4 passives), each row in
option order, from the state's skill list.
================
*/
export function petRows( state: PetTraining ): { design: PetSkillDesign; skill: PetTrainingSkill; }[][] {
	const rows: { design: PetSkillDesign; skill: PetTrainingSkill; }[][] = [ [], [], [], [], [] ];
	for ( const skill of state.skills ) {
		const design = petSkillDesign( skill.id );
		if ( design ) rows[design.row]!.push( { design, skill } );
	}
	for ( const row of rows ) row.sort( ( a, b ) => a.design.option - b.design.option );
	return rows;
}

/*
================
petPetName

The pet kind of a state ("Wolf", ...), from its first skill.
================
*/
export function petPetName( state: PetTraining ): string {
	return petSkillDesign( state.skills[0]?.id ?? 0 )?.pet ?? "";
}

/*
================
formatValue
================
*/
function formatValue( value: number ): string {
	return Number.isInteger( value ) ? String( value ) : value.toFixed( 1 ).replace( /\.0$/, "" );
}

/*
================
petEffect

A skill's effect text at a value ({v} substituted).
================
*/
export function petEffect( design: PetSkillDesign, value: number ): string {
	return design.effect.replaceAll( "{v}", formatValue( value ) );
}

/*
================
petRowCooldown

An active row's cooldown as text: "" when ready.
================
*/
export function petRowCooldown( state: PetTraining, row: number, nowMs: number ): string {
	const r = state.rows[row];
	if ( !r ) return "";
	const ms = r.timerMs - Math.max( 0, nowMs - state.receivedAtMs );
	if ( ms > 0 ) return `${Math.ceil( ms / 1000 )}s`;
	return r.left > 0 ? `${r.left} ${r.kind.toLowerCase()}` : "";
}

/*
================
petSkillHelp

The help text of one skill slot: name, kind, level, effect now and next,
ranks, the next level's requirement and how to use it.
================
*/
export function petSkillHelp(
	design: PetSkillDesign,
	skill: PetTrainingSkill,
	petLevel: number,
	points: number
): string {
	const rules = PET_DESIGN.rules, lines = [ `${design.name} (${skill.action ? "action" : "passive"})` ];
	if ( !skill.live ) lines.push( "Coming later: this skill cannot be learned yet." );
	const bonus = skill.effectiveLevel > skill.level ? ` (+${skill.effectiveLevel - skill.level} from gear)` : "";
	lines.push( `Level ${skill.level} / ${design.maxLevel}${bonus}` );
	if ( skill.level > 0 ) lines.push( "Now: " + petEffect( design, skill.value ) );
	if ( skill.nextPetLevel > 0 ) {
		lines.push( "Next level: " + petEffect( design, skill.nextValue ) );
		lines.push(
			`Needs pet level ${skill.nextPetLevel}` + (petLevel < skill.nextPetLevel ? ` (now ${petLevel})` : "") +
				` and 1 skill point (${points} free).`
		);
	} else lines.push( "Maximum level." );
	if ( design.cooldown !== null ) {
		lines.push( `Cooldown: ${formatValue( design.cooldown )} ${design.cooldownUnit} (shared by its row).` );
	}
	lines.push( `Rank II (level ${rules.rank2Level}): ${design.rank2}` );
	lines.push( `Rank III (level ${rules.rank3Level}): ${design.rank3}` );
	if ( skill.action && skill.level > 0 ) {
		lines.push( `Autocast ${skill.auto ? "on" : "off"}: right-click to switch.` );
	}
	if ( !skill.action && skill.level > 0 ) {
		lines.push( skill.slotted ? "Slotted: active in its row." : "Click to slot it (one passive per row)." );
	}
	return lines.join( "\n" );
}

/*
================
petAffixLine

The tooltip line of one pet gear blue option, or null for any other
option (a native magic option renders through item-tooltip-magic).
================
*/
export function petAffixLine( encoded: string ): string | null {
	const bits = BigInt( encoded ), param = Number( bits & 0xffffn );
	if ( param <= PET_AFFIX_PARAM_BASE ) return null;
	const affix = PET_DESIGN.affixes.find( a => a.code === param - PET_AFFIX_PARAM_BASE );
	return affix ? affix.effect.replaceAll( "{v}", String( Number( bits >> 32n ) ) ) : null;
}
