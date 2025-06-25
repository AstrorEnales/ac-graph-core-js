export * as matching from './matching';
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
     * Optional edge labels
     */
    edgeLabels?: string[][];
}
