import { Mapping } from '.';
import { Graph } from '..';
export declare abstract class GraphMatcher {
    abstract isSubgraphIsomorphic(pattern: Graph, target: Graph): boolean;
    abstract findAllSubgraphMonomorphisms(pattern: Graph, target: Graph): Mapping[];
}
