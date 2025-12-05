export class Automorphism {
	public readonly mappings: Map<number, number>;
	public readonly cycles: number[][] = [];

	constructor(mappings: Map<number, number>) {
		this.mappings = mappings;
		if (new Set(mappings.values()).size !== mappings.size) {
			throw 'Automorphism is not bijective';
		}
		const visited = new Set<number>();
		const keys = [...mappings.keys()].sort();
		for (const key of keys) {
			if (!visited.has(key)) {
				visited.add(key);
				const cycle = [key];
				while (mappings.has(cycle[cycle.length - 1])) {
					const value = mappings.get(cycle[cycle.length - 1])!;
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
		return this.mappings.get(x)!;
	}

	/**
	 * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
	 */
	public compose(g: Automorphism): Automorphism {
		const h = new Map<number, number>();
		for (const x of this.mappings.keys()) {
			const gx = g.apply(x);
			const fgx = this.apply(gx);
			h.set(x, fgx);
		}
		return new Automorphism(h);
	}

	public reverse(): Automorphism {
		return new Automorphism(
			new Map([...this.mappings.entries()].map(([k, v]) => [v, k]))
		);
	}

	public equals(g: Automorphism): boolean {
		for (const key of this.mappings.keys()) {
			if (this.mappings.get(key)! !== g.mappings.get(key)!) {
				return false;
			}
		}
		return true;
	}

	public isIdentity(): boolean {
		for (const key of this.mappings.keys()) {
			if (this.mappings.get(key)! !== key) {
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
}

export class AutomorphismGroup {
	public readonly generators: Automorphism[];

	constructor(generators: Automorphism[], n: number) {
		if (generators.some((g) => g.isIdentity())) {
			this.generators = [...generators];
		} else {
			const identity = new Automorphism(
				new Map(Array.from({length: n}, (_, i) => [i, i]))
			);
			this.generators = [identity, ...generators];
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

	public toString(): string {
		return '[' + this.generators.map((g) => g.toString()).join(', ') + ']';
	}
}
