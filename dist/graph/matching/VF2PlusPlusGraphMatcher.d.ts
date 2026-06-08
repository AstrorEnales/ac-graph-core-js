import { VF2BaseGraphMatcher, VF2SearchContext } from './VF2BaseGraphMatcher';
interface VF2PlusPlusSearchContext extends VF2SearchContext {
    /** VF2++ adds a single fixed pattern-node processing order. */
    order: number[];
}
/**
 * VF2++ subgraph isomorphism (Jüttner & Madarasi, 2018).
 *
 * Reuses `VF2BaseGraphMatcher`'s scaffolding and changes two things vs. VF2:
 *
 *   1. Pattern-node ordering. Computed once up front by `computeOrder()` and
 *      stored on the per-search context. The recursion just reads
 *      `ctx.order[depth]` -- no per-step heuristic. The ordering visits
 *      high-degree / rare-label nodes first, propagating hard constraints
 *      as early as possible.
 *
 *   2. Label-aware look-ahead. Overrides `isFeasiblePair` to add a third
 *      pruning layer on top of the base's consistency + structural check:
 *      pn's non-wildcard unmapped neighbors are bucketed by label, tn's
 *      unmapped neighbors are bucketed by label, and pattern[L] must be
 *      <= target[L] for every label L appearing in the pattern bucket.
 */
export declare class VF2PlusPlusGraphMatcher extends VF2BaseGraphMatcher<VF2PlusPlusSearchContext> {
    protected createContext(base: VF2SearchContext): VF2PlusPlusSearchContext;
    protected selectPatternNode(ctx: VF2PlusPlusSearchContext, depth: number): number;
    /**
     * Build the VF2++ pattern-node processing order.
     *
     * Idea: visit constrained nodes first. A node is "constrained" when it
     * has high degree (many edges the mapping must preserve) and/or a label
     * that is rare in the target (few mappable candidates).
     *
     * Algorithm:
     *   while pattern nodes remain unvisited:
     *     pick the most-constrained unvisited node as the next BFS root
     *     BFS outward, processing one level at a time;
     *     within each level, repeatedly pick the best remaining node by
     *     the comparator below until the level is empty.
     *
     * Comparator (positive = first arg preferred):
     *   1. Most edges back into the already-ordered prefix.
     *   2. Highest degree.
     *   3. Rarest label (smallest count of that label in the target).
     *   4. Smallest index (deterministic tie-break).
     *
     * Recomputing (1) inside the inner loop matters: as members of the level
     * get added to the order, their level-siblings' connection counts grow.
     */
    private computeOrder;
    /**
     * VF2++'s addition: a label-aware look-ahead layer on top of the base's
     * consistency + structural look-ahead. Pattern non-wildcard neighbors
     * are bucketed by label, target neighbors of `tn` likewise; we then
     * require pattern[L] <= target[L] for every label L that appears in the
     * pattern bucket. Wildcards skip the check (they can match any label,
     * and the structural total bound is already enforced upstream).
     */
    protected isFeasiblePair(ctx: VF2PlusPlusSearchContext, pn: number, tn: number): boolean;
}
export {};
