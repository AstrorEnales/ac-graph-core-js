import {describe, it, expect} from 'vitest';
import ConnectedComponents from './ConnectedComponents';
import type {Graph} from '.';

describe('find connected components', () => {
	it('finds a single connected component', () => {
		const graph: Graph = {
			adjacencyMatrix: [
				[0, 1, 0],
				[1, 0, 1],
				[0, 1, 0],
			],
		};
		const result = ConnectedComponents.find(graph);
		expect(result).toEqual([[0, 1, 2]]);
	});

	it('finds two connected components', () => {
		const graph: Graph = {
			adjacencyMatrix: [
				[0, 1, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[0, 0, 0, 1, 1],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
			],
		};
		const result = ConnectedComponents.find(graph);
		expect(result).toEqual([
			[0, 1],
			[2, 3, 4],
		]);
	});

	it('returns each node as its own component if no edges exist', () => {
		const graph: Graph = {
			adjacencyMatrix: [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			],
		};
		const result = ConnectedComponents.find(graph);
		expect(result).toEqual([[0], [1], [2]]);
	});

	it('handles an empty graph', () => {
		const graph: Graph = {
			adjacencyMatrix: [],
		};
		const result = ConnectedComponents.find(graph);
		expect(result).toEqual([]);
	});

	it('treats adjacencyMatrix as undirected regardless of direction', () => {
		const graph: Graph = {
			adjacencyMatrix: [
				[0, 1, 0],
				[0, 0, 1],
				[0, 0, 0],
			],
		};
		const result = ConnectedComponents.find(graph);
		expect(result).toEqual([[0, 1, 2]]);
	});
});
