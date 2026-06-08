import { Mapping } from '.';
import { Graph } from '..';
import { GraphMatcher } from './GraphMatcher';
/**
 * Per-search state shared by every VF2-family matcher. Subclasses extend
 * this interface to attach algorithm-specific extras (e.g. VF2++ adds the
 * precomputed processing order).
 */
export interface VF2SearchContext {
    pattern: Graph;
    target: Graph;
    n: number;
    m: number;
    /** core1[i] = target node pattern node i is mapped to, or -1. */
    core1: number[];
    /** core2[j] = pattern node target node j is mapped to, or -1. */
    core2: number[];
    /**
     * Terminal-set membership, encoded as "depth of insertion": a positive
     * value is the recursion depth at which the node first joined the set;
     * 0 means "not in the set". This makes backtracking O(n+m): zero every
     * entry equal to the current stamp.
     *
     * Mapped nodes are not removed from their terminal sets; consumers test
     * `core1[i] === -1` (or `core2[j] === -1`) in addition to the stamp.
     */
    in1: number[];
    out1: number[];
    in2: number[];
    out2: number[];
    /** Pattern->target mappings pinned by `partialMapping`. -1 = free. */
    fixed: number[];
    isLabeled: boolean;
    isEdgeLabeled: boolean;
    nodeWild: Set<number>;
    edgeWild: Set<string>;
    /** Pre-computed degrees. Naming follows UllmannGraphMatcher's row/col convention. */
    pIn: number[];
    pOut: number[];
    tIn: number[];
    tOut: number[];
}
/**
 * Shared scaffolding for VF2-family subgraph isomorphism matchers.
 *
 * Owns the backtracking driver, the terminal-set bookkeeping (in1 / out1 /
 * in2 / out2 with depth-of-insertion stamps), the candidate enumeration,
 * and a default feasibility check that covers VF2's two pruning layers:
 *
 *   1. Consistency (R_pred / R_succ): every edge between `pn` and an
 *      already-mapped pattern node must be mirrored on the target side
 *      with the same edge label (modulo wildcards).
 *
 *   2. Structural look-ahead (R_in / R_out / R_new): six counting buckets
 *      indexed by (edge direction × terminal-set region). For subgraph
 *      monomorphism, pattern counts must not exceed target counts.
 *
 * Subclasses plug in two pieces:
 *
 *   - `createContext()`: how to initialize per-search state. The base
 *     produces a `VF2SearchContext`; a subclass returns either that or an
 *     extended context with extra fields.
 *   - `selectPatternNode()`: how to pick the next pattern node at each
 *     recursion depth.
 *
 * Subclasses may also override `isFeasiblePair()` to add extra pruning
 * layers on top of the default two (VF2++ does this to add a label-aware
 * cutting rule).
 */
export declare abstract class VF2BaseGraphMatcher<TCtx extends VF2SearchContext = VF2SearchContext> extends GraphMatcher {
    isSubgraphIsomorphic(pattern: Graph, target: Graph, nodeLabelWildcards?: number[], edgeLabelWildcards?: string[], partialMapping?: number[] | null): boolean;
    findAllSubgraphMonomorphisms(pattern: Graph, target: Graph, nodeLabelWildcards?: number[], edgeLabelWildcards?: string[], partialMapping?: number[] | null): Mapping[];
    /**
     * Hook: build the per-search context for the concrete variant. VF2 just
     * returns `base`. VF2++ wraps it with the precomputed processing order.
     */
    protected abstract createContext(base: VF2SearchContext): TCtx;
    /**
     * Hook: pick the next pattern node to extend the mapping at this depth.
     * `depth` equals the number of pairs already committed (= the index of
     * the slot we are about to fill).
     */
    protected abstract selectPatternNode(ctx: TCtx, depth: number): number;
    private search;
    /**
     * Build the candidate target-node set for `pn`:
     *   - If `pn` is pinned via `fixed`, the only candidate is that target.
     *   - If `pn` sits in some terminal set, candidates are restricted to
     *     the matching target terminal set (mirror of the mapped frontier).
     *   - Otherwise (first node in a connected component, etc.), every
     *     unmapped target node is a candidate.
     */
    private gatherCandidates;
    /**
     * Default VF2 feasibility check: consistency (layer 1) + structural
     * look-ahead (layer 2). Subclasses may override to add more layers
     * before/after; the convention is to call `super.isFeasiblePair(...)`
     * first so the cheap layers run before the expensive ones.
     */
    protected isFeasiblePair(ctx: TCtx, pn: number, tn: number): boolean;
    /**
     * After committing `node` to the mapping, mark every unmapped neighbor
     * with the current insertion stamp. Out-neighbors join the "out" set,
     * in-neighbors join the "in" set. For undirected graphs both sets end
     * up identical.
     */
    private extendTerminals;
    /**
     * Undo `extendTerminals` for one recursion frame by zeroing every entry
     * whose insertion stamp matches `stamp`. Older insertions are untouched.
     */
    private rollbackStamp;
    /**
     * Row-sum / column-sum degree precomputation. Naming follows
     * UllmannGraphMatcher (row-sum is "in", col-sum is "out") so both files
     * reject the same candidate pairs at the cheap degree-filter step.
     */
    private getDegrees;
}
