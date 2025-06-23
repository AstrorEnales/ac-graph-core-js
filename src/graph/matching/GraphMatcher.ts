import {Mapping} from '.';
import {Graph} from '..';

export abstract class GraphMatcher {
	public abstract isSubgraphIsomorphic(pattern: Graph, target: Graph): boolean;

	public abstract findAllSubgraphMonomorphisms(
		pattern: Graph,
		target: Graph
	): Mapping[];
}
