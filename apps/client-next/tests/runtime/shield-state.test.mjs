/*
===========================================================================
shield-state.test.mjs - port-only absorption wire admission and expiry
===========================================================================
*/
import "../helpers/native-source-loader.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { defined } from "../helpers/defined.mjs";
const { createEntities } = await import(
	"../../src/engine/runtime/simulation/worker/session/world/entities/entities.ts"
);
const { shieldGauge, shieldGaugeFill } = await import( "../../src/engine/foundation/ui/shield-gauge.ts" );

/*
================
shieldPacket
================
*/
function shieldPacket( amount = 300, duration = 5000, flags = 0 ) {
	const payload = Buffer.alloc( 21 );
	payload.writeUInt32LE( 7, 0 );
	payload.writeUInt32LE( amount, 4 );
	payload.writeUInt32LE( 1000, 8 );
	payload.writeUInt32LE( duration, 12 );
	payload.writeUInt32LE( 8, 16 );
	payload[20] = flags;
	return { opcode: 0x3fb2, payload };
}

test("shield packets retain separate absorption and retire the segment at exact expiry", () => {
	const entities = createEntities();
	entities.bootstrap( {
		protocolVersion: 2,
		nativeResult: 1,
		refObjSnapshot: [],
		localPlayerEntry: { modelRef: 1933, startProfile: { regionId: 257, x: 1, y: 2, z: 3, angle: 0 } }
	} );
	entities.receive( { opcode: 0x32a6, payload: Buffer.from( [ 7, 0, 0, 0, 0, 0, 0, 0 ] ) }, 0 );
	entities.receive( shieldPacket(), 100 );
	assert.equal( defined( defined( entities.read( 7 ) ).shield ).amount, 300 );
	assert.equal( shieldGauge( entities.read( 7 ), 1, 5099 ).amount, 300 );
	assert.equal( shieldGauge( entities.read( 7 ), 1, 5100 ).amount, 0 );
	entities.receive( shieldPacket( 120, 4000 ), 1100 );
	assert.equal( defined( defined( entities.read( 7 ) ).shield ).untilMs, 5100 );
	entities.receive( shieldPacket( 0, 0, 1 ), 5100 );
	assert.equal( defined( defined( entities.read( 7 ) ).shield ).burst, true );
	assert.equal( shieldGauge( entities.read( 7 ), .5, 5100 ).health, .5 );
	entities.dispose();
});

test("shield decoder rejects oversized, truncated and inconsistent updates", () => {
	const entities = createEntities();
	for (
		const packet of [
			shieldPacket( 1001 ),
			shieldPacket( 300, 5001 ),
			shieldPacket( 300, 5000, 1 ),
			shieldPacket( 0, 0, 2 )
		]
	) {
		assert.throws( () => entities.receive( packet, 0 ), /Invalid shield/ );
	}
	const packet = shieldPacket();
	for ( const length of [ 0, 20, 22 ] ) {
		assert.throws( () => entities.receive( { ...packet, payload: Buffer.alloc( length ) }, 0 ), /Invalid shield/ );
	}
	entities.dispose();
});

test("shield segments use a light-gray HP-style highlight without changing their bounds", () => {
	/** @type {import("../../src/engine/contracts/ui.ts").UiRect} */
	const clip = [ 0, 0, 200, 100 ];
	const rows = shieldGaugeFill( [ 40, 20, 50, 7.5 ], clip );
	assert.equal( rows.length, 8 );
	assert.ok( rows[3].color[0] > rows[0].color[0] );
	assert.ok( rows[3].color[0] > rows[7].color[0] );
	for ( const row of rows ) {
		assert.equal( row.color[0], row.color[1] );
		assert.equal( row.color[1], row.color[2] );
		assert.ok( row.color[0] >= .55 && row.color[0] < .9 );
		assert.ok( row.rect[1] + row.rect[3] <= 27.5 );
		assert.deepEqual( row.clip, clip );
	}
	assert.deepEqual( shieldGaugeFill( [ 0, 0, 0, 8 ], clip ), [] );
});
