import { Graph } from '..';
import { Mapping } from '../matching';
export type NodeKeySuffixGenerator = (graph: Graph, nodeIndex: number) => string;
export type NodePropertiesMapper = (graph: Graph, nodeIndex: number, nodeMapping: number[]) => Map<string, any> | undefined;
export type NodePropertiesCanonKeyMapper = (graph: Graph, nodeIndex: number) => string;
/**
 * Nauty graph canonicalization using the following graph properties
 * for ordering and selection:
 * - First, node cell membership is sorted ascending by "outDegree|inDegree|label?"
 * - Second, direct neighborhood cell memberships and optional edge labels are sorted
 *   ascending, concatenated, and used to further split cells.
 *   "neighborCell_1;outEdgeLabel_1?;inEdgeLabel_1?|neighborCell_2;outEdgeLabel_2?;inEdgeLabel_2?|..."
 *   New cell IDs of the split are assigned by descending key order.
 * - Target cell selection in the search tree is performed by selecting the leftmost (smallest) cell ID
 *   with at least two members.
 *
 * TODO:
 * - Automorphism detection
 * - Search tree pruning
 */
export declare class GraphCanon {
    static readonly DefaultNodeKeySuffixGenerator: NodeKeySuffixGenerator;
    static readonly DefaultNodePropertiesMapper: NodePropertiesMapper;
    static readonly DefaultNodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper;
    private readonly nodeCount;
    private readonly hasNodeLabels;
    private readonly hasNodeProperties;
    private readonly hasEdgeLabels;
    private readonly graph;
    private readonly nodeNeighbors;
    private readonly nodeKeys;
    private readonly inDegrees;
    private readonly outDegrees;
    private readonly nodePropertiesMapper;
    private readonly nodePropertiesCanonKeyMapper;
    constructor(graph: Graph, nodeKeySuffixGenerator?: NodeKeySuffixGenerator, nodePropertiesMapper?: NodePropertiesMapper, nodePropertiesCanonKeyMapper?: NodePropertiesCanonKeyMapper);
    canonicalize(): [Graph, string, Mapping];
    private partitionByPropertyKeys;
    private isCanon;
    private individualizeDFS;
    private individualizationRefinement;
    private getCurrentCells;
    private buildRepresentationGraph;
    buildGraphString(graph: Graph): string;
}
