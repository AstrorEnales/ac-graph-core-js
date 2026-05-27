import {Graph} from '..';
import {VF2BaseGraphMatcher, VF2SearchContext} from './VF2BaseGraphMatcher';

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
export class VF2PlusPlusGraphMatcher extends VF2BaseGraphMatcher<VF2PlusPlusSearchContext> {
	protected createContext(base: VF2SearchContext): VF2PlusPlusSearchContext {
		return {
			...base,
			order: this.computeOrder(base.pattern, base.target, base.nodeWild),
		};
	}

	protected selectPatternNode(
		ctx: VF2PlusPlusSearchContext,
		depth: number
	): number {
		return ctx.order[depth];
	}

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
	private computeOrder(
		pattern: Graph,
		target: Graph,
		nodeWild: Set<number>
	): number[] {
		const n = pattern.adjacencyMatrix.length;
		const m = target.adjacencyMatrix.length;

		// Total pattern degree (row + col). Monotone with edge count, which
		// is all the comparator needs.
		const deg = new Array<number>(n).fill(0);
		for (let i = 0; i < n; i++) {
			let d = 0;
			for (let j = 0; j < n; j++) {
				d += pattern.adjacencyMatrix[i][j] + pattern.adjacencyMatrix[j][i];
			}
			deg[i] = d;
		}

		const targetLabelCount = new Map<string, number>();
		if (target.labels) {
			for (const l of target.labels) {
				targetLabelCount.set(l, (targetLabelCount.get(l) ?? 0) + 1);
			}
		}
		const labelRarity = (i: number): number => {
			if (!pattern.labels || nodeWild.has(i)) {
				// Wildcard / unlabeled: no constraint. Score it as the
				// least-rare so genuinely-labeled nodes win ties.
				return m + 1;
			}
			return targetLabelCount.get(pattern.labels[i]) ?? 0;
		};

		const order: number[] = [];
		const visited = new Array<boolean>(n).fill(false);

		const connectionsToOrdered = (v: number): number => {
			let c = 0;
			for (const u of order) {
				if (pattern.adjacencyMatrix[v][u] || pattern.adjacencyMatrix[u][v]) {
					c++;
				}
			}
			return c;
		};

		const prefer = (a: number, b: number): number => {
			const ca = connectionsToOrdered(a);
			const cb = connectionsToOrdered(b);
			if (ca !== cb) {
				return ca - cb;
			}
			if (deg[a] !== deg[b]) {
				return deg[a] - deg[b];
			}
			const ra = labelRarity(a);
			const rb = labelRarity(b);
			if (ra !== rb) {
				return rb - ra;
			}
			return b - a;
		};

		while (order.length < n) {
			let root = -1;
			for (let i = 0; i < n; i++) {
				if (visited[i]) {
					continue;
				}
				if (root === -1 || prefer(i, root) > 0) {
					root = i;
				}
			}
			if (root === -1) {
				break;
			}

			visited[root] = true;
			order.push(root);

			let currentLevel = [root];
			while (currentLevel.length > 0) {
				const nextLevelSet = new Set<number>();
				for (const u of currentLevel) {
					for (let v = 0; v < n; v++) {
						if (
							!visited[v] &&
							(pattern.adjacencyMatrix[u][v] || pattern.adjacencyMatrix[v][u])
						) {
							nextLevelSet.add(v);
						}
					}
				}
				if (nextLevelSet.size === 0) {
					break;
				}

				const remaining = new Set(nextLevelSet);
				const added: number[] = [];
				while (remaining.size > 0) {
					let best = -1;
					for (const v of remaining) {
						if (best === -1 || prefer(v, best) > 0) {
							best = v;
						}
					}
					remaining.delete(best);
					visited[best] = true;
					order.push(best);
					added.push(best);
				}
				currentLevel = added;
			}
		}

		return order;
	}

	/**
	 * VF2++'s addition: a label-aware look-ahead layer on top of the base's
	 * consistency + structural look-ahead. Pattern non-wildcard neighbors
	 * are bucketed by label, target neighbors of `tn` likewise; we then
	 * require pattern[L] <= target[L] for every label L that appears in the
	 * pattern bucket. Wildcards skip the check (they can match any label,
	 * and the structural total bound is already enforced upstream).
	 */
	protected override isFeasiblePair(
		ctx: VF2PlusPlusSearchContext,
		pn: number,
		tn: number
	): boolean {
		if (!super.isFeasiblePair(ctx, pn, tn)) {
			return false;
		}
		if (!ctx.isLabeled) {
			return true;
		}

		const {pattern, target, core1, core2, n, m, nodeWild} = ctx;
		const pAdj = pattern.adjacencyMatrix;
		const tAdj = target.adjacencyMatrix;

		const pLabelCounts = new Map<string, number>();
		for (let i = 0; i < n; i++) {
			if (i === pn || core1[i] !== -1) {
				continue;
			}
			if (!(pAdj[pn][i] || pAdj[i][pn])) {
				continue;
			}
			if (nodeWild.has(i)) {
				continue;
			}
			const label = pattern.labels![i];
			pLabelCounts.set(label, (pLabelCounts.get(label) ?? 0) + 1);
		}
		if (pLabelCounts.size === 0) {
			return true;
		}

		const tLabelCounts = new Map<string, number>();
		for (let j = 0; j < m; j++) {
			if (j === tn || core2[j] !== -1) {
				continue;
			}
			if (!(tAdj[tn][j] || tAdj[j][tn])) {
				continue;
			}
			const label = target.labels![j];
			tLabelCounts.set(label, (tLabelCounts.get(label) ?? 0) + 1);
		}
		for (const [label, pc] of pLabelCounts) {
			if ((tLabelCounts.get(label) ?? 0) < pc) {
				return false;
			}
		}
		return true;
	}
}
