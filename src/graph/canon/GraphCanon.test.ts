import {test, expect} from 'vitest';
import {Graph} from '..';
import {
	GraphCanon,
	NodeKeySuffixGenerator,
	NodePropertiesCanonKeyMapper,
	NodePropertiesMapper,
} from './GraphCanon';

function getAllPermutations<T>(array: T[]): T[][] {
	if (array.length === 0) {
		return [[]];
	}
	const result: T[][] = [];
	for (let i = 0; i < array.length; i++) {
		const rest = [...array.slice(0, i), ...array.slice(i + 1)];
		const restPerms = getAllPermutations(rest);
		for (const perm of restPerms) {
			result.push([array[i], ...perm]);
		}
	}
	return result;
}

function applyPermutationToGraph(graph: Graph, perm: number[]): Graph {
	const n = graph.adjacencyMatrix.length;
	const result: Graph = {
		adjacencyMatrix: Array.from({length: n}, () => Array(n).fill(0)),
		edgeLabels: graph.edgeLabels
			? Array.from({length: n}, () => Array(n).fill(''))
			: undefined,
		labels: graph.labels ? new Array(n).fill('') : undefined,
	};
	for (let i = 0; i < n; i++) {
		if (graph.labels) {
			result.labels![perm[i]] = graph.labels[i];
		}
		for (let j = 0; j < n; j++) {
			result.adjacencyMatrix[perm[i]][perm[j]] = graph.adjacencyMatrix[i][j];
			if (graph.edgeLabels) {
				result.edgeLabels![perm[i]][perm[j]] = graph.edgeLabels[i][j];
			}
		}
	}
	return result;
}

function testAllPermutations(graph: Graph) {
	testPermutations(
		graph,
		getAllPermutations([...Array(graph.adjacencyMatrix.length).keys()])
	);
}

function testPermutations(graph: Graph, permutations: number[][]) {
	const canon = new GraphCanon(graph);
	const [, canonGraphString] = canon.canonicalize();
	permutations.forEach((perm) => {
		const permGraph = applyPermutationToGraph(graph, perm);
		const permCanon = new GraphCanon(permGraph);
		const [, permCanonGraphString] = permCanon.canonicalize();
		expect(permCanonGraphString).toBe(canonGraphString);
	});
}

test('undirected unlabeled graph canon', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 1],
			[0, 1, 1, 0],
		],
	};
	testAllPermutations(graph);
});

test('directed unlabeled graph canon', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[0, 0, 1, 1],
			[0, 1, 0, 1],
			[0, 1, 1, 0],
		],
	};
	testAllPermutations(graph);
});

test('undirected edge-labeled graph canon', () => {
	testAllPermutations({
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 1],
			[0, 1, 1, 0],
		],
		edgeLabels: [
			['', '-', '', ''],
			['-', '', '=', '='],
			['', '=', '', '-'],
			['', '=', '-', ''],
		],
	});
	testAllPermutations({
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 1],
			[0, 1, 1, 0],
		],
		edgeLabels: [
			['', '-', '', ''],
			['-', '', '#', '='],
			['', '#', '', '-'],
			['', '=', '-', ''],
		],
	});
});

test('larger undirected unlabeled graph canon', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
			[0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
			[0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
			[0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
			[0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
			[0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
		],
	};
	testPermutations(graph, [
		[8, 1, 3, 0, 4, 2, 5, 6, 9, 7],
		[9, 3, 6, 1, 0, 5, 2, 7, 8, 4],
		[6, 8, 9, 3, 2, 0, 5, 1, 4, 7],
		[6, 1, 3, 7, 9, 2, 8, 5, 4, 0],
		[9, 2, 4, 7, 3, 0, 1, 6, 5, 8],
		[1, 6, 2, 4, 8, 7, 0, 9, 5, 3],
		[4, 8, 5, 3, 1, 9, 7, 0, 6, 2],
		[6, 1, 3, 7, 2, 4, 8, 9, 0, 5],
		[1, 9, 4, 7, 3, 8, 6, 2, 5, 0],
		[5, 0, 6, 3, 9, 8, 1, 7, 4, 2],
		[5, 1, 6, 0, 7, 9, 8, 3, 4, 2],
		[3, 9, 7, 8, 0, 5, 6, 4, 1, 2],
		[5, 9, 7, 3, 2, 0, 6, 1, 8, 4],
		[9, 2, 4, 0, 7, 3, 5, 8, 1, 6],
		[3, 2, 0, 7, 6, 9, 1, 4, 5, 8],
		[3, 5, 2, 8, 7, 9, 6, 0, 4, 1],
		[9, 7, 8, 2, 3, 5, 6, 1, 4, 0],
		[6, 7, 1, 3, 5, 4, 0, 8, 9, 2],
		[2, 6, 4, 5, 1, 0, 3, 9, 7, 8],
		[7, 8, 0, 3, 9, 4, 6, 2, 5, 1],
	]);
});

test('undirected unlabeled Petersen graph canon', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0, 1, 1, 0, 0, 0, 0],
			[1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
			[0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
			[1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
			[0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
			[0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
			[0, 0, 0, 0, 1, 1, 0, 0, 1, 0],
		],
	};
	testPermutations(graph, [
		[8, 1, 3, 0, 4, 2, 5, 6, 9, 7],
		[9, 3, 6, 1, 0, 5, 2, 7, 8, 4],
		[6, 8, 9, 3, 2, 0, 5, 1, 4, 7],
		[6, 1, 3, 7, 9, 2, 8, 5, 4, 0],
		[9, 2, 4, 7, 3, 0, 1, 6, 5, 8],
		[1, 6, 2, 4, 8, 7, 0, 9, 5, 3],
		[4, 8, 5, 3, 1, 9, 7, 0, 6, 2],
		[6, 1, 3, 7, 2, 4, 8, 9, 0, 5],
		[1, 9, 4, 7, 3, 8, 6, 2, 5, 0],
		[5, 0, 6, 3, 9, 8, 1, 7, 4, 2],
		[5, 1, 6, 0, 7, 9, 8, 3, 4, 2],
		[3, 9, 7, 8, 0, 5, 6, 4, 1, 2],
		[5, 9, 7, 3, 2, 0, 6, 1, 8, 4],
		[9, 2, 4, 0, 7, 3, 5, 8, 1, 6],
		[3, 2, 0, 7, 6, 9, 1, 4, 5, 8],
		[3, 5, 2, 8, 7, 9, 6, 0, 4, 1],
		[9, 7, 8, 2, 3, 5, 6, 1, 4, 0],
		[6, 7, 1, 3, 5, 4, 0, 8, 9, 2],
		[2, 6, 4, 5, 1, 0, 3, 9, 7, 8],
		[7, 8, 0, 3, 9, 4, 6, 2, 5, 1],
	]);
});

test('undirected node-labeled graph canon', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 1, 1, 0, 0, 0],
			[1, 0, 0, 1, 0, 0],
			[1, 0, 0, 1, 1, 0],
			[0, 1, 1, 0, 0, 1],
			[0, 0, 1, 0, 0, 1],
			[0, 0, 0, 1, 1, 0],
		],
		labels: ['A', 'B', 'B', 'A', 'C', 'C'],
	};
	testAllPermutations(graph);
});

test('undirected labeled graph canon with index-dependant property', () => {
	const graph: Graph = {
		adjacencyMatrix: [
			[0, 1, 1, 1, 1],
			[1, 0, 0, 0, 0],
			[1, 0, 0, 0, 0],
			[1, 0, 0, 0, 0],
			[1, 0, 0, 0, 0],
		],
		labels: ['A', 'B', 'C', 'D', 'E'],
		nodeProperties: [
			new Map([['stereo', 'tetrahedral[1, 2, 3, 4]!']]),
			undefined,
			undefined,
			undefined,
			undefined,
		],
		edgeLabels: [
			['', '-', '-', '-', '-'],
			['-', '', '', '', ''],
			['-', '', '', '', ''],
			['-', '', '', '', ''],
			['-', '', '', '', ''],
		],
	};
	const nodeKeySuffixGenerator: NodeKeySuffixGenerator = (g, nodeIndex) =>
		(g.labels ? g.labels[nodeIndex] : '') +
		(g.nodeProperties![nodeIndex] ? 'tetrahedral!' : '');
	const nodePropertiesMapper: NodePropertiesMapper = (
		g,
		nodeIndex,
		nodeMapping
	) => {
		const p = g.nodeProperties![nodeIndex];
		if (p) {
			const stereo = p.get('stereo')! as string;
			const stereoParts = stereo.split(/[\[,\]]/);
			const mappedStereo =
				stereoParts[0] +
				'[' +
				stereoParts
					.slice(1, stereoParts.length - 1)
					.map((i) => nodeMapping[parseInt(i)])
					.join(', ') +
				']' +
				stereoParts[stereoParts.length - 1];
			return new Map([['stereo', mappedStereo]]);
		}
		return undefined;
	};
	const nodePropertiesCanonKeyMapper: NodePropertiesCanonKeyMapper = (
		g,
		nodeIndex
	) =>
		g.nodeProperties && g.nodeProperties[nodeIndex]
			? 'stereo:' + g.nodeProperties[nodeIndex].get('stereo')!
			: '';
	const permutations = getAllPermutations([
		...Array(graph.adjacencyMatrix.length).keys(),
	]);
	const canon = new GraphCanon(
		graph,
		nodeKeySuffixGenerator,
		nodePropertiesMapper,
		nodePropertiesCanonKeyMapper
	);
	const [, canonGraphString] = canon.canonicalize();
	expect(canonGraphString).toBe(
		'0---4|1---4|2---4|3---4|4---0|4---1|4---2|4---3;B|C|D|E|A{stereo:tetrahedral[0, 1, 2, 3]!}'
	);
	permutations.forEach((perm) => {
		const permGraph = applyPermutationToGraph(graph, perm);
		permGraph.nodeProperties = graph.nodeProperties!.map((_, i) =>
			nodePropertiesMapper(graph, perm.indexOf(i), perm)
		);
		const permCanon = new GraphCanon(
			permGraph,
			nodeKeySuffixGenerator,
			nodePropertiesMapper,
			nodePropertiesCanonKeyMapper
		);
		const [, permCanonGraphString] = permCanon.canonicalize();
		expect(permCanonGraphString).toBe(canonGraphString);
	});
});
