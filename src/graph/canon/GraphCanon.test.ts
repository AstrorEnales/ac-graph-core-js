import {test, expect} from 'vitest';
import {Graph} from '..';
import {GraphCanon} from './GraphCanon';

test('undirected unlabeled graph canon', () => {
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
	const canon = new GraphCanon(graph);
	canon.canonicalize();
});
