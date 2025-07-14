import {Graph} from '..';
import {Mapping} from '../matching';

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
export class GraphCanon {
	public static readonly DefaultNodeKeySuffixGenerator = (
		graph: Graph,
		nodeIndex: number
	): string => {
		return graph.labels ? graph.labels[nodeIndex] : '';
	};

	private readonly nodeCount: number;
	private readonly hasNodeLabels: boolean;
	private readonly hasEdgeLabels: boolean;
	private readonly graph: Graph;
	private readonly nodeNeighbors = new Map<number, number[]>();
	private readonly nodeKeys = new Map<number, string>();
	private readonly inDegrees = new Map<number, number>();
	private readonly outDegrees = new Map<number, number>();

	public constructor(
		graph: Graph,
		nodeKeySuffixGenerator: {
			(graph: Graph, nodeIndex: number): string;
		} = GraphCanon.DefaultNodeKeySuffixGenerator
	) {
		this.graph = graph;
		this.nodeCount = graph.adjacencyMatrix.length;
		this.hasNodeLabels = graph.labels !== undefined;
		this.hasEdgeLabels = graph.edgeLabels !== undefined;
		for (let i = 0; i < this.nodeCount; i++) {
			const neighbors = new Set<number>();
			let inDegree = 0;
			let outDegree = 0;
			for (let j = 0; j < this.nodeCount; j++) {
				if (graph.adjacencyMatrix[i][j] === 1) {
					outDegree++;
					neighbors.add(j);
				}
				if (graph.adjacencyMatrix[j][i] === 1) {
					inDegree++;
					neighbors.add(j);
				}
			}
			this.inDegrees.set(i, inDegree);
			this.outDegrees.set(i, outDegree);
			this.nodeNeighbors.set(i, [...neighbors]);
			const nodeKey =
				outDegree + '|' + inDegree + nodeKeySuffixGenerator(graph, i);
			this.nodeKeys.set(i, nodeKey);
		}
	}

	public canonicalize(): [Graph, string, Mapping] {
		const nodeCells = new Array(this.nodeCount).fill(1);
		this.partitionByPropertyKeys(nodeCells);
		let lexSmallestGraph: Graph | null = null;
		let lexSmallestMapping: Mapping | null = null;
		let lexSmallestGraphString: string | null = null;
		this.individualizeDFS(nodeCells, [], (repNodeCells, _repSuffix) => {
			// TODO: find automorphisms and prune search tree
			const repGraph = this.buildRepresentationGraph(repNodeCells);
			const repGraphString = this.buildGraphString(repGraph);
			if (
				lexSmallestGraphString === null ||
				repGraphString.localeCompare(lexSmallestGraphString) < 0
			) {
				lexSmallestGraph = repGraph;
				lexSmallestMapping = new Array(repNodeCells.length);
				repNodeCells.forEach((cell, i) => (lexSmallestMapping![cell] = i));
				lexSmallestGraphString = repGraphString;
			}
		});
		return [lexSmallestGraph!, lexSmallestGraphString!, lexSmallestMapping!];
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
		const cells = this.getCurrentCells(nodeCells);
		const cellToBreak = Array.from(cells.entries())
			.sort(([a], [b]) => a - b)
			.filter(([, nodes]) => nodes.length > 1)[0];
		for (const nodeId of cellToBreak[1]) {
			const newNodeCells = [...nodeCells];
			cellToBreak[1].forEach((n) => {
				if (n !== nodeId) {
					newNodeCells[n] = cellToBreak[0] + 1;
				}
			});
			this.individualizeDFS(
				newNodeCells,
				[...suffix, nodeId],
				handleRepresentation
			);
		}
	}

	private individualizationRefinement(nodeCells: number[]) {
		let isEquitable = false;
		while (!isEquitable) {
			isEquitable = true;
			// Build signature for each node
			const signatures: [string, number][] = nodeCells.map((_, i) => {
				const neighborCells = this.nodeNeighbors.get(i)!.map((n) => {
					let cellInfo = nodeCells[n].toString();
					if (this.hasEdgeLabels) {
						cellInfo +=
							';' +
							this.graph.edgeLabels![i][n] +
							';' +
							this.graph.edgeLabels![n][i];
					}
					return cellInfo;
				});
				const signature = neighborCells.sort().join('|');
				return [signature, i];
			});
			// Group by current cell and signature
			const partitionMap = new Map<number, Map<string, number[]>>();
			for (const [signature, nodeIndex] of signatures) {
				const cell = nodeCells[nodeIndex];
				if (!partitionMap.has(cell)) {
					partitionMap.set(cell, new Map());
				}
				const cellMap = partitionMap.get(cell)!;
				if (!cellMap.has(signature)) {
					cellMap.set(signature, []);
				}
				cellMap.get(signature)!.push(nodeIndex);
			}
			// Partition cells based on signature blocks
			const cellIds = Array.from(partitionMap.keys()).sort();
			for (const cellId of cellIds) {
				const blocks = Array.from(partitionMap.get(cellId)!.entries());
				if (blocks.length > 1) {
					isEquitable = false;
					// Sort block signatures descending
					blocks.sort(([sigA], [sigB]) => sigB.localeCompare(sigA));
					let newCellId = cellId;
					blocks.forEach(([, nodes]) => {
						nodes.forEach((n) => (nodeCells[n] = newCellId));
						newCellId += nodes.length;
					});
					break;
				}
			}
		}
	}

	private getCurrentCells(nodeCells: number[]): Map<number, number[]> {
		const cells = new Map<number, number[]>();
		nodeCells.forEach((c, i) => {
			if (cells.has(c)) {
				cells.get(c)!.push(i);
			} else {
				cells.set(c, [i]);
			}
		});
		return cells;
	}

	/*private getCellsString(nodeCells: number[]): string {
		const cells = this.getCurrentCells(nodeCells);
		const cellIds = Array.from(cells.keys()).sort();
		let text = '[';
		for (const cellId of cellIds) {
			const nodeIds = Array.from(cells.get(cellId)!.values()).sort();
			if (text.length > 1) {
				text += '|';
			}
			text += nodeIds.join(' ');
		}
		return text + ']';
	}*/

	private buildRepresentationGraph(nodeCells: number[]): Graph {
		const graph: Graph = {
			adjacencyMatrix: Array.from(
				{length: this.nodeCount},
				() => new Array(this.nodeCount)
			),
		};
		for (let i = 0; i < this.nodeCount; i++) {
			for (let j = 0; j < this.nodeCount; j++) {
				graph.adjacencyMatrix[nodeCells[i] - 1][nodeCells[j] - 1] =
					this.graph.adjacencyMatrix[i][j];
			}
		}
		if (this.hasNodeLabels) {
			graph.labels = new Array(this.nodeCount);
			nodeCells.forEach(
				(c, i) => (graph.labels![c - 1] = this.graph.labels![i])
			);
		}
		if (this.hasEdgeLabels) {
			graph.edgeLabels = Array.from(
				{length: this.nodeCount},
				() => new Array(this.nodeCount)
			);
			for (let i = 0; i < this.nodeCount; i++) {
				for (let j = 0; j < this.nodeCount; j++) {
					graph.edgeLabels[nodeCells[i] - 1][nodeCells[j] - 1] =
						this.graph.edgeLabels![i][j];
				}
			}
		}
		return graph;
	}

	public buildGraphString(graph: Graph): string {
		const edges: string[] = [];
		for (let i = 0; i < this.nodeCount; i++) {
			for (let j = 0; j < this.nodeCount; j++) {
				if (graph.adjacencyMatrix[i][j] === 1) {
					if (this.hasEdgeLabels) {
						edges.push(i + '-' + graph.edgeLabels![i][j] + '-' + j);
					} else {
						edges.push(i + '-' + j);
					}
				}
			}
		}
		if (this.hasNodeLabels) {
			return edges.join('|') + ';' + graph.labels!.join('|');
		}
		return edges.join('|');
	}
}
