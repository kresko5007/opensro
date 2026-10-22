/*
===========================================================================
penguin-effects.test.mjs - bounded frost signals resolve published retail assets.
===========================================================================
*/
import "../helpers/native-source-loader.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { CLIENT_PUBLIC_ROOT } from "../../../../scripts/lib/generatedRoot.mjs";
import { readPublishedAssetBytesSync } from "../../../../scripts/lib/publishedAsset.mjs";
import { penguinEffectParts, PENGUIN_EFFECT_SOUND } from "../../src/engine/foundation/animation/penguin-effects.ts";
const { createCharacterEffects } = await import( "../../src/engine/runtime/characters/effects/effects.ts" );

test("all seven frost signals use published effects and sounds, with bounded pulse timing", () => {
	const programs = JSON.parse( new TextDecoder().decode( readPublishedAssetBytesSync(
		"/assets/effects/programs.json",
		CLIENT_PUBLIC_ROOT
	) ) );
	for ( let action = 0xd0; action <= 0xd6; action++ ) {
		const parts = penguinEffectParts( action );
		assert.equal( parts.length, action >= 0xd3 && action <= 0xd5 ? 4 : 1 );
		for ( const part of parts ) {
			assert.ok( programs.effects[part.path], part.path );
			assert.ok( part.at >= 0 && part.at <= 3 );
			assert.ok( part.scale > 0 && part.scale <= 1.5 );
		}
		const sound = PENGUIN_EFFECT_SOUND[action];
		assert.ok( readPublishedAssetBytesSync( sound.path, CLIENT_PUBLIC_ROOT ).length > 44 );
	}
	assert.deepEqual( penguinEffectParts( 0xcf ), [] );
	assert.deepEqual( penguinEffectParts( 0xd7 ), [] );
});

test("Blizzard remains at the cast position after its victim despawns, then expires", () => {
	let serial = 0;
	const jobs = new Map();
	const owner = createCharacterEffects(
		{
			available: () => 4,
			request( url, limit, type ) {
				jobs.set(
					++serial,
					type === "effects" ? { kind: "effects", catalog: {} } : {
						kind: "bytes",
						buffer: new TextEncoder().encode(
							JSON.stringify( { format: "sro-skill-stage-models", models: {} } )
						).buffer
					}
				);
				return serial;
			},
			take( id ) {
				const job = jobs.get( id );
				jobs.delete( id );
				return job;
			},
			cancel( id ) {
				jobs.delete( id );
			}
		},
		"http://fixture.invalid",
		() => {},
		{ range: () => 0 }
	);
	const entity = {
		gid: 2,
		kind: "monster",
		regionId: 257,
		x: 20,
		y: 0,
		z: 30,
		heading: 0,
		emote: { action: 0xd5, revision: 1 }
	};
	const step = ( entities, at ) => owner.step( entities, { casts: [] }, at, () => true, () => .8, [], undefined, [] );
	step( [ entity ], 0 );
	const pulse = step( [], 1.1 ).filter( part => part.model.includes( "wizard_cold_snow" ) );
	assert.equal( pulse.length, 1 );
	assert.equal( pulse[0].pose.x, 20 );
	assert.equal( pulse[0].pose.z, 30 );
	assert.equal( step( [], 4.1 ).filter( part => part.model.includes( "wizard_cold_snow" ) ).length, 0 );
	owner.dispose();
});
