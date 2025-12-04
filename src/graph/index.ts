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

export class Automorphism {
	public static readonly Identity = new Automorphism([]);

	public readonly mappings: [number, number][];

	constructor(mappings: [number, number][]) {
		this.mappings = mappings;
	}

	public apply(g: number): number {
		for (const mapping of this.mappings) {
			if (mapping[0] === g) {
				return mapping[1];
			}
			if (mapping[1] === g) {
				return mapping[0];
			}
		}
		return g;
	}

	public toString(): string {
		return this.mappings.map((m) => `(${m[0]} ${m[1]})`).join('');
	}
}

export class AutomorphismGroup {
	public readonly generators: Automorphism[];

	constructor(generators: Automorphism[]) {
		this.generators = [Automorphism.Identity, ...generators];
	}

	public orbitOf(g: number): number[] {
		const orbit = new Set<number>();
		orbit.add(g);
		for (const aut of this.generators) {
			orbit.add(aut.apply(g));
		}
		return Array.from(orbit).sort();
	}

	public stabilizerOf(g: number): Automorphism[] {
		return this.generators.filter((aut) => aut.apply(g) === g);
	}

	public stabilizerSizeOf(g: number): number {
		return this.generators.reduce(
			(c, aut) => (c += aut.apply(g) === g ? 1 : 0),
			0
		);
	}

	/**
	 * Orbit size of g via Orbit–Stabilizer Theorem.
	 */
	public orbitSizeOf(g: number): number {
		return this.generators.length / this.stabilizerSizeOf(g);
	}

	public orbits(G: number[]): number[][] {
		const seen = new Set<number>();
		const orbits: number[][] = [];
		for (const g of G) {
			if (!seen.has(g)) {
				const orb = this.orbitOf(g);
				orb.forEach((x) => seen.add(x));
				orbits.push(orb);
			}
		}
		return orbits;
	}

	public toString(): string {
		return '[' + this.generators.map((g) => g.toString()).join(', ') + ']';
	}
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
