import {Mapping} from '.';
import {Graph} from '..';
import {GraphMatcher} from './GraphMatcher';

export class UllmannGraphMatcher extends GraphMatcher {
	/**
	 * Subgraph isomorphism check
	 * @param pattern Pattern graph adjacency matrix
	 * @param target Target graph adjacency matrix
	 */
	public override isSubgraphIsomorphic(pattern: Graph, target: Graph): boolean {
		// Number of nodes in the pattern graph
		const n = pattern.adjacencyMatrix.length;
		// Number of nodes in the target graph
		const m = target.adjacencyMatrix.length;
		// If pattern is larger than target, no mapping is possible
		if (n > m) {
			return false;
		}
		const isLabeled = pattern.labels && target.labels;
		// Track which target nodes are already used in the mapping
		const used = Array(m).fill(false);
		const mapping = Array(n).fill(-1);
		// Pre-compute degrees for pattern and target nodes
		const patternInDegrees: number[] = [];
		const patternOutDegrees: number[] = [];
		const targetInDegrees: number[] = [];
		const targetOutDegrees: number[] = [];
		for (let i = 0; i < n; i++) {
			const row = pattern.adjacencyMatrix[i];
			patternInDegrees.push(row.reduce((a, b) => a + b, 0));
			patternOutDegrees.push(
				row
					.map((_, j) => pattern.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		}
		for (let i = 0; i < m; i++) {
			const row = target.adjacencyMatrix[i];
			targetInDegrees.push(row.reduce((a, b) => a + b, 0));
			targetOutDegrees.push(
				row
					.map((_, j) => target.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		}
		// Pre-compute candidate domains for pattern nodes based on degree
		const domains: number[][] = patternInDegrees.map((pd, i) =>
			targetInDegrees
				.map((td, j) => {
					return td >= pd &&
						targetOutDegrees[j] >= patternOutDegrees[i] &&
						(!isLabeled || pattern.labels![i] === target.labels![j])
						? j
						: -1;
				})
				.filter((j) => j !== -1)
		);
		// Recursive backtracking function to try all injective mappings
		const match = (depth: number): boolean => {
			if (depth === n) {
				return this.checkCompatibility(pattern, target, mapping);
			}
			for (const candidate of domains[depth]) {
				if (!used[candidate]) {
					mapping[depth] = candidate;
					used[candidate] = true;
					if (
						this.isFeasible(pattern, target, mapping, depth) &&
						match(depth + 1)
					) {
						return true;
					}
					// Backtrack
					used[candidate] = false;
					mapping[depth] = -1;
				}
			}
			return false;
		};
		return match(0);
	}

	/**
	 * Collect all possible monomorphisms of the pattern graph in the target graph
	 * including symmetries
	 * @param pattern Pattern graph adjacency matrix
	 * @param target Target graph adjacency matrix
	 */
	public override findAllSubgraphMonomorphisms(
		pattern: Graph,
		target: Graph
	): Mapping[] {
		const n = pattern.adjacencyMatrix.length;
		const m = target.adjacencyMatrix.length;
		const results: Mapping[] = [];
		if (n > m) {
			return results;
		}
		const isLabeled = pattern.labels && target.labels;
		const used = Array(m).fill(false);
		const mapping = Array(n).fill(-1);
		const patternInDegrees: number[] = [];
		const patternOutDegrees: number[] = [];
		const targetInDegrees: number[] = [];
		const targetOutDegrees: number[] = [];
		for (let i = 0; i < n; i++) {
			const row = pattern.adjacencyMatrix[i];
			patternInDegrees.push(row.reduce((a, b) => a + b, 0));
			patternOutDegrees.push(
				row
					.map((_, j) => pattern.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		}
		for (let i = 0; i < m; i++) {
			const row = target.adjacencyMatrix[i];
			targetInDegrees.push(row.reduce((a, b) => a + b, 0));
			targetOutDegrees.push(
				row
					.map((_, j) => target.adjacencyMatrix[j][i])
					.reduce((a, b) => a + b, 0)
			);
		}
		const domains: number[][] = patternInDegrees.map((pd, i) =>
			targetInDegrees
				.map((td, j) => {
					return td >= pd &&
						targetOutDegrees[j] >= patternOutDegrees[i] &&
						(!isLabeled || pattern.labels![i] === target.labels![j])
						? j
						: -1;
				})
				.filter((j) => j !== -1)
		);
		const match = (depth: number): void => {
			if (depth === n) {
				if (this.checkCompatibility(pattern, target, mapping)) {
					results.push([...mapping]);
				}
				return;
			}
			for (const candidate of domains[depth]) {
				if (!used[candidate]) {
					mapping[depth] = candidate;
					used[candidate] = true;
					if (this.isFeasible(pattern, target, mapping, depth)) {
						match(depth + 1);
					}
					used[candidate] = false;
					mapping[depth] = -1;
				}
			}
		};
		match(0);
		return results;
	}

	/**
	 * Feasibility check for current depth: preserve pattern edges
	 * and edge labels if present
	 */
	private isFeasible(
		pattern: Graph,
		target: Graph,
		mapping: Mapping,
		depth: number
	): boolean {
		const isEdgeLabeled = pattern.edgeLabels && target.edgeLabels;
		// Check that all edges in the current partial mapping are preserved
		for (let i = 0; i < depth; i++) {
			if (pattern.adjacencyMatrix[depth][i]) {
				if (!target.adjacencyMatrix[mapping[depth]][mapping[i]]) {
					return false;
				}
				// Check edge labels if present
				if (
					isEdgeLabeled &&
					pattern.edgeLabels![depth][i] !==
						target.edgeLabels![mapping[depth]][mapping[i]]
				) {
					return false;
				}
			}
			if (pattern.adjacencyMatrix[i][depth]) {
				if (!target.adjacencyMatrix[mapping[i]][mapping[depth]]) {
					return false;
				}
				// Check edge labels if present
				if (
					isEdgeLabeled &&
					pattern.edgeLabels![i][depth] !==
						target.edgeLabels![mapping[i]][mapping[depth]]
				) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Verifies full structural consistency of the mapping
	 */
	private checkCompatibility(
		pattern: Graph,
		target: Graph,
		mapping: Mapping
	): boolean {
		const isEdgeLabeled = pattern.edgeLabels && target.edgeLabels;
		const n = pattern.adjacencyMatrix.length;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (pattern.adjacencyMatrix[i][j]) {
					if (!target.adjacencyMatrix[mapping[i]][mapping[j]]) {
						// Mapped nodes don't preserve an edge
						return false;
					}
					if (
						isEdgeLabeled &&
						pattern.edgeLabels![i][j] !==
							target.edgeLabels![mapping[i]][mapping[j]]
					) {
						// Mapped nodes don't preserve an edge label
						return false;
					}
				}
			}
		}
		return true;
	}
}
