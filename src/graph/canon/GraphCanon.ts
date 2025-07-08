import {Graph} from '..';

export class GraphCanon {
	private readonly nodeCount: number;
	private readonly hasNodeLabels: boolean;
	private readonly hasEdgeLabels: boolean;
	private readonly graph: Graph;
	private readonly nodeNeighbors = new Map<number, number[]>();
	private readonly nodePropertyKeys = new Map<number, string>();
	private readonly inDegrees = new Map<number, number>();
	private readonly outDegrees = new Map<number, number>();

	public constructor(graph: Graph) {
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
					inDegree++;
					neighbors.add(j);
				}
				if (graph.adjacencyMatrix[j][i] === 1) {
					outDegree++;
					neighbors.add(j);
				}
			}
			this.inDegrees.set(i, inDegree);
			this.outDegrees.set(i, outDegree);
			this.nodeNeighbors.set(i, [...neighbors]);
			let propertiesKey = outDegree + '|' + inDegree;
			if (this.hasNodeLabels) {
				propertiesKey += '|' + graph.labels![i];
			}
			this.nodePropertyKeys.set(i, propertiesKey);
		}
	}

	public canonicalize() {
		const nodeCells = new Array(this.nodeCount).fill(1);
		this.refineByPropertyKeys(nodeCells);
		this.individualizeDFS(nodeCells, []);
	}

	private refineByPropertyKeys(nodeCells: number[]) {
		const assignedCells = new Map<string, number>();
		let nextFreeCell = 1;
		for (let i = 0; i < this.nodeCount; i++) {
			const key = this.nodePropertyKeys.get(i)!;
			if (!assignedCells.has(key)) {
				assignedCells.set(key, nextFreeCell);
				nextFreeCell++;
			}
			nodeCells[i] = assignedCells.get(key)!;
		}
	}

	private isCanon(nodeCells: number[]): boolean {
		return new Set<number>(nodeCells).size === this.nodeCount;
	}

	private individualizeDFS(nodeCells: number[], suffix: number[]) {
		if (this.isCanon(nodeCells)) {
			// TODO: find automorphisms and prune search tree
			return;
		}
		this.individualizationRefinement(nodeCells);
		if (this.isCanon(nodeCells)) {
			// TODO: find automorphisms and prune search tree
			return;
		}
		let newCell = 1;
		for (; newCell <= this.nodeCount; newCell++) {
			if (!nodeCells.includes(newCell)) {
				break;
			}
		}
		for (let targetCell = 1; targetCell <= this.nodeCount; targetCell++) {
			const nodesInCell = nodeCells
				.map((v, i) => [v, i])
				.filter(([v, _]) => v === targetCell)
				.map(([__dirname, i]) => i);
			if (nodesInCell.length > 1) {
				for (let i = 0; i < nodesInCell.length; i++) {
					const newNodeCells = [...nodeCells];
					newNodeCells[nodesInCell[i]] = newCell;
					this.individualizeDFS(newNodeCells, [...suffix, nodesInCell[i]]);
				}
			}
		}
	}

	private individualizationRefinement(nodeCells: number[]) {
		let isEquitable = false;
		while (!isEquitable) {
			isEquitable = true;
			const neighborCellKeys = nodeCells.map((_, i) =>
				this.nodeNeighbors
					.get(i)!
					.map(
						(n) =>
							nodeCells[n] +
							(this.hasEdgeLabels
								? ';' +
									this.graph.edgeLabels![i][n] +
									';' +
									this.graph.edgeLabels![n][i]
								: '')
					)
					.sort()
					.join('|')
			);
			// Search for nodes that can be individualized based on their neighbor cells
			for (let i = 0; i < this.nodeCount; i++) {
				const cell = nodeCells[i];
				const otherNodeIndices = nodeCells
					.map((c, j) => [c, j])
					.filter(([c, j]) => c === cell && j !== i)
					.map(([_, j]) => j);
				const otherNodeIndicesThatMatch = otherNodeIndices.filter(
					(j) => neighborCellKeys[j] === neighborCellKeys[i]
				);
				if (otherNodeIndices.length !== otherNodeIndicesThatMatch.length) {
					isEquitable = false;
					for (let c = 1; c <= this.nodeCount; c++) {
						if (!nodeCells.includes(c)) {
							otherNodeIndicesThatMatch.forEach((j) => (nodeCells[j] = c));
							nodeCells[i] = c;
							break;
						}
					}
					break;
				}
			}
		}
	}
}
