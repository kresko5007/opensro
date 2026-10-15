/*
===========================================================================

ui-tuning.ts - the client values a shard may tune at world entry

Port-only, not native. The world-entry bootstrap may carry a `uiTuning`
object (enterworld.BootstrapResult, values from the server's tunables
registry, class "entry"): the Experimental "Short notices" timing and the
chat's own acknowledgement deadline. Each value is taken only when it is a
whole number inside its bounds; anything else, or no object at all (an
older server), keeps today's built-in value, so a bad or missing value can
never change a session's behaviour beyond its bounds.

The notice values feed only the "Short notices" row: a player who keeps
the row off sees the native 7000/2000 banner whatever the shard sends.

===========================================================================
*/

/*
================
UiTuning
================
*/
export interface UiTuning {
	// The "Short notices" banner: how long a notice shows and how much of
	// that is its fade.
	readonly shortNoticeShowMs: number;
	readonly shortNoticeFadeMs: number;
	// The port's deadline for a chat or block acknowledgement (native has none).
	readonly chatAckTimeoutMs: number;
}

// Today's built-in values: what a client uses until a shard says otherwise.
export const DEFAULT_UI_TUNING: UiTuning = Object.freeze( {
	shortNoticeShowMs: 5000,
	shortNoticeFadeMs: 1000,
	chatAckTimeoutMs: 10000
} );

// Each value's accepted range (the server registry's bounds). A fade is at
// most 2000 and a banner at least 3000, so a fade never outlasts its banner.
const BOUNDS: Readonly<Record<keyof UiTuning, readonly [number, number]>> = Object.freeze( {
	shortNoticeShowMs: [ 3000, 7000 ],
	shortNoticeFadeMs: [ 500, 2000 ],
	chatAckTimeoutMs: [ 5000, 30000 ]
} );

/*
================
bounded

value when it is a whole number within key's bounds, else the default.
================
*/
function bounded( key: keyof UiTuning, value: unknown ): number {
	const [min, max] = BOUNDS[key];
	return typeof value === "number" && Number.isInteger( value ) && value >= min && value <= max ?
		value :
		DEFAULT_UI_TUNING[key];
}

/*
================
uiTuningFrom

The tuning a bootstrap value carries (its `uiTuning` field), value by
value.
================
*/
export function uiTuningFrom( bootstrap: unknown ): UiTuning {
	const raw = (bootstrap as { uiTuning?: unknown; } | null)?.uiTuning;
	const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
	return {
		shortNoticeShowMs: bounded( "shortNoticeShowMs", source.shortNoticeShowMs ),
		shortNoticeFadeMs: bounded( "shortNoticeFadeMs", source.shortNoticeFadeMs ),
		chatAckTimeoutMs: bounded( "chatAckTimeoutMs", source.chatAckTimeoutMs )
	};
}
