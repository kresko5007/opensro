/*
===========================================================================
training-dummy.test.mjs - GM composition and shared wooden target appearance.
===========================================================================
*/
import "../helpers/native-source-loader.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
const { gmRequest } = await import( "../../src/engine/foundation/gameplay/gm-command.ts" );
const { createAppearanceLookup } = await import( "../../src/engine/runtime/characters/appearance-lookup.ts" );

test("training dummy command resolves only published levels through native GM spawn", () => {
	const monster = code => {
		const level = Number( code.slice( -3 ) );
		return code.startsWith( "MOB_GM_TRAINING_DUMMY_" ) ? { refObjId: 5000100 + level, monsterType: 0 } : undefined;
	};
	for ( const level of [ 1, 21, 140 ] ) {
		const frame = gmRequest( `/TRAININGDUMMY ${level}`, new Map(), 0, { monster } );
		assert.equal( frame.opcode, 0x75b6 );
		assert.equal( new DataView( frame.payload.buffer ).getUint32( 1, true ), 5000100 + level );
		assert.deepEqual( [ ...frame.payload.slice( 5 ) ], [ 1, 0 ] );
	}
	assert.ok( gmRequest( "/trainingdummy", new Map(), 0, { monster } ) );
	for ( const arg of [ "0", "141", "1.5", "-1", "NaN", "21 extra" ] ) {
		assert.equal( gmRequest( `/TRAININGDUMMY ${arg}`, new Map(), 0, { monster } ), null );
	}
	assert.equal( gmRequest( "/TRAININGDUMMY 21" ), null, "off has no published dummy references" );
});

test("dummy namespace reuses the wooden model without changing normal monsters", () => {
	const body = { codename: "MOB_CH_MANGNYANG", glb: "/wooden.glb" };
	const lookup = createAppearanceLookup( {
		referenceAppearances: { skin: () => undefined, get: () => undefined },
		published: { catalog: new Map( [ [ 1933, body ] ] ), deathModels: new Map() },
		structureVisuals: {},
		deathShown: () => false
	} );
	for ( const id of [ 5000101, 5000121, 5000240 ] ) {
		assert.equal( lookup.resourceFor( { kind: "monster", refObjId: id } ), body );
	}
	assert.equal( lookup.resourceFor( { kind: "monster", refObjId: 1933 } ), body );
	assert.equal( lookup.resourceFor( { kind: "monster", refObjId: 5000241 } ), undefined );
});
