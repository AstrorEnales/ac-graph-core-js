import { Mapping } from '.';
import { Graph } from '..';
import { GraphMatcher } from './GraphMatcher';
export declare class UllmannGraphMatcher extends GraphMatcher {
    /**
     * Subgraph isomorphism check
     * @param pattern Pattern graph adjacency matrix
     * @param target Target graph adjacency matrix
     * @param nodeLabelWildcards Indices of pattern nodes considered wildcards
     * for labelled graphs. Their label is ignored during validation.
     * @param edgeLabelWildcards Indices of pattern edges considered wildcards
     * for labelled graphs. Their label is ignored during validation. Encoded
     * as "sourceIndex + ',' + targetIndex".
     * @param partialMapping Partial mapping of pattern nodes in target to only
     * find solutions containing this mapping. The array needs to follow the
     * same format as the Mapping type. Nodes not fixed in the partial mapping
     * are represented by -1.
     */
    isSubgraphIsomorphic(pattern: Graph, target: Graph, nodeLabelWildcards?: number[], edgeLabelWildcards?: string[], partialMapping?: number[] | null): boolean;
    private getInOutDegrees;
    /**
     * Collect all possible monomorphisms of the pattern graph in the target graph
     * including symmetries
     * @param pattern Pattern graph adjacency matrix
     * @param target Target graph adjacency matrix
     * @param nodeLabelWildcards Indices of pattern nodes considered wildcards
     * for labelled graphs. Their label is ignored during validation.
     * @param edgeLabelWildcards Indices of pattern edges considered wildcards
     * for labelled graphs. Their label is ignored during validation. Encoded
     * as "sourceIndex + ',' + targetIndex".
     * @param partialMapping Partial mapping of pattern nodes in target to only
     * find solutions containing this mapping. The array needs to follow the
     * same format as the Mapping type. Nodes not fixed in the partial mapping
     * are represented by -1.
     */
    findAllSubgraphMonomorphisms(pattern: Graph, target: Graph, nodeLabelWildcards?: number[], edgeLabelWildcards?: string[], partialMapping?: number[] | null): Mapping[];
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
