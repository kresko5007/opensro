/*
===========================================================================

pet-training.test.mjs - the attack-pet tree's 0x3FB1 state and its help text

The server's state push (item/wire/pettraining.go) decodes to skills, row
cooldowns and worn gear with its blue options; a malformed push is a
protocol error, never a partial state. Help and affix lines read the
design workbook's generated module.

===========================================================================
*/
import "../helpers/native-source-loader.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
const { createPetTraining, OP_PET_TRAINING_STATE } = await import(
	"../../src/engine/runtime/simulation/worker/session/world/gameplay/pet-training/pet-training.ts"
);
const { petSkillHelp, petSkillDesign, petAffixLine, petRows, PET_AFFIX_PARAM_BASE, PET_GEAR_SLOTS } = await import(
	"../../src/engine/foundation/ui/pet-training.ts"
);
const { PET_DESIGN } = await import( "../../src/engine/foundation/ui/pet-design-data.ts" );

/*
================
statePayload

The server's layout: gid, points, attack%, defense%, two rows, slotted
passives, skills, gear with options.
================
*/
function statePayload( skills, gear ) {
	const bytes = [];
	const u16 = v => bytes.push( v & 0xff, v >> 8 );
	const u32 = v => bytes.push( v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24 );
	const u64 = v => {
		for ( let i = 0n; i < 8n; i++ ) bytes.push( Number( (v >> (8n * i)) & 0xffn ) );
	};
	u32( 0x2000001 );
	bytes.push( 3 );
	u16( 109 );
	u16( 103 );
	u32( 4000 );
	u16( 0 );
	bytes.push( 5, ..."Timer".split( "" ).map( c => c.charCodeAt( 0 ) ) );
	u32( 0 );
	u16( 2 );
	bytes.push( 7, ..."Attacks".split( "" ).map( c => c.charCodeAt( 0 ) ) );
	bytes.push( 0, 0, 0 );
	bytes.push( skills.length );
	for ( const s of skills ) {
		bytes.push( s.id, s.level, s.effective, s.next, s.flags );
		u16( s.value );
		u16( s.nextValue );
	}
	bytes.push( gear.length );
	for ( const [ ref, options ] of gear ) {
		u32( ref );
		bytes.push( options.length );
		options.forEach( u64 );
	}
	return Uint8Array.from( bytes );
}

const wolf = PET_DESIGN.skills.find( s => s.pet === "Wolf" && s.row === 0 && s.status === "Implemented" );
const affix = PET_DESIGN.affixes.find( a => a.status === "Implemented" );
const blue = (7n << 32n) | BigInt( PET_AFFIX_PARAM_BASE + affix.code );
const collar = PET_DESIGN.gear[0].items[0].id;

test("the state decodes rows, skills and worn gear with its blues", () => {
	const asked = [];
	const training = createPetTraining( ( ref, slot, magic ) => {
		asked.push( [ ref, slot, magic ] );
		return { slot, refObjId: ref, name: "Collar" };
	} );
	const payload = statePayload( [
		{ id: wolf.id, level: 1, effective: 2, next: 21, flags: 1 | 2 | 4 | 8, value: 114, nextValue: 118 }
	], [ [ collar, [ blue ] ], [ 0, [] ], [ 0, [] ] ] );
	assert.equal( training.receive( { opcode: 0x3fb0, payload }, 5 ), false );
	assert.equal( training.receive( { opcode: OP_PET_TRAINING_STATE, payload }, 5 ), true );
	const state = training.state();
	assert.equal( state.gid, 0x2000001 );
	assert.equal( state.points, 3 );
	assert.deepEqual( state.rows, [ { timerMs: 4000, left: 0, kind: "Timer" }, { timerMs: 0, left: 2, kind: "Attacks" } ] );
	assert.deepEqual( state.skills[0], {
		id: wolf.id,
		level: 1,
		effectiveLevel: 2,
		nextPetLevel: 21,
		action: true,
		auto: true,
		learnable: true,
		live: true,
		slotted: false,
		value: 11.4,
		nextValue: 11.8
	} );
	assert.deepEqual( asked, [ [ collar, 0, [ blue.toString() ] ] ] );
	assert.deepEqual( state.gear.map( g => g?.name ?? null ), [ "Collar", null, null ] );
	training.clear();
	assert.equal( training.state(), undefined );
});

test("a truncated or padded state is refused", () => {
	const training = createPetTraining( () => null );
	const payload = statePayload( [], [] );
	assert.throws( () => training.receive( { opcode: OP_PET_TRAINING_STATE, payload: payload.subarray( 0, 20 ) }, 0 ) );
	assert.throws( () =>
		training.receive( { opcode: OP_PET_TRAINING_STATE, payload: Uint8Array.from( [ ...payload, 0 ] ) }, 0 )
	);
	assert.equal( training.state(), undefined );
});

test("help, rows and blue lines read the design", () => {
	const skill = {
		id: wolf.id,
		level: 1,
		effectiveLevel: 1,
		nextPetLevel: 15,
		action: true,
		auto: false,
		learnable: false,
		live: true,
		slotted: false,
		value: 5,
		nextValue: 6
	};
	const help = petSkillHelp( petSkillDesign( wolf.id ), skill, 12, 0 );
	assert.match( help, new RegExp( `^${wolf.name} \\(action\\)\\nLevel 1 / ${wolf.maxLevel}\\n` ) );
	assert.match( help, /Needs pet level 15 \(now 12\) and 1 skill point \(0 free\)\./ );
	assert.match( help, /Autocast off: right-click to switch\.$/ );
	const rows = petRows( { gid: 1, skills: [ skill ] } );
	assert.equal( rows.length, 5 );
	assert.equal( rows[0][0].design.id, wolf.id );
	assert.equal( petAffixLine( blue.toString() ), affix.effect.replaceAll( "{v}", "7" ) );
	assert.equal( petAffixLine( String( (7n << 32n) | 3n ) ), null );
	assert.equal( PET_GEAR_SLOTS.length, 3 );
});
