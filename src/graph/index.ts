export * as matching from './matching';
export * as canon from './canon';
export * from './ConnectedComponents';
export * from './Automorphism';

export interface Graph {
	/**
	 * N x N adjacency matrix of the graph. Must be symmetric if directed is true.
	 */
	adjacencyMatrix: number[][];
	/**
	 * Optional node labels
	 */
	labels?: string[];
	/**
	 * Optional node properties
	 */
	nodeProperties?: (Map<string, any> | undefined)[];
	/**
	 * Optional edge labels
	 */
	edgeLabels?: string[][];
}

export function symmetricGraphToDIMACS(graph: Graph): string {
	const n = graph.adjacencyMatrix.length;
	let edges: string[] = [];
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (graph.adjacencyMatrix[i][j] !== 0) {
				edges.push(`e ${i + 1} ${j + 1}`);
			}
		}
	}
	return [`p edge ${n} ${edges.length}`, ...edges].join('\n');
}
