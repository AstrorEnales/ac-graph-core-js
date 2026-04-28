import { Mapping } from './matching';
export declare class Automorphism {
    readonly mappings: number[];
    readonly cycles: number[][];
    constructor(mappings: number[]);
    apply(x: number): number;
    /**
     * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
     */
    compose(g: Automorphism): Automorphism;
    reverse(): Automorphism;
    equals(g: Automorphism): boolean;
    isIdentity(): boolean;
    toString(): string;
    static identity(n: number): Automorphism;
    static fromCycleNotation: (n: number, cycle: string) => Automorphism;
}
export declare class AutomorphismGroup {
    readonly generators: Automorphism[];
    readonly n: number;
    constructor(generators: Automorphism[], n: number);
    orbitOf(x: number): number[];
    stabilizerOf(x: number): Automorphism[];
    stabilizerSizeOf(x: number): number;
    /**
     * Orbit size of x via Orbit–Stabilizer Theorem.
     */
    orbitSizeOf(x: number): number;
    orbits(): number[][];
    closure(): Automorphism[];
    remap(mapping: Mapping): AutomorphismGroup;
    toString(): string;
}
