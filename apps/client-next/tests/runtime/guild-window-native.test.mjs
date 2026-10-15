/*
===========================================================================

guild-window-native.test.mjs - the guild window's commands as the original

The BN button audit (research ui-button-audit/guild-union.md): Withdraw
bans on the click and refuses the master or oneself with notice 0x10/0x1F
(5E4C30 → 703DD0); the authority button reads "Give authority" for the
master and "Check authority" for a member (5E1E80); an invite goes to the
selected player or a selected mounted pet's rider (700B50).

===========================================================================
*/
import "../helpers/native-source-loader.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { uiFixture } from "../helpers/ui-fixture.mjs";
import { defined } from "../helpers/defined.mjs";

const { emptySocial } = await import( "../../src/engine/foundation/gameplay/social.ts" );
const { targetPlayer } = await import( "../../src/engine/foundation/gameplay/target-player.ts" );

const SELF = 5;

/*
================
member
================
*/
function member( id, name, grade ) {
	return { id, name, grade, level: 40, permissions: 31, grant: "", donated: 0, model: 1907, role: 0, offline: 0 };
}

/*
================
guildWindow

The Guild window's member list for a player of grade selfGrade, with Other
selected.
================
*/
function guildWindow( t, selfGrade ) {
	const sent = [];
	const f = uiFixture( message => {
		if ( message.kind === "gameplay" ) sent.push( message.command );
	} );
	t.after( () => f.dispose() );
	Object.assign( f.state.gameplay, {
		social: {
			...emptySocial( "Player" ),
			self: SELF,
			guild: {
				id: 9,
				name: "Holders",
				level: 3,
				gp: 0,
				subject: "",
				contents: "",
				crest: 0,
				members: [ member( SELF, "Player", selfGrade ), member( 6, "Boss", 0 ), member( 7, "Other", 2 ) ]
			}
		}
	} );
	let now = 1000, last = null;
	const step = () => {
		for ( let i = 0; i < 6; i++ ) last = f.ui.step( f.state, now += 100 ) ?? last;
		return defined( last );
	};
	step();
	f.ui.event( { kind: "activate", id: "open-window:Guild" } );
	step();
	return { f, sent, step };
}

test("Withdraw bans on the click and refuses the master or oneself (5E4C30)", t => {
	const { f, sent, step } = guildWindow( t, 1 );
	for ( const [id, expected] of [ [ 7, { kind: "guild-kick", name: "Other" } ], [ 6, null ], [ SELF, null ] ] ) {
		f.ui.event( { kind: "activate", id: "social-member:" + id } );
		step();
		f.ui.event( { kind: "activate", id: "guild-kick" } );
		const out = step();
		assert.ok( !out.controls.some( c => c.id === "social-confirm-yes" ), "no question" );
		if ( expected ) assert.deepEqual( sent.pop(), expected );
		else {
			assert.equal( sent.length, 0, "member " + id + " is refused" );
			// Notice 0x10/0x1F, UIIT_MSG_GUILD_EXPULSION_NOTEXP.
			assert.ok( f.hasText( "The leader of your guild and you cannot be banned" ), "the refusal notice shows" );
		}
	}
});

test("the authority button reads Give for the master and Check for a member (5E1E80)", t => {
	// UIIT_CTL_GUILD_UNION_CHAT_GRANT / _CONFIRM; the layout's own
	// UIIT_CTL_AUTHORITY_GRANT ("Grant authority") never shows.
	for ( const [grade, label] of [ [ 0, "Give authority" ], [ 1, "Check authority" ] ] ) {
		const { step } = guildWindow( t, grade );
		const button = defined( step().controls.find( c => c.id === "guild-dialog:authority" ) );
		assert.equal( button.label, label );
	}
});

test("an invite goes to the selected player or a mounted pet's rider (700B50)", () => {
	const entities = [
		{ gid: 1, kind: "player", name: "Player" },
		{ gid: 2, kind: "player", name: "Berk" },
		{ gid: 4, kind: "cos" },
		{ gid: 5, kind: "player", name: "Cale", mountedOn: 4 },
		{ gid: 6, kind: "monster" }
	];
	assert.equal( targetPlayer( 2, entities, 1 )?.gid, 2 );
	assert.equal( targetPlayer( 4, entities, 1 )?.gid, 5, "the rider, not the transport" );
	assert.equal( targetPlayer( 6, entities, 1 ), undefined );
	assert.equal( targetPlayer( 1, entities, 1 ), undefined, "never oneself" );
});

test("Invite on a selected mounted pet invites its rider, and nothing for a monster", t => {
	const { f, sent, step } = guildWindow( t, 0 );
	const base = f.state.entities[0];
	f.state.entities.push(
		{ ...base, gid: 40, kind: "cos", name: "" },
		{ ...base, gid: 41, kind: "player", name: "Cale", mountedOn: 40 },
		{ ...base, gid: 42, kind: "monster", name: "Tiger" }
	);
	f.state.gameplay = { ...f.state.gameplay, target: 40 };
	step();
	f.ui.event( { kind: "activate", id: "guild-invite" } );
	assert.deepEqual( sent.pop(), { kind: "guild-invite", gid: 41 } );
	f.state.gameplay = { ...f.state.gameplay, target: 42 };
	step();
	f.ui.event( { kind: "activate", id: "guild-invite" } );
	assert.equal( sent.length, 0, "a monster is not invited" );
});
