export * as matching from './matching';
export * as canon from './canon';
export * from './ConnectedComponents';

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

export type Automorphism = number[][];

export class AutomorphismGroup {
	public readonly generators: Automorphism[];

	constructor(generators: Automorphism[]) {
		this.generators = generators;
	}

	public orbits(): number[][] {
		const mappings = new Map<number, Set<number>>();
		for (const generator of this.generators) {
			for (const nodes of generator) {
				for (let i = 0; i < nodes.length; i++) {
					let s = mappings.get(nodes[i]);
					if (s === undefined) {
						s = new Set<number>();
						mappings.set(nodes[i], s);
					}
					for (let j = 0; j < nodes.length; j++) {
						if (i !== j) {
							s.add(nodes[j]);
						}
					}
				}
			}
		}
		const orbits = [];
		const visited = new Set<number>();
		for (const [key, nodes] of mappings.entries()) {
			if (!visited.has(key)) {
				visited.add(key);
				for (const node of nodes) {
					visited.add(node);
				}
				orbits.push([key, ...nodes].sort());
			}
		}
		return orbits;
	}

	public toString(): string {
		return (
			'gen[' +
			this.generators
				.map((g) => g.map((x) => '(' + x.join(' ') + ')').join(''))
				.join(', ') +
			'], orb[' +
			this.orbits()
				.map((x) => '{' + x.join(' ') + '}')
				.join(', ') +
			']'
		);
	}
}
