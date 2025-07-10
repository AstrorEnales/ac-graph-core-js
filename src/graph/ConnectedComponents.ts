import {Graph} from '.';

export class ConnectedComponents {
	public static find(graph: Graph): number[][] {
		const result: number[][] = [];
		const visited = new Set<number>();

		const dfs = (node: number, component: number[]) => {
			visited.add(node);
			component.push(node);
			for (let i = 0; i < graph.adjacencyMatrix.length; i++) {
				if (
					graph.adjacencyMatrix[node][i] === 1 ||
					graph.adjacencyMatrix[i][node] === 1
				) {
					if (!visited.has(i)) {
						dfs(i, component);
					}
				}
			}
		};

		for (let i = 0; i < graph.adjacencyMatrix.length; i++) {
			if (!visited.has(i)) {
				const component: number[] = [];
				dfs(i, component);
				result.push(component);
			}
		}
		return result;
	}
}
