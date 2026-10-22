/*
===========================================================================
penguin-effects.ts - port-only frost spell signals using native wizard effects.

D0..D2 are Ice Lance impacts; D3..D5 are stationary four-pulse Blizzards;
D6 is Shatter. All signals belong to affected monsters, never an invented hit.
===========================================================================
*/
import type { WolfEffectPart } from "./wolf-effects";

/*
================
penguinEffectParts
================
*/
export function penguinEffectParts( action: number ): readonly WolfEffectPart[] {
	if ( action >= 0xd0 && action <= 0xd2 || action === 0xd6 ) {
		return [ {
			path: "skill/europe/wizard_cold_bolt_b.efp",
			at: 0,
			anchor: "self",
			scale: action === 0xd6 ? 1.5 : 1
		} ];
	}
	if ( action >= 0xd3 && action <= 0xd5 ) {
		return [ 0, 1, 2, 3 ].map( at => ({
			path: "skill/europe/wizard_cold_snow_b.efp",
			at,
			anchor: "self",
			scale: action === 0xd3 ? 1 : 1.4
		}) );
	}
	return [];
}

export const PENGUIN_EFFECT_SOUND: Readonly<
	Record<number, { readonly path: string; readonly at: number; readonly gain: number; readonly shake: boolean; }>
> = Object.fromEntries(
	Array.from(
		{ length: 7 },
		(
			_,
			i
		) => [ 0xd0 + i, {
			path: "/assets/audio/sfx/prim/snd/skill2/" +
				(i >= 3 && i <= 5 ? "usk_wizard_cold_area_a.wav" : "usk_wizard_cold_hit_a.wav"),
			at: 0,
			gain: .55,
			shake: false
		} ]
	)
);
