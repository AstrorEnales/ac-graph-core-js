import {test, expect} from 'vitest';
import {UllmannGraphMatcher} from './UllmannGraphMatcher';
import {Graph} from '..';

test('subgraph isomorphism', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 0],
			[1, 0, 1],
			[0, 1, 0],
		],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
	};
	const matcher = new UllmannGraphMatcher();
	expect(matcher.isSubgraphIsomorphic(pattern, target)).toBeTruthy();
});

test('not subgraph isomorphism', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 1],
			[1, 0, 1],
			[1, 1, 0],
		],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
	};
	const matcher = new UllmannGraphMatcher();
	expect(matcher.isSubgraphIsomorphic(pattern, target)).toBeFalsy();
});

test('all subgraph isomorphism matches', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 0],
			[1, 0, 1],
			[0, 1, 0],
		],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
	};
	const matcher = new UllmannGraphMatcher();
	const matches = matcher.findAllSubgraphMonomorphisms(pattern, target);
	expect(matches.length).toBe(6);
	expect(matches).toContainEqual([0, 1, 2]);
	expect(matches).toContainEqual([0, 1, 3]);
	expect(matches).toContainEqual([2, 1, 3]);
	// And the reverse cases
	expect(matches).toContainEqual([2, 1, 0]);
	expect(matches).toContainEqual([3, 1, 0]);
	expect(matches).toContainEqual([3, 1, 2]);
});

test('subgraph isomorphism with labels', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 0],
			[1, 0, 1],
			[0, 1, 0],
		],
		labels: ['A', 'B', 'B'],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
		labels: ['A', 'B', 'C', 'B'],
	};
	const matcher = new UllmannGraphMatcher();
	expect(matcher.isSubgraphIsomorphic(pattern, target)).toBeTruthy();
	const matches = matcher.findAllSubgraphMonomorphisms(pattern, target);
	expect(matches.length).toBe(1);
	expect(matches[0]).toEqual([0, 1, 3]);
});

test('subgraph isomorphism with direction', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 0],
			[0, 0, 1],
			[0, 0, 0],
		],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 0],
			[0, 1, 0, 0],
		],
	};
	const matcher = new UllmannGraphMatcher();
	expect(matcher.isSubgraphIsomorphic(pattern, target)).toBeTruthy();
	const matches = matcher.findAllSubgraphMonomorphisms(pattern, target);
	expect(matches.length).toBe(2);
	expect(matches[0]).toEqual([0, 1, 2]);
	expect(matches[1]).toEqual([3, 1, 2]);
});

test('subgraph isomorphism with edge labels', () => {
	const pattern: Graph = {
		adjacencyMatrix: [
			[0, 1, 0],
			[1, 0, 1],
			[0, 1, 0],
		],
		edgeLabels: [
			['', '-', ''],
			['-', '', '='],
			['', '=', ''],
		],
	};
	const target: Graph = {
		adjacencyMatrix: [
			[0, 1, 0, 0],
			[1, 0, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
		edgeLabels: [
			['', '-', '', ''],
			['-', '', '#', '='],
			['', '#', '', ''],
			['', '=', '', ''],
		],
	};
	const matcher = new UllmannGraphMatcher();
	expect(matcher.isSubgraphIsomorphic(pattern, target)).toBeTruthy();
	const matches = matcher.findAllSubgraphMonomorphisms(pattern, target);
	expect(matches.length).toBe(1);
	expect(matches[0]).toEqual([0, 1, 3]);
});
