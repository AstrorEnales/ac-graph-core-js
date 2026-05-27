import {VF2BaseGraphMatcher, VF2SearchContext} from './VF2BaseGraphMatcher';

/**
 * VF2 subgraph isomorphism (Cordella, Foggia, Sansone, Vento, 2001 / 2004).
 *
 * The full algorithm — backtracking driver, terminal-set bookkeeping, edge
 * consistency check, structural look-ahead — lives in `VF2BaseGraphMatcher`.
 * This class plugs in the two hooks that define stock VF2:
 *
 *   - `createContext`: no per-search extras, just pass the base context
 *     through.
 *   - `selectPatternNode`: smallest-index unmapped pattern node that sits
 *     in some terminal set, falling back to the smallest unmapped index.
 *
 * The default `isFeasiblePair` from the base (layers 1 + 2) is the VF2
 * feasibility rule unchanged, so this class does not override it.
 */
export class VF2GraphMatcher extends VF2BaseGraphMatcher {
	protected createContext(base: VF2SearchContext): VF2SearchContext {
		return base;
	}

	/**
	 * VF2's "pick from the frontier" heuristic. Preferring nodes already
	 * adjacent to the mapped region propagates structural constraints
	 * earlier than picking arbitrarily. For connected patterns rooted at
	 * node 0 this happens to match Ullmann's natural-index iteration.
	 */
	protected selectPatternNode(ctx: VF2SearchContext, _depth: number): number {
		let fallback = -1;
		for (let i = 0; i < ctx.n; i++) {
			if (ctx.core1[i] !== -1) {
				continue;
			}
			if (ctx.in1[i] > 0 || ctx.out1[i] > 0) {
				return i;
			}
			if (fallback === -1) {
				fallback = i;
			}
		}
		return fallback;
	}
}
