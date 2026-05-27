import {Mapping} from '.';
import {Graph} from '..';
import {GraphMatcher} from './GraphMatcher';

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
export abstract class VF2BaseGraphMatcher<
	TCtx extends VF2SearchContext = VF2SearchContext,
> extends GraphMatcher {
	public override isSubgraphIsomorphic(
		pattern: Graph,
		target: Graph,
		nodeLabelWildcards: number[] = [],
		edgeLabelWildcards: string[] = [],
		partialMapping: number[] | null = null
	): boolean {
		let found = false;
		this.search(
			pattern,
			target,
			nodeLabelWildcards,
			edgeLabelWildcards,
			partialMapping,
			() => {
				found = true;
				return true;
			}
		);
		return found;
	}

	public override findAllSubgraphMonomorphisms(
		pattern: Graph,
		target: Graph,
		nodeLabelWildcards: number[] = [],
		edgeLabelWildcards: string[] = [],
		partialMapping: number[] | null = null
	): Mapping[] {
		const results: Mapping[] = [];
		this.search(
			pattern,
			target,
			nodeLabelWildcards,
			edgeLabelWildcards,
			partialMapping,
			(mapping) => {
				results.push([...mapping]);
				return false;
			}
		);
		return results;
	}

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

	private search(
		pattern: Graph,
		target: Graph,
		nodeLabelWildcards: number[],
		edgeLabelWildcards: string[],
		partialMapping: number[] | null,
		onMatch: (mapping: Mapping) => boolean
	): void {
		const n = pattern.adjacencyMatrix.length;
		const m = target.adjacencyMatrix.length;
		if (n > m) {
			return;
		}

		const [pIn, pOut, tIn, tOut] = this.getDegrees(pattern, target);

		const baseCtx: VF2SearchContext = {
			pattern,
			target,
			n,
			m,
			core1: new Array<number>(n).fill(-1),
			core2: new Array<number>(m).fill(-1),
			in1: new Array<number>(n).fill(0),
			out1: new Array<number>(n).fill(0),
			in2: new Array<number>(m).fill(0),
			out2: new Array<number>(m).fill(0),
			fixed: partialMapping ?? new Array<number>(n).fill(-1),
			isLabeled: !!(pattern.labels && target.labels),
			isEdgeLabeled: !!(pattern.edgeLabels && target.edgeLabels),
			nodeWild: new Set(nodeLabelWildcards),
			edgeWild: new Set(edgeLabelWildcards),
			pIn,
			pOut,
			tIn,
			tOut,
		};
		const ctx = this.createContext(baseCtx);

		const recurse = (depth: number): boolean => {
			if (depth === n) {
				return onMatch(ctx.core1);
			}

			const pn = this.selectPatternNode(ctx, depth);
			const candidates = this.gatherCandidates(ctx, pn);

			for (const tn of candidates) {
				if (ctx.tIn[tn] < ctx.pIn[pn] || ctx.tOut[tn] < ctx.pOut[pn]) {
					continue;
				}
				if (
					ctx.isLabeled &&
					!ctx.nodeWild.has(pn) &&
					ctx.pattern.labels![pn] !== ctx.target.labels![tn]
				) {
					continue;
				}
				if (!this.isFeasiblePair(ctx, pn, tn)) {
					continue;
				}

				ctx.core1[pn] = tn;
				ctx.core2[tn] = pn;
				const stamp = depth + 1;
				this.extendTerminals(ctx.pattern, pn, ctx.in1, ctx.out1, stamp);
				this.extendTerminals(ctx.target, tn, ctx.in2, ctx.out2, stamp);

				if (recurse(depth + 1)) {
					return true;
				}

				ctx.core1[pn] = -1;
				ctx.core2[tn] = -1;
				this.rollbackStamp(ctx.in1, stamp);
				this.rollbackStamp(ctx.out1, stamp);
				this.rollbackStamp(ctx.in2, stamp);
				this.rollbackStamp(ctx.out2, stamp);
			}
			return false;
		};

		recurse(0);
	}

	/**
	 * Build the candidate target-node set for `pn`:
	 *   - If `pn` is pinned via `fixed`, the only candidate is that target.
	 *   - If `pn` sits in some terminal set, candidates are restricted to
	 *     the matching target terminal set (mirror of the mapped frontier).
	 *   - Otherwise (first node in a connected component, etc.), every
	 *     unmapped target node is a candidate.
	 */
	private gatherCandidates(ctx: TCtx, pn: number): number[] {
		const candidates: number[] = [];
		if (ctx.fixed[pn] !== -1) {
			if (ctx.core2[ctx.fixed[pn]] === -1) {
				candidates.push(ctx.fixed[pn]);
			}
			return candidates;
		}
		const inT1 = ctx.in1[pn] > 0;
		const outT1 = ctx.out1[pn] > 0;
		if (inT1 || outT1) {
			for (let j = 0; j < ctx.m; j++) {
				if (ctx.core2[j] !== -1) {
					continue;
				}
				if (outT1 && ctx.out2[j] === 0) {
					continue;
				}
				if (inT1 && ctx.in2[j] === 0) {
					continue;
				}
				candidates.push(j);
			}
		} else {
			for (let j = 0; j < ctx.m; j++) {
				if (ctx.core2[j] === -1) {
					candidates.push(j);
				}
			}
		}
		return candidates;
	}

	/**
	 * Default VF2 feasibility check: consistency (layer 1) + structural
	 * look-ahead (layer 2). Subclasses may override to add more layers
	 * before/after; the convention is to call `super.isFeasiblePair(...)`
	 * first so the cheap layers run before the expensive ones.
	 */
	protected isFeasiblePair(ctx: TCtx, pn: number, tn: number): boolean {
		const {pattern, target, core1, core2, in1, out1, in2, out2} = ctx;
		const {n, m, isEdgeLabeled, edgeWild} = ctx;
		const pAdj = pattern.adjacencyMatrix;
		const tAdj = target.adjacencyMatrix;

		// --- Layer 1: consistency with previously-mapped pattern nodes.
		for (let i = 0; i < n; i++) {
			const ti = core1[i];
			if (ti === -1) {
				continue;
			}
			if (pAdj[pn][i]) {
				if (!tAdj[tn][ti]) {
					return false;
				}
				if (
					isEdgeLabeled &&
					!edgeWild.has(pn + ',' + i) &&
					pattern.edgeLabels![pn][i] !== target.edgeLabels![tn][ti]
				) {
					return false;
				}
			}
			if (pAdj[i][pn]) {
				if (!tAdj[ti][tn]) {
					return false;
				}
				if (
					isEdgeLabeled &&
					!edgeWild.has(i + ',' + pn) &&
					pattern.edgeLabels![i][pn] !== target.edgeLabels![ti][tn]
				) {
					return false;
				}
			}
		}

		// --- Layer 2: structural look-ahead (6 buckets per side).
		let pOutInTOut = 0;
		let pOutInTIn = 0;
		let pOutNew = 0;
		let pInInTOut = 0;
		let pInInTIn = 0;
		let pInNew = 0;
		for (let i = 0; i < n; i++) {
			if (i === pn || core1[i] !== -1) {
				continue;
			}
			const isOutN = !!pAdj[pn][i];
			const isInN = !!pAdj[i][pn];
			if (!isOutN && !isInN) {
				continue;
			}
			const inTout = out1[i] > 0;
			const inTin = in1[i] > 0;
			if (isOutN) {
				if (inTout) {
					pOutInTOut++;
				}
				if (inTin) {
					pOutInTIn++;
				}
				if (!inTout && !inTin) {
					pOutNew++;
				}
			}
			if (isInN) {
				if (inTout) {
					pInInTOut++;
				}
				if (inTin) {
					pInInTIn++;
				}
				if (!inTout && !inTin) {
					pInNew++;
				}
			}
		}
		let tOutInTOut = 0;
		let tOutInTIn = 0;
		let tOutNew = 0;
		let tInInTOut = 0;
		let tInInTIn = 0;
		let tInNew = 0;
		for (let j = 0; j < m; j++) {
			if (j === tn || core2[j] !== -1) {
				continue;
			}
			const isOutN = !!tAdj[tn][j];
			const isInN = !!tAdj[j][tn];
			if (!isOutN && !isInN) {
				continue;
			}
			const inTout = out2[j] > 0;
			const inTin = in2[j] > 0;
			if (isOutN) {
				if (inTout) {
					tOutInTOut++;
				}
				if (inTin) {
					tOutInTIn++;
				}
				if (!inTout && !inTin) {
					tOutNew++;
				}
			}
			if (isInN) {
				if (inTout) {
					tInInTOut++;
				}
				if (inTin) {
					tInInTIn++;
				}
				if (!inTout && !inTin) {
					tInNew++;
				}
			}
		}
		return (
			pOutInTOut <= tOutInTOut &&
			pOutInTIn <= tOutInTIn &&
			pOutNew <= tOutNew &&
			pInInTOut <= tInInTOut &&
			pInInTIn <= tInInTIn &&
			pInNew <= tInNew
		);
	}

	/**
	 * After committing `node` to the mapping, mark every unmapped neighbor
	 * with the current insertion stamp. Out-neighbors join the "out" set,
	 * in-neighbors join the "in" set. For undirected graphs both sets end
	 * up identical.
	 */
	private extendTerminals(
		graph: Graph,
		node: number,
		inSet: number[],
		outSet: number[],
		stamp: number
	): void {
		const adj = graph.adjacencyMatrix;
		const k = adj.length;
		for (let j = 0; j < k; j++) {
			if (adj[node][j] && outSet[j] === 0) {
				outSet[j] = stamp;
			}
			if (adj[j][node] && inSet[j] === 0) {
				inSet[j] = stamp;
			}
		}
	}

	/**
	 * Undo `extendTerminals` for one recursion frame by zeroing every entry
	 * whose insertion stamp matches `stamp`. Older insertions are untouched.
	 */
	private rollbackStamp(arr: number[], stamp: number): void {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === stamp) {
				arr[i] = 0;
			}
		}
	}

	/**
	 * Row-sum / column-sum degree precomputation. Naming follows
	 * UllmannGraphMatcher (row-sum is "in", col-sum is "out") so both files
	 * reject the same candidate pairs at the cheap degree-filter step.
	 */
	private getDegrees(
		pattern: Graph,
		target: Graph
	): [number[], number[], number[], number[]] {
		const pIn = pattern.adjacencyMatrix.map((r) =>
			r.reduce((a, b) => a + b, 0)
		);
		const tIn = target.adjacencyMatrix.map((r) => r.reduce((a, b) => a + b, 0));
		const pOut: number[] = [];
		const tOut: number[] = [];
		pattern.adjacencyMatrix.forEach((row, i) => {
			pOut.push(
				row
					.map((_, j) => pattern.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		});
		target.adjacencyMatrix.forEach((row, i) => {
			tOut.push(
				row
					.map((_, j) => target.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		});
		return [pIn, pOut, tIn, tOut];
	}
}
