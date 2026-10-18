/*
===========================================================================
shield-gauge.ts - port-only white absorption segment beside actual health

Scale both portions together only when HP plus shield exceeds max HP. Shield
never changes HP, max HP, healing or the native no-shield gauge presentation.
===========================================================================
*/
import type { EntityState } from "@/engine/contracts/world";

/*
================
shieldGauge
================
*/
export function shieldGauge( entity: Pick<EntityState, "shield"> | undefined, hpRatio: number, now: number ) {
	const s = entity?.shield;
	const ratio = s && s.untilMs > now ? s.amount / s.maxHp : 0;
	const hp = Math.max( 0, Math.min( 1, hpRatio ) );
	const denominator = Math.max( 1, hp + ratio );
	return {
		health: hp / denominator,
		start: hp / denominator,
		shield: ratio / denominator,
		amount: ratio > 0 ? s!.amount : 0
	};
}
