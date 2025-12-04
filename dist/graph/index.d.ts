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
export declare class Automorphism {
    static readonly Identity: Automorphism;
    readonly mappings: [number, number][];
    constructor(mappings: [number, number][]);
    apply(g: number): number;
    toString(): string;
}
export declare class AutomorphismGroup {
    readonly generators: Automorphism[];
    constructor(generators: Automorphism[]);
    orbitOf(g: number): number[];
    stabilizerOf(g: number): Automorphism[];
    stabilizerSizeOf(g: number): number;
    /**
     * Orbit size of g via Orbit–Stabilizer Theorem.
     */
    orbitSizeOf(g: number): number;
    orbits(G: number[]): number[][];
    toString(): string;
}
export declare function symmetricGraphToDIMACS(graph: Graph): string;
