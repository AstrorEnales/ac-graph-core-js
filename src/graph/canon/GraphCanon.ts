import {Graph} from '..';
import {Automorphism, AutomorphismGroup} from '../Automorphism';
import {Mapping} from '../matching';

export type NodeKeySuffixGenerator = (
	graph: Graph,
	nodeIndex: number
) => string;
export type NodePropertiesMapper = (
	graph: Graph,
	nodeIndex: number,
	nodeMapping: number[]
) => Map<string, any> | undefined;
export type NodeLabelCanonKeyMapper = (
	graph: Graph,
	nodeIndex: number
) => string;
export type EdgeLabelCanonKeyMapper = (
	graph: Graph,
	sourceNodeIndex: number,
	targetNodeIndex: number
) => string;
export type NodePropertiesCanonKeyMapper = (
	graph: Graph,
	nodeIndex: number
) => string;

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
 */
export class GraphCanon {
	public static readonly KEY_VERSION = 'v2';
	public static readonly DefaultNodeKeySuffixGenerator: NodeKeySuffixGenerator =
		(graph: Graph, nodeIndex: number) => {
			return graph.labels ? graph.labels[nodeIndex] : '';
		};
	public static readonly DefaultNodePropertiesMapper: NodePropertiesMapper = (
		graph: Graph,
		nodeIndex: number,
		_nodeMapping: number[]
	) => {
		return graph.nodeProperties && graph.nodeProperties[nodeIndex]
			? new Map(graph.nodeProperties[nodeIndex])
			: undefined;
	};
	public static readonly DefaultNodeLabelCanonKeyMapper: NodeLabelCanonKeyMapper =
		(graph: Graph, nodeIndex: number) => {
			return graph.labels ? graph.labels[nodeIndex] : '';
		};
	public static readonly DefaultEdgeLabelCanonKeyMapper: EdgeLabelCanonKeyMapper =
		(graph: Graph, sourceNodeIndex: number, targetNodeIndex: number) => {
			return graph.edgeLabels
				? graph.edgeLabels[sourceNodeIndex][targetNodeIndex]
				: '';
		};
	public static readonly DefaultNodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper =
		(_graph: Graph, _nodeIndex: number) => {
			return '';
		};

	private readonly nodeCount: number;
	private readonly hasNodeLabels: boolean;
	private readonly hasNodeProperties: boolean;
	private readonly hasEdgeLabels: boolean;
	private readonly isSymmetric: boolean;
	private readonly graph: Graph;
	private readonly nodeNeighbors: number[][];
	private readonly nodeNeighborEdgeSignatures: string[][];
	private readonly nodeKeys = new Map<number, string>();
	private readonly nodePropertiesMapper: NodePropertiesMapper;
	private readonly nodeLabelCanonKeyMapper: NodeLabelCanonKeyMapper;
	private readonly edgeLabelCanonKeyMapper: EdgeLabelCanonKeyMapper;
	private readonly nodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper;
	private readonly graphStringBuilder: (graph: Graph) => string;

	// public static timingsCanonicalize: number[] = [];
	// public static timingsIndividualizeDFS: number[] = [];
	// public static timingsIndividualizationRefinement: number[] = [];
	// public static timingsHandleRepresentation: number[] = [];

	public constructor(
		graph: Graph,
		nodeKeySuffixGenerator: NodeKeySuffixGenerator = GraphCanon.DefaultNodeKeySuffixGenerator,
		nodePropertiesMapper: NodePropertiesMapper = GraphCanon.DefaultNodePropertiesMapper,
		nodeLabelCanonKeyMapper: NodeLabelCanonKeyMapper = GraphCanon.DefaultNodeLabelCanonKeyMapper,
		edgeLabelCanonKeyMapper: EdgeLabelCanonKeyMapper = GraphCanon.DefaultEdgeLabelCanonKeyMapper,
		nodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper = GraphCanon.DefaultNodePropertiesCanonKeyMapper
	) {
		this.graph = graph;
		this.nodeCount = graph.adjacencyMatrix.length;
		this.nodeNeighbors = Array.from({length: this.nodeCount}, () => []);
		this.nodeNeighborEdgeSignatures = Array.from(
			{length: this.nodeCount},
			() => []
		);
		this.hasNodeLabels = graph.labels !== undefined;
		this.hasNodeProperties = graph.nodeProperties !== undefined;
		this.hasEdgeLabels = graph.edgeLabels !== undefined;
		this.nodePropertiesMapper = nodePropertiesMapper;
		this.nodeLabelCanonKeyMapper = nodeLabelCanonKeyMapper;
		this.edgeLabelCanonKeyMapper = edgeLabelCanonKeyMapper;
		this.nodePropertiesCanonKeyMapper = nodePropertiesCanonKeyMapper;
		let isSymmetric = true;
		for (let i = 0; i < this.nodeCount; i++) {
			const neighbors = this.nodeNeighbors[i];
			const neighborEdgeSignatures = this.nodeNeighborEdgeSignatures[i];
			let inDegree = 0;
			let outDegree = 0;
			for (let j = 0; j < this.nodeCount; j++) {
				const isOut = graph.adjacencyMatrix[i][j];
				const isIn = graph.adjacencyMatrix[j][i];
				if (isOut === 1) {
					outDegree++;
				}
				if (isIn === 1) {
					inDegree++;
				}
				if (isOut !== isIn) {
					isSymmetric = false;
				}
				if (isOut === 1 || isIn === 1) {
					neighbors.push(j);
				}
				if (this.hasEdgeLabels) {
					const edgeLabels = this.graph.edgeLabels!;
					if (edgeLabels[i][j] !== edgeLabels[j][i]) {
						neighborEdgeSignatures.push(
							`;${edgeLabels[i][j]};${edgeLabels[j][i]}`
						);
					} else {
						neighborEdgeSignatures.push(`;${edgeLabels[i][j]}`);
					}
				} else {
					neighborEdgeSignatures.push('');
				}
			}
			const nodeKey =
				outDegree + '|' + inDegree + '|' + nodeKeySuffixGenerator(graph, i);
			this.nodeKeys.set(i, nodeKey);
		}
		this.isSymmetric = isSymmetric;
		// Finally build the curried graph key function
		this.graphStringBuilder = this.buildGraphStringCurry();
	}

	/**
	 * Canonicalize the graph
	 * @returns
	 * 1. canonical graph representation
	 * 2. graph key
	 * 3. node mapping from the original to the canonical graph
	 * 4. automorphisms
	 */
	public canonicalize(): [Graph, string, Mapping, AutomorphismGroup] {
		// const start = performance.now();
		const nodeCells = new Array(this.nodeCount).fill(1);
		this.partitionByPropertyKeys(nodeCells);
		const partitions: Map<
			string,
			{
				partitions: number[][];
				automorphisms: Map<string, number[]>;
			}
		> = new Map();
		const prunedSubtrees = new Set<string>();
		const suffix = new Array(this.nodeCount).fill(-1);
		this.individualizeDFS(
			nodeCells,
			suffix,
			0,
			'',
			prunedSubtrees,
			this.handleRepresentationCurry(partitions, prunedSubtrees)
		);
		const lexSmallestKey = [...partitions.keys()].sort((a, b) =>
			a.localeCompare(b)
		)[0];
		const partition = partitions.get(lexSmallestKey)!;
		const smallestRepresentation = new Array(this.nodeCount);
		const lexSmallestMapping = new Array(smallestRepresentation.length);
		[...partition.partitions[0].entries()].forEach(([c, i]) => {
			smallestRepresentation[i] = c + 1;
			lexSmallestMapping[c] = i;
		});
		const lexSmallestGraph = this.buildRepresentationGraph(
			smallestRepresentation
		);
		const allAutomorphisms = new Map<string, number[]>();
		for (const p of partitions.values()) {
			for (const [key, aut] of p.automorphisms) {
				allAutomorphisms.set(key, aut);
			}
		}
		const canonGraphString = this.buildGraphString(lexSmallestGraph);
		const autGroup = new AutomorphismGroup(
			[...allAutomorphisms.values()].map((aut) => new Automorphism(aut)),
			this.nodeCount
		);
		// GraphCanon.timingsCanonicalize.push(performance.now() - start);
		return [lexSmallestGraph, canonGraphString, lexSmallestMapping, autGroup];
	}

	private handleRepresentationCurry(
		partitions: Map<
			string,
			{
				partitions: number[][];
				automorphisms: Map<string, number[]>;
			}
		>,
		prunedSubtrees: Set<string>
	): (nodeCells: number[], suffix: number[], suffixLength: number) => void {
		const cellIds = Array.from({length: this.nodeCount}, (_, i) => i);
		const buffer: number[] = [];
		const partitionKeyParts: string[] = new Array(this.nodeCount);

		return (repNodeCells, suffix, suffixLength) => {
			// const start = performance.now();
			// Build the partition key for comparison with other partitions
			const partition: number[] = new Array(this.nodeCount);
			for (let i = 0; i < this.nodeCount; i++) {
				partition[repNodeCells[i] - 1] = i;
			}
			for (let i = 0; i < cellIds.length; i++) {
				const c = cellIds[i];
				const neighbors = this.nodeNeighbors[partition[c]];
				buffer.length = neighbors.length;
				for (let j = 0; j < neighbors.length; j++) {
					buffer[j] = repNodeCells[neighbors[j]];
				}
				buffer.sort((a, b) => a - b);
				let str = '' + buffer[0];
				for (let j = 1; j < buffer.length; j++) {
					str += ';' + buffer[j];
				}
				partitionKeyParts[i] = str;
			}
			const partitionKey = partitionKeyParts.join('|');

			let sameRepresentations = partitions.get(partitionKey);
			if (sameRepresentations === undefined) {
				sameRepresentations = {
					partitions: [],
					automorphisms: new Map(),
				};
				partitions.set(partitionKey, sameRepresentations);
			}

			for (const partition of sameRepresentations.partitions) {
				const automorphism = new Array(this.nodeCount);
				for (let i = 0; i < this.nodeCount; i++) {
					automorphism[i] = partition[repNodeCells[i] - 1];
				}
				const key = automorphism.join('|');
				if (!sameRepresentations.automorphisms.has(key)) {
					sameRepresentations.automorphisms.set(key, automorphism);
					for (let s = 0; s < this.nodeCount; s++) {
						const t = automorphism[s];
						if (s === t) {
							continue;
						}
						for (let i = 0; i < suffixLength; i++) {
							if (suffix[i] === s) {
								if (i > 0) {
									prunedSubtrees.add(suffix.slice(0, i).join('|') + '|' + t);
								} else {
									prunedSubtrees.add(t.toString());
								}
							} else if (suffix[i] === t) {
								if (i > 0) {
									prunedSubtrees.add(suffix.slice(0, i).join('|') + '|' + s);
								} else {
									prunedSubtrees.add(s.toString());
								}
							}
						}
					}
				}
			}
			// Save the representation
			sameRepresentations.partitions.push(partition);
			// GraphCanon.timingsHandleRepresentation.push(performance.now() - start);
		};
	}

	/**
	 * Calculates only the automorphisms of the graph.
	 *
	 * Note: if any of the graph, graph key, or node mapping are needed as well,
	 * use the canonicalize() function.
	 */
	public aut(): AutomorphismGroup {
		const nodeCells = new Array(this.nodeCount).fill(1);
		this.partitionByPropertyKeys(nodeCells);
		const partitions: Map<
			string,
			{
				partitions: number[][];
				automorphisms: Map<string, number[]>;
			}
		> = new Map();
		const prunedSubtrees = new Set<string>();
		const suffix = new Array(this.nodeCount).fill(-1);
		this.individualizeDFS(
			nodeCells,
			suffix,
			0,
			'',
			prunedSubtrees,
			this.handleRepresentationCurry(partitions, prunedSubtrees)
		);
		const allAutomorphisms = new Map<string, number[]>();
		for (const p of partitions.values()) {
			for (const [key, aut] of p.automorphisms) {
				allAutomorphisms.set(key, aut);
			}
		}
		return new AutomorphismGroup(
			[...allAutomorphisms.values()].map((aut) => new Automorphism(aut)),
			this.nodeCount
		);
	}

	private partitionByPropertyKeys(nodeCells: number[]) {
		const propertyKeyNodeIndices = new Map<string, number[]>();
		for (let i = 0; i < this.nodeCount; i++) {
			const key = this.nodeKeys.get(i)!;
			if (propertyKeyNodeIndices.has(key)) {
				propertyKeyNodeIndices.get(key)!.push(i);
			} else {
				propertyKeyNodeIndices.set(key, [i]);
			}
		}
		let nextFreeCell = 1;
		Array.from(propertyKeyNodeIndices.keys())
			.sort((a, b) => a.localeCompare(b))
			.forEach((k) => {
				const nodesInNextCell = propertyKeyNodeIndices.get(k)!;
				nodesInNextCell.forEach((i) => (nodeCells[i] = nextFreeCell));
				nextFreeCell += nodesInNextCell.length;
			});
	}

	private isCanon(nodeCells: number[]): boolean {
		return new Set<number>(nodeCells).size === this.nodeCount;
	}

	private individualizeDFS(
		nodeCells: number[],
		suffix: number[],
		suffixLength: number,
		suffixKey: string,
		prunedSubtrees: Set<string>,
		handleRepresentation: (
			nodeCells: number[],
			suffix: number[],
			suffixLength: number
		) => void
	) {
		// const start = performance.now();
		if (this.isCanon(nodeCells)) {
			handleRepresentation(nodeCells, suffix, suffixLength);
			// GraphCanon.timingsIndividualizeDFS.push(performance.now() - start);
			return;
		}
		this.individualizationRefinement(nodeCells);
		if (this.isCanon(nodeCells)) {
			handleRepresentation(nodeCells, suffix, suffixLength);
			// GraphCanon.timingsIndividualizeDFS.push(performance.now() - start);
			return;
		}
		const [cellToBreak, nodes] = this.getCellToBreak(nodeCells);
		for (const n of nodes) {
			nodeCells[n] = cellToBreak + 1;
		}
		suffixLength++;
		for (const nodeId of nodes) {
			const nextSuffixKey = suffixKey + '|' + nodeId;
			// Check if subtree is pruned
			if (prunedSubtrees.has(nextSuffixKey)) {
				continue;
			}
			suffix[suffixLength] = nodeId;
			nodeCells[nodeId] = cellToBreak;
			this.individualizeDFS(
				[...nodeCells],
				suffix,
				suffixLength,
				nextSuffixKey,
				prunedSubtrees,
				handleRepresentation
			);
			nodeCells[nodeId] = cellToBreak + 1;
			suffix[suffixLength] = -1;
		}
		// GraphCanon.timingsIndividualizeDFS.push(performance.now() - start);
	}

	private individualizationRefinement(nodeCells: number[]) {
		// const start = performance.now();
		let isEquitable = false;
		while (!isEquitable) {
			isEquitable = true;
			// Build signature for each node and group by current cell and signature
			const partitionMap: Map<string, number[]>[] = new Array(
				nodeCells.length
			).fill(undefined);
			let lowestDuplicateCell = nodeCells.length + 1;
			for (let i = 0; i < nodeCells.length; i++) {
				const neighborEdgeSignatures = this.nodeNeighborEdgeSignatures[i];
				const signature = this.nodeNeighbors[i]
					.map((n) => nodeCells[n] + neighborEdgeSignatures[n])
					.sort()
					.join('|');
				const cell = nodeCells[i];
				const cellMap = partitionMap[cell];
				if (cellMap === undefined) {
					partitionMap[cell] = new Map([[signature, [i]]]);
				} else {
					const nodeIndices = cellMap.get(signature);
					if (nodeIndices === undefined) {
						cellMap.set(signature, [i]);
					} else {
						nodeIndices.push(i);
					}
					if (cellMap.size > 1) {
						isEquitable = false;
						if (cell < lowestDuplicateCell) {
							lowestDuplicateCell = cell;
						}
					}
				}
			}
			// Partition cells based on signature blocks
			if (!isEquitable) {
				const value = partitionMap[lowestDuplicateCell];
				// Sort block signatures descending
				const blocks = [...value.entries()].sort((a, b) =>
					b[0].localeCompare(a[0])
				);
				let newCellId = lowestDuplicateCell;
				for (const [_, nodes] of blocks) {
					for (let i = 0; i < nodes.length; i++) {
						nodeCells[nodes[i]] = newCellId;
					}
					newCellId += nodes.length;
				}
			}
		}
		// GraphCanon.timingsIndividualizationRefinement.push(
		// 	performance.now() - start
		// );
	}

	private getCellToBreak(nodeCells: number[]): [number, number[]] {
		let lowestDuplicateCellIndex = nodeCells.length;
		const cells: number[][] = new Array(nodeCells.length).fill(undefined);
		for (let i = 0; i < nodeCells.length; i++) {
			const c = nodeCells[i] - 1;
			if (c > lowestDuplicateCellIndex) {
				// We already found a smaller cell with multiple entries
				continue;
			}
			if (cells[c] === undefined) {
				cells[c] = [i];
			} else {
				cells[c].push(i);
				if (c < lowestDuplicateCellIndex) {
					lowestDuplicateCellIndex = c;
				}
			}
		}
		if (lowestDuplicateCellIndex !== nodeCells.length) {
			const cell = cells[lowestDuplicateCellIndex];
			if (cell !== undefined && cell.length > 1) {
				return [lowestDuplicateCellIndex + 1, cell];
			}
		}
		return [1, cells[0]];
	}

	private buildRepresentationGraph(nodeCells: number[]): Graph {
		const nodeMapping = nodeCells.map((c) => c - 1);
		const graph: Graph = {
			adjacencyMatrix: Array.from(
				{length: this.nodeCount},
				() => new Array(this.nodeCount)
			),
		};
		if (this.isSymmetric) {
			for (let i = 0; i < this.nodeCount; i++) {
				const mi = nodeMapping[i];
				const row = this.graph.adjacencyMatrix[i];
				for (let j = i; j < this.nodeCount; j++) {
					graph.adjacencyMatrix[mi][nodeMapping[j]] = row[j];
					graph.adjacencyMatrix[nodeMapping[j]][mi] = row[j];
				}
			}
		} else {
			for (let i = 0; i < this.nodeCount; i++) {
				const mi = nodeMapping[i];
				const row = this.graph.adjacencyMatrix[i];
				for (let j = 0; j < this.nodeCount; j++) {
					graph.adjacencyMatrix[mi][nodeMapping[j]] = row[j];
				}
			}
		}
		if (this.hasNodeLabels) {
			graph.labels = new Array(this.nodeCount);
			nodeMapping.forEach((c, i) => (graph.labels![c] = this.graph.labels![i]));
		}
		if (this.hasNodeProperties) {
			graph.nodeProperties = new Array(this.nodeCount);
			nodeMapping.forEach(
				(c, i) =>
					(graph.nodeProperties![c] = this.nodePropertiesMapper(
						this.graph,
						i,
						nodeMapping
					))
			);
		}
		if (this.hasEdgeLabels) {
			graph.edgeLabels = Array.from(
				{length: this.nodeCount},
				() => new Array(this.nodeCount)
			);
			if (this.isSymmetric) {
				for (let i = 0; i < this.nodeCount; i++) {
					const mi = nodeMapping[i];
					const row = this.graph.edgeLabels![i];
					for (let j = i; j < this.nodeCount; j++) {
						graph.edgeLabels[mi][nodeMapping[j]] = row[j];
						graph.edgeLabels[nodeMapping[j]][mi] = row[j];
					}
				}
			} else {
				for (let i = 0; i < this.nodeCount; i++) {
					const mi = nodeMapping[i];
					const row = this.graph.edgeLabels![i];
					for (let j = 0; j < this.nodeCount; j++) {
						graph.edgeLabels[mi][nodeMapping[j]] = row[j];
					}
				}
			}
		}
		return graph;
	}

	private buildGraphStringCurry() {
		const edgeCallback = this.hasEdgeLabels
			? (graph: Graph, i: number, j: number) =>
					`${i}-${this.edgeLabelCanonKeyMapper(graph, i, j)}-${j}`
			: (_: Graph, i: number, j: number) => `${i}-${j}`;
		const nodePropertyCallback = this.hasNodeProperties
			? (graph: Graph, i: number): string => {
					const nodePropertyCanonKey = this.nodePropertiesCanonKeyMapper(
						graph,
						i
					);
					return nodePropertyCanonKey.length > 0
						? `{${nodePropertyCanonKey}}`
						: '';
				}
			: (_graph: Graph, _i: number): string => '';
		const nodeCallback = this.hasNodeLabels
			? (graph: Graph): string =>
					';' +
					graph
						.labels!.map(
							(_, i) =>
								this.nodeLabelCanonKeyMapper(graph, i) +
								nodePropertyCallback(graph, i)
						)
						.join('|')
			: this.hasNodeProperties
				? (graph: Graph): string =>
						';' +
						graph
							.nodeProperties!.map((_, i) =>
								this.nodePropertiesCanonKeyMapper(graph, i)
							)
							.join('|')
				: (_: Graph): string => '';

		if (this.isSymmetric) {
			return (graph: Graph): string => {
				const edges = [];
				for (let i = 0; i < this.nodeCount; i++) {
					const row = graph.adjacencyMatrix[i];
					for (let j = i; j < this.nodeCount; j++) {
						if (row[j] === 1) {
							edges.push(edgeCallback(graph, i, j));
						}
					}
				}
				return (
					GraphCanon.KEY_VERSION +
					';' +
					graph.adjacencyMatrix.length +
					';sym;' +
					edges.join('|') +
					nodeCallback(graph)
				);
			};
		}
		return (graph: Graph): string => {
			const edges = [];
			for (let i = 0; i < this.nodeCount; i++) {
				const row = graph.adjacencyMatrix[i];
				for (let j = 0; j < this.nodeCount; j++) {
					if (row[j] === 1) {
						edges.push(edgeCallback(graph, i, j));
					}
				}
			}
			return (
				GraphCanon.KEY_VERSION +
				';' +
				graph.adjacencyMatrix.length +
				';' +
				edges.join('|') +
				nodeCallback(graph)
			);
		};
	}

	public buildGraphString(graph: Graph): string {
		return this.graphStringBuilder(graph);
	}
}
