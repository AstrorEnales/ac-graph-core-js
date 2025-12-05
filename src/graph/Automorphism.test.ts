import {describe, expect, it} from 'vitest';
import {Automorphism} from './Automorphism';

describe('Automorphism', () => {
	it('composes', () => {
		const f = new Automorphism(
			new Map([
				[0, 0],
				[1, 1],
				[2, 2],
			])
		);
		const g = new Automorphism(
			new Map([
				[0, 1],
				[1, 2],
				[2, 0],
			])
		);
		expect(f.toString()).toBe('()');
		expect(f.compose(f).toString()).toBe('()');
		expect(g.toString()).toBe('(0 1 2)');
		expect(f.compose(g).toString()).toBe('(0 1 2)');
		expect(g.compose(f).toString()).toBe('(0 1 2)');
		expect(g.compose(g).toString()).toBe('(0 2 1)');
		expect(g.compose(g).compose(g).toString()).toBe('()');
	});

	it('tests identity', () => {
		const f = new Automorphism(
			new Map([
				[0, 0],
				[1, 1],
				[2, 2],
			])
		);
		const g = new Automorphism(
			new Map([
				[0, 1],
				[1, 2],
				[2, 0],
			])
		);
		expect(f.isIdentity()).toBeTruthy();
		expect(g.isIdentity()).toBeFalsy();
	});

	it('checks equality', () => {
		const f = new Automorphism(
			new Map([
				[0, 0],
				[1, 1],
				[2, 2],
			])
		);
		const g = new Automorphism(
			new Map([
				[0, 1],
				[1, 2],
				[2, 0],
			])
		);
		expect(f.equals(f)).toBeTruthy();
		expect(g.equals(g)).toBeTruthy();
		expect(g.equals(f)).toBeFalsy();
		expect(f.equals(g)).toBeFalsy();
	});

	it('reverts', () => {
		const f = new Automorphism(
			new Map([
				[0, 0],
				[1, 1],
				[2, 2],
			])
		);
		const g = new Automorphism(
			new Map([
				[0, 1],
				[1, 2],
				[2, 0],
			])
		);
		expect(f.reverse().toString()).toBe('()');
		expect(g.reverse().toString()).toBe('(0 2 1)');
	});
});
