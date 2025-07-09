import {test, expect} from 'vitest';
import {Graph} from '..';
import {GraphCanon} from './GraphCanon';

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

function applyPermutationToMatrix(
	matrix: number[][],
	perm: number[]
): number[][] {
	const n = matrix.length;
	const permuted = Array.from({length: n}, () => Array(n).fill(0));
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			permuted[i][j] = matrix[perm[i]][perm[j]];
		}
	}
	return permuted;
}

function testPermutations(graph: Graph, permutations: number[][]) {
	const canon = new GraphCanon(graph);
	const canonGraph = canon.canonicalize();
	const canonGraphString = canon.buildGraphString(canonGraph);
	permutations.forEach((perm) => {
		const permGraph: Graph = {
			adjacencyMatrix: applyPermutationToMatrix(graph.adjacencyMatrix, perm),
		};
		const permCanon = new GraphCanon(permGraph);
		const canonGraph = permCanon.canonicalize();
		expect(permCanon.buildGraphString(canonGraph)).toBe(canonGraphString);
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
	testPermutations(
		graph,
		getAllPermutations([...Array(graph.adjacencyMatrix.length).keys()])
	);
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
