import {Mapping} from './matching';

export class Automorphism {
	public readonly mappings: number[];
	public readonly cycles: number[][] = [];

	constructor(mappings: number[]) {
		this.mappings = mappings;
		if (new Set(mappings).size !== mappings.length) {
			throw 'Automorphism is not bijective';
		}
		const visited = new Set<number>();
		const keys = [...mappings.keys()].sort();
		for (const key of keys) {
			if (!visited.has(key)) {
				visited.add(key);
				const cycle = [key];
				while (true) {
					const value = mappings[cycle[cycle.length - 1]];
					visited.add(value);
					if (value !== cycle[0]) {
						cycle.push(value);
					} else {
						break;
					}
				}
				if (cycle.length > 1) {
					this.cycles.push(cycle);
				}
			}
		}
	}

	public apply(x: number): number {
		return this.mappings[x];
	}

	/**
	 * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
	 */
	public compose(g: Automorphism): Automorphism {
		const h = new Array(this.mappings.length);
		for (let i = 0; i < this.mappings.length; i++) {
			const gx = g.apply(i);
			const fgx = this.apply(gx);
			h[i] = fgx;
		}
		return new Automorphism(h);
	}

	public reverse(): Automorphism {
		const mapping = new Array(this.mappings.length);
		for (let i = 0; i < this.mappings.length; i++) {
			mapping[this.mappings[i]] = i;
		}
		return new Automorphism(mapping);
	}

	public equals(g: Automorphism): boolean {
		for (let i = 0; i < this.mappings.length; i++) {
			if (this.mappings[i] !== g.mappings[i]) {
				return false;
			}
		}
		return true;
	}

	public isIdentity(): boolean {
		for (let i = 0; i < this.mappings.length; i++) {
			if (this.mappings[i] !== i) {
				return false;
			}
		}
		return true;
	}

	public toString(): string {
		if (this.cycles.length === 0) {
			return '()';
		}
		return this.cycles
			.map((m) => `(${m.join(' ')})`)
			.sort()
			.join('');
	}

	public static identity(n: number): Automorphism {
		return new Automorphism(Array.from({length: n}, (_, i) => i));
	}

	public static fromCycleNotation = (
		n: number,
		cycle: string
	): Automorphism => {
		const mapping = Array.from({length: n}, (_, i) => i);
		cycle
			.split('(')
			.filter((s) => s.length > 1)
			.map((s) =>
				s
					.replace(')', '')
					.split(/\s+/)
					.filter((s) => s.length > 0)
					.map((x) => parseInt(x))
			)
			.forEach((m) => {
				for (let i = 0; i < m.length; i++) {
					mapping[m[i]] = m[(i + 1) % m.length];
				}
			});
		return new Automorphism(mapping);
	};
}

export class AutomorphismGroup {
	public readonly generators: Automorphism[];
	public readonly n: number;

	constructor(generators: Automorphism[], n: number) {
		this.n = n;
		if (generators.some((g) => g.isIdentity())) {
			this.generators = [...generators];
		} else {
			this.generators = [Automorphism.identity(n), ...generators];
		}
	}

	public orbitOf(x: number): number[] {
		const orbit = new Set<number>();
		orbit.add(x);
		for (const aut of this.generators) {
			orbit.add(aut.apply(x));
		}
		return Array.from(orbit).sort();
	}

	public stabilizerOf(x: number): Automorphism[] {
		return this.generators.filter((aut) => aut.apply(x) === x);
	}

	public stabilizerSizeOf(x: number): number {
		return this.generators.reduce(
			(c, aut) => (c += aut.apply(x) === x ? 1 : 0),
			0
		);
	}

	/**
	 * Orbit size of x via Orbit–Stabilizer Theorem.
	 */
	public orbitSizeOf(x: number): number {
		return this.generators.length / this.stabilizerSizeOf(x);
	}

	public orbits(): number[][] {
		const seen = new Set<number>();
		const orbits: number[][] = [];
		for (const g of this.generators[0].mappings.keys()) {
			if (!seen.has(g)) {
				const orb = this.orbitOf(g);
				orb.forEach((x) => seen.add(x));
				orbits.push(orb);
			}
		}
		return orbits;
	}

	public closure(): Automorphism[] {
		const result: Automorphism[] = [];
		const visited = new Set<string>();
		const addIfUnvisited = (aut: Automorphism) => {
			const key = aut.toString();
			if (!visited.has(key)) {
				result.push(aut);
				visited.add(key);
			}
		};
		const queue = [
			...this.generators,
			...this.generators.map((g) => g.reverse()),
		];
		queue.forEach((aut) => addIfUnvisited(aut));
		while (queue.length > 0) {
			const f = queue.pop()!;
			for (const g of result) {
				addIfUnvisited(f.compose(g));
				addIfUnvisited(g.compose(f));
			}
		}
		return result;
	}

	public remap(mapping: Mapping): AutomorphismGroup {
		const mappedGenerators: Automorphism[] = [];
		for (const gen of this.generators) {
			const mappedGen = Array.from({length: this.n}, (_, i) => i);
			for (let i = 0; i < this.n; i++) {
				mappedGen[mapping[i]] = mapping[gen.mappings[i]];
			}
			mappedGenerators.push(new Automorphism(mappedGen));
		}
		return new AutomorphismGroup(mappedGenerators, this.n);
	}

	public toString(): string {
		return '[' + this.generators.map((g) => g.toString()).join(', ') + ']';
	}
}
