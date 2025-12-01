import {Automorphism, AutomorphismGroup, Graph} from '..';
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
	private readonly nodeNeighbors = new Map<number, number[]>();
	private readonly nodeKeys = new Map<number, string>();
	private readonly nodePropertiesMapper: NodePropertiesMapper;
	private readonly nodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper;
	private readonly graphStringBuilder: (graph: Graph) => string;

	public constructor(
		graph: Graph,
		nodeKeySuffixGenerator: NodeKeySuffixGenerator = GraphCanon.DefaultNodeKeySuffixGenerator,
		nodePropertiesMapper: NodePropertiesMapper = GraphCanon.DefaultNodePropertiesMapper,
		nodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper = GraphCanon.DefaultNodePropertiesCanonKeyMapper
	) {
		this.graph = graph;
		this.nodeCount = graph.adjacencyMatrix.length;
		this.hasNodeLabels = graph.labels !== undefined;
		this.hasNodeProperties = graph.nodeProperties !== undefined;
		this.hasEdgeLabels = graph.edgeLabels !== undefined;
		this.nodePropertiesMapper = nodePropertiesMapper;
		this.nodePropertiesCanonKeyMapper = nodePropertiesCanonKeyMapper;
		let isSymmetric = true;
		for (let i = 0; i < this.nodeCount; i++) {
			const neighbors = new Set<number>();
			let inDegree = 0;
			let outDegree = 0;
			for (let j = 0; j < this.nodeCount; j++) {
				const isOut = graph.adjacencyMatrix[i][j];
				const isIn = graph.adjacencyMatrix[j][i];
				if (isOut === 1) {
					outDegree++;
					neighbors.add(j);
				}
				if (isIn === 1) {
					inDegree++;
					neighbors.add(j);
				}
				if (isOut !== isIn) {
					isSymmetric = false;
				}
			}
			this.nodeNeighbors.set(i, [...neighbors]);
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
		const nodeCells = new Array(this.nodeCount).fill(1);
		this.partitionByPropertyKeys(nodeCells);
		let lexSmallestGraph: Graph | null = null;
		let lexSmallestMapping: Mapping | null = null;
		let lexSmallestGraphString: string | null = null;

		const partitions: Map<number, number>[] = [];
		const automorphisms = new Map<string, Automorphism>();
		const automorphismGroups = Array.from(
			{length: this.nodeCount},
			(_) => new Set<number>()
		);
		const prunedSubtrees = new Set<number>();

		this.individualizeDFS(nodeCells, [], prunedSubtrees, (repNodeCells, _) => {
			for (const partition of partitions) {
				const automorphismMap = new Map<string, number[]>();
				for (let i = 0; i < repNodeCells.length; i++) {
					const partitionIndex = partition.get(repNodeCells[i])!;
					if (partitionIndex !== i) {
						const match = [
							partitionIndex < i ? partitionIndex : i,
							i < partitionIndex ? partitionIndex : i,
						];
						automorphismMap.set(match.join('|'), match);
					}
				}
				const automorphism = [...automorphismMap.values()];
				let changed = true;
				while (changed) {
					changed = false;
					for (let i = 0; i < automorphism.length; i++) {
						for (let j = i + 1; j < automorphism.length; j++) {
							if (automorphism[i].some((x) => automorphism[j].includes(x))) {
								automorphism[i] = Array.from(
									new Set([...automorphism[i], ...automorphism[j]])
								).sort();
								automorphism.splice(j, 1);
								changed = true;
								break;
							}
						}
					}
				}
				const automorphismKey = automorphism
					.map((x) => '(' + x.join(' ') + ')')
					.join('');
				automorphisms.set(automorphismKey, automorphism);
			}

			const partition = new Map<number, number>();
			repNodeCells.forEach((c, i) => partition.set(c, i));
			partitions.push(partition);

			for (let i = 0; i < repNodeCells.length; i++) {
				automorphismGroups[repNodeCells[i] - 1].add(i);
			}
			for (let i = 0; i < automorphismGroups.length; i++) {
				// Update pruned subtrees
				if (automorphismGroups[i].size > 1) {
					const group = [...automorphismGroups[i]].sort();
					for (let j = 1; j < group.length; j++) {
						prunedSubtrees.add(group[j]);
					}
				}
			}
			const repGraph = this.buildRepresentationGraph(repNodeCells);
			const repGraphString = this.buildGraphString(repGraph);
			if (
				lexSmallestGraphString === null ||
				repGraphString.localeCompare(lexSmallestGraphString) < 0
			) {
				lexSmallestGraph = repGraph;
				lexSmallestMapping = new Array(repNodeCells.length);
				repNodeCells.forEach((cell, i) => (lexSmallestMapping![cell - 1] = i));
				lexSmallestGraphString = repGraphString;
			}
		});

		return [
			lexSmallestGraph!,
			lexSmallestGraphString!,
			lexSmallestMapping!,
			new AutomorphismGroup([...automorphisms.values()]),
		];
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

		const partitions: Map<number, number>[] = [];
		const automorphisms = new Map<string, Automorphism>();
		const automorphismGroups = Array.from(
			{length: this.nodeCount},
			(_) => new Set<number>()
		);
		const prunedSubtrees = new Set<number>();

		this.individualizeDFS(nodeCells, [], prunedSubtrees, (repNodeCells, _) => {
			for (const partition of partitions) {
				const automorphismMap = new Map<string, number[]>();
				for (let i = 0; i < repNodeCells.length; i++) {
					const partitionIndex = partition.get(repNodeCells[i])!;
					if (partitionIndex !== i) {
						const match = [
							partitionIndex < i ? partitionIndex : i,
							i < partitionIndex ? partitionIndex : i,
						];
						automorphismMap.set(match.join('|'), match);
					}
				}
				const automorphism = [...automorphismMap.values()];
				let changed = true;
				while (changed) {
					changed = false;
					for (let i = 0; i < automorphism.length; i++) {
						for (let j = i + 1; j < automorphism.length; j++) {
							if (automorphism[i].some((x) => automorphism[j].includes(x))) {
								automorphism[i] = Array.from(
									new Set([...automorphism[i], ...automorphism[j]])
								).sort();
								automorphism.splice(j, 1);
								changed = true;
								break;
							}
						}
					}
				}
				const automorphismKey = automorphism
					.map((x) => '(' + x.join(' ') + ')')
					.join('');
				automorphisms.set(automorphismKey, automorphism);
			}

			const partition = new Map<number, number>();
			repNodeCells.forEach((c, i) => partition.set(c, i));
			partitions.push(partition);

			for (let i = 0; i < repNodeCells.length; i++) {
				automorphismGroups[repNodeCells[i] - 1].add(i);
			}
			for (let i = 0; i < automorphismGroups.length; i++) {
				// Update pruned subtrees
				if (automorphismGroups[i].size > 1) {
					const group = [...automorphismGroups[i]].sort();
					for (let j = 1; j < group.length; j++) {
						prunedSubtrees.add(group[j]);
					}
				}
			}
		});
		return new AutomorphismGroup([...automorphisms.values()]);
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
		prunedSubtrees: Set<number>,
		handleRepresentation: (nodeCells: number[], suffix: number[]) => void
	) {
		if (this.isCanon(nodeCells)) {
			handleRepresentation(nodeCells, suffix);
			return;
		}
		this.individualizationRefinement(nodeCells);
		if (this.isCanon(nodeCells)) {
			handleRepresentation(nodeCells, suffix);
			return;
		}
		const cellToBreak = this.getCellToBreak(nodeCells);
		for (const n of cellToBreak[1]) {
			nodeCells[n] = cellToBreak[0] + 1;
		}
		for (const nodeId of cellToBreak[1]) {
			// Check if subtree is pruned
			if (suffix.length === 0 && prunedSubtrees.has(nodeId)) {
				continue;
			}
			nodeCells[nodeId] = cellToBreak[0];
			this.individualizeDFS(
				[...nodeCells],
				[...suffix, nodeId],
				prunedSubtrees,
				handleRepresentation
			);
			nodeCells[nodeId] = cellToBreak[0] + 1;
		}
	}

	private individualizationRefinement(nodeCells: number[]) {
		let isEquitable = false;
		while (!isEquitable) {
			isEquitable = true;
			// Build signature for each node
			const signatures: string[] = nodeCells.map((_, i) => {
				const neighborCells = this.nodeNeighbors.get(i)!.map((n) => {
					if (this.hasEdgeLabels) {
						const edgeLabels = this.graph.edgeLabels!;
						if (this.isSymmetric) {
							return `${nodeCells[n]};${edgeLabels[i][n]}`;
						}
						return `${nodeCells[n]};${edgeLabels[i][n]};${edgeLabels[n][i]}`;
					}
					return nodeCells[n].toString();
				});
				return neighborCells.sort().join('|');
			});
			// Group by current cell and signature
			const partitionMap = new Map<number, Map<string, number[]>>();
			signatures.forEach((signature, nodeIndex) => {
				const cell = nodeCells[nodeIndex];
				let cellMap = partitionMap.get(cell);
				if (cellMap === undefined) {
					cellMap = new Map();
					partitionMap.set(cell, cellMap);
				}
				let nodeIndices = cellMap.get(signature);
				if (nodeIndices === undefined) {
					nodeIndices = [];
					cellMap.set(signature, nodeIndices);
				}
				nodeIndices.push(nodeIndex);
			});
			// Partition cells based on signature blocks
			for (let cellId = 1; cellId <= this.nodeCount; cellId++) {
				const value = partitionMap.get(cellId);
				if (value === undefined || value.size < 2) {
					continue;
				}
				isEquitable = false;
				// Sort block signatures descending
				const blockKeys = Array.from(value.keys()).sort((sigA, sigB) =>
					sigB.localeCompare(sigA)
				);
				let newCellId = cellId;
				for (const key of blockKeys) {
					const nodes = value.get(key)!;
					nodes.forEach((n) => (nodeCells[n] = newCellId));
					newCellId += nodes.length;
				}
				break;
			}
		}
	}

	private getCellToBreak(nodeCells: number[]): [number, number[]] {
		const cells: number[][] = Array.from({length: nodeCells.length}, () => []);
		nodeCells.forEach((c, i) => cells[c - 1].push(i));
		for (let i = 0; i < cells.length; i++) {
			if (cells[i].length > 1) {
				return [i + 1, cells[i]];
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
					`${i}-${graph.edgeLabels![i][j]}-${j}`
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
						.labels!.map((l, i) => l + nodePropertyCallback(graph, i))
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
				return edges.join('|') + nodeCallback(graph);
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
			return edges.join('|') + nodeCallback(graph);
		};
	}

	public buildGraphString(graph: Graph): string {
		return this.graphStringBuilder(graph);
	}
}
