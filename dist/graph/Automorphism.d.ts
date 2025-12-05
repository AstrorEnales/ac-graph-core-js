export declare class Automorphism {
    readonly mappings: Map<number, number>;
    readonly cycles: number[][];
    constructor(mappings: Map<number, number>);
    apply(x: number): number;
    /**
     * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
     */
    compose(g: Automorphism): Automorphism;
    reverse(): Automorphism;
    equals(g: Automorphism): boolean;
    isIdentity(): boolean;
    toString(): string;
}
export declare class AutomorphismGroup {
    readonly generators: Automorphism[];
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
    toString(): string;
}
