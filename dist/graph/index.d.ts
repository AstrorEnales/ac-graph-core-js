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
export declare function symmetricGraphToDIMACS(graph: Graph): string;
