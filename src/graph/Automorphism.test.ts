import {describe, expect, it} from 'vitest';
import {Automorphism, AutomorphismGroup} from './Automorphism';

describe('Automorphism', () => {
	it('composes', () => {
		const f = new Automorphism([0, 1, 2]);
		const g = new Automorphism([1, 2, 0]);
		expect(f.toString()).toBe('()');
		expect(f.compose(f).toString()).toBe('()');
		expect(g.toString()).toBe('(0 1 2)');
		expect(f.compose(g).toString()).toBe('(0 1 2)');
		expect(g.compose(f).toString()).toBe('(0 1 2)');
		expect(g.compose(g).toString()).toBe('(0 2 1)');
		expect(g.compose(g).compose(g).toString()).toBe('()');
	});

	it('tests identity', () => {
		const f = new Automorphism([0, 1, 2]);
		const g = new Automorphism([1, 2, 0]);
		expect(f.isIdentity()).toBeTruthy();
		expect(g.isIdentity()).toBeFalsy();
	});

	it('checks equality', () => {
		const f = new Automorphism([0, 1, 2]);
		const g = new Automorphism([1, 2, 0]);
		expect(f.equals(f)).toBeTruthy();
		expect(g.equals(g)).toBeTruthy();
		expect(g.equals(f)).toBeFalsy();
		expect(f.equals(g)).toBeFalsy();
	});

	it('reverts', () => {
		const f = new Automorphism([0, 1, 2]);
		const g = new Automorphism([1, 2, 0]);
		expect(f.reverse().toString()).toBe('()');
		expect(g.reverse().toString()).toBe('(0 2 1)');
	});

	it('can be created from cycle notation', () => {
		let aut = Automorphism.fromCycleNotation(4, '()');
		expect(aut.isIdentity()).toBeTruthy();
		aut = Automorphism.fromCycleNotation(4, '(0 1 2 3)');
		expect(aut.cycles).toEqual([[0, 1, 2, 3]]);
		aut = Automorphism.fromCycleNotation(4, '(0 1)(2 3)');
		expect(aut.cycles).toEqual([
			[0, 1],
			[2, 3],
		]);
		aut = Automorphism.fromCycleNotation(4, '()(2 3)');
		expect(aut.cycles).toEqual([[2, 3]]);
		aut = Automorphism.fromCycleNotation(4, '(3 1 2)');
		expect(aut.cycles).toEqual([[1, 2, 3]]);
	});
});

describe('AutomorphismGroup', () => {
	it('closes', () => {
		const autGroup = new AutomorphismGroup([new Automorphism([1, 2, 0])], 3);
		const closure = autGroup.closure();
		expect(closure.length).toBe(3);
		expect(closure[0].toString()).toBe('()');
		expect(closure[1].toString()).toBe('(0 1 2)');
		expect(closure[2].toString()).toBe('(0 2 1)');
	});

	it('can be remapped', () => {
		let aut = Automorphism.fromCycleNotation(4, '()');
		let autGroup = new AutomorphismGroup([aut], 4).remap([0, 1, 2, 3]);
		expect(autGroup.generators[autGroup.generators.length - 1].cycles).toEqual(
			[]
		);
		aut = Automorphism.fromCycleNotation(4, '(0 1 2 3)');
		autGroup = new AutomorphismGroup([aut], 4).remap([0, 1, 2, 3]);
		expect(autGroup.generators[autGroup.generators.length - 1].cycles).toEqual([
			[0, 1, 2, 3],
		]);
		autGroup = new AutomorphismGroup([aut], 4).remap([3, 2, 1, 0]);
		expect(autGroup.generators[autGroup.generators.length - 1].cycles).toEqual([
			[0, 3, 2, 1],
		]);
		aut = Automorphism.fromCycleNotation(4, '(0 1)(2 3)');
		autGroup = new AutomorphismGroup([aut], 4).remap([3, 2, 1, 0]);
		expect(autGroup.generators[autGroup.generators.length - 1].cycles).toEqual([
			[0, 1],
			[2, 3],
		]);
	});
});
