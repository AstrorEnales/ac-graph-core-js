import { Mapping } from '.';
import { Graph } from '..';
import { GraphMatcher } from './GraphMatcher';
export declare class UllmannGraphMatcher extends GraphMatcher {
    /**
     * Subgraph isomorphism check
     * @param pattern Pattern graph adjacency matrix
     * @param target Target graph adjacency matrix
     */
    isSubgraphIsomorphic(pattern: Graph, target: Graph): boolean;
    /**
     * Collect all possible monomorphisms of the pattern graph in the target graph
     * including symmetries
     * @param pattern Pattern graph adjacency matrix
     * @param target Target graph adjacency matrix
     */
    findAllSubgraphMonomorphisms(pattern: Graph, target: Graph): Mapping[];
    /**
     * Feasibility check for current depth: preserve pattern edges
     * and edge labels if present
     */
    private isFeasible;
    /**
     * Verifies full structural consistency of the mapping
     */
    private checkCompatibility;
}
