var O = Object.defineProperty;
var I = (g, e, s) => e in g ? O(g, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : g[e] = s;
var y = (g, e, s) => I(g, typeof e != "symbol" ? e + "" : e, s);
class A {
}
class K extends A {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   * @param nodeLabelWildcards Indices of pattern nodes considered wildcards
   * for labelled graphs. Their label is ignored during validation.
   * @param edgeLabelWildcards Indices of pattern edges considered wildcards
   * for labelled graphs. Their label is ignored during validation. Encoded
   * as "sourceIndex + ',' + targetIndex".
   * @param partialMapping Partial mapping of pattern nodes in target to only
   * find solutions containing this mapping. The array needs to follow the
   * same format as the Mapping type. Nodes not fixed in the partial mapping
   * are represented by -1.
   */
  isSubgraphIsomorphic(e, s, i = [], t = [], n = null) {
    const r = e.adjacencyMatrix.length, o = s.adjacencyMatrix.length;
    if (r > o)
      return !1;
    n === null && (n = new Array(r).fill(-1));
    const a = e.labels && s.labels, c = Array(o).fill(!1), l = Array(r).fill(-1), d = new Set(i), u = new Set(t), [
      h,
      b,
      L,
      P
    ] = this.getInOutDegrees(e, s), D = h.map(
      (m, f) => L.map((p, M) => p >= m && P[M] >= b[f] && (n[f] === -1 || n[f] === M) && (!a || d.has(f) || e.labels[f] === s.labels[M]) ? M : -1).filter((p) => p !== -1)
    ), w = (m) => {
      if (m === r)
        return this.checkCompatibility(
          e,
          s,
          l,
          u
        );
      for (const f of D[m])
        if (!c[f]) {
          if (l[m] = f, c[f] = !0, this.isFeasible(
            e,
            s,
            l,
            m,
            u
          ) && w(m + 1))
            return !0;
          c[f] = !1, l[m] = -1;
        }
      return !1;
    };
    return w(0);
  }
  getInOutDegrees(e, s) {
    const i = e.adjacencyMatrix.map(
      (o) => o.reduce((a, c) => a + c, 0)
    ), t = [], n = s.adjacencyMatrix.map(
      (o) => o.reduce((a, c) => a + c, 0)
    ), r = [];
    return e.adjacencyMatrix.forEach((o, a) => {
      t.push(
        o.map((c, l) => e.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), s.adjacencyMatrix.forEach((o, a) => {
      r.push(
        o.map((c, l) => s.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), [
      i,
      t,
      n,
      r
    ];
  }
  /**
   * Collect all possible monomorphisms of the pattern graph in the target graph
   * including symmetries
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   * @param nodeLabelWildcards Indices of pattern nodes considered wildcards
   * for labelled graphs. Their label is ignored during validation.
   * @param edgeLabelWildcards Indices of pattern edges considered wildcards
   * for labelled graphs. Their label is ignored during validation. Encoded
   * as "sourceIndex + ',' + targetIndex".
   * @param partialMapping Partial mapping of pattern nodes in target to only
   * find solutions containing this mapping. The array needs to follow the
   * same format as the Mapping type. Nodes not fixed in the partial mapping
   * are represented by -1.
   */
  findAllSubgraphMonomorphisms(e, s, i = [], t = [], n = null) {
    const r = e.adjacencyMatrix.length, o = s.adjacencyMatrix.length, a = [], c = new Set(i), l = new Set(t);
    if (r > o)
      return a;
    n === null && (n = new Array(r).fill(-1));
    const d = e.labels && s.labels, u = Array(o).fill(!1), h = Array(r).fill(-1), [
      b,
      L,
      P,
      D
    ] = this.getInOutDegrees(e, s), w = b.map(
      (f, p) => P.map((M, x) => M >= f && D[x] >= L[p] && (n[p] === -1 || n[p] === x) && (!d || c.has(p) || e.labels[p] === s.labels[x]) ? x : -1).filter((M) => M !== -1)
    ), m = (f) => {
      if (f === r) {
        this.checkCompatibility(
          e,
          s,
          h,
          l
        ) && a.push([...h]);
        return;
      }
      for (const p of w[f])
        u[p] || (h[f] = p, u[p] = !0, this.isFeasible(
          e,
          s,
          h,
          f,
          l
        ) && m(f + 1), u[p] = !1, h[f] = -1);
    };
    return m(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, s, i, t, n) {
    const r = e.edgeLabels && s.edgeLabels;
    for (let o = 0; o < t; o++)
      if (e.adjacencyMatrix[t][o] && (!s.adjacencyMatrix[i[t]][i[o]] || r && !n.has(t + "," + o) && e.edgeLabels[t][o] !== s.edgeLabels[i[t]][i[o]]) || e.adjacencyMatrix[o][t] && (!s.adjacencyMatrix[i[o]][i[t]] || r && !n.has(o + "," + t) && e.edgeLabels[o][t] !== s.edgeLabels[i[o]][i[t]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, s, i, t) {
    const n = e.edgeLabels && s.edgeLabels, r = e.adjacencyMatrix.length;
    for (let o = 0; o < r; o++)
      for (let a = 0; a < r; a++)
        if (e.adjacencyMatrix[o][a] && (!s.adjacencyMatrix[i[o]][i[a]] || n && !t.has(o + "," + a) && e.edgeLabels[o][a] !== s.edgeLabels[i[o]][i[a]]))
          return !1;
    return !0;
  }
}
const $ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: A,
  UllmannGraphMatcher: K
}, Symbol.toStringTag, { value: "Module" })), S = class S {
  constructor(e, s = S.DefaultNodeKeySuffixGenerator, i = S.DefaultNodePropertiesMapper, t = S.DefaultNodePropertiesCanonKeyMapper) {
    y(this, "nodeCount");
    y(this, "hasNodeLabels");
    y(this, "hasNodeProperties");
    y(this, "hasEdgeLabels");
    y(this, "isSymmetric");
    y(this, "graph");
    y(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    y(this, "nodeKeys", /* @__PURE__ */ new Map());
    y(this, "nodePropertiesMapper");
    y(this, "nodePropertiesCanonKeyMapper");
    y(this, "graphStringBuilder");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = i, this.nodePropertiesCanonKeyMapper = t;
    let n = !0;
    for (let r = 0; r < this.nodeCount; r++) {
      const o = /* @__PURE__ */ new Set();
      let a = 0, c = 0;
      for (let d = 0; d < this.nodeCount; d++) {
        const u = e.adjacencyMatrix[r][d], h = e.adjacencyMatrix[d][r];
        u === 1 && (c++, o.add(d)), h === 1 && (a++, o.add(d)), u !== h && (n = !1);
      }
      this.nodeNeighbors.set(r, [...o]);
      const l = c + "|" + a + "|" + s(e, r);
      this.nodeKeys.set(r, l);
    }
    this.isSymmetric = n, this.graphStringBuilder = this.buildGraphStringCurry();
  }
  /**
   * Canonicalize the graph
   * @returns
   * 1. canonical graph representation
   * 2. graph key
   * 3. node mapping from the original to the canonical graph
   * 4. automorphisms
   */
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
    this.individualizeDFS(
      e,
      [],
      i,
      this.handleRepresentationCurry(s, i)
    );
    const t = [...s.keys()].sort(
      (l, d) => l.localeCompare(d)
    )[0], n = s.get(t), r = new Array(this.nodeCount), o = new Array(r.length);
    [...n.partitions[0].entries()].forEach(([l, d]) => {
      r[d] = l, o[l - 1] = d;
    });
    const a = this.buildRepresentationGraph(
      r
    ), c = /* @__PURE__ */ new Map();
    return [...s.values()].forEach(
      (l) => [...l.automorphisms.entries()].forEach(
        ([d, u]) => c.set(d, u)
      )
    ), [
      a,
      this.buildGraphString(a),
      o,
      new v([...c.values()])
    ];
  }
  handleRepresentationCurry(e, s) {
    const i = Array.from({ length: this.nodeCount }, (t, n) => n + 1);
    return (t, n) => {
      const r = /* @__PURE__ */ new Map();
      t.forEach((c, l) => r.set(c, l));
      const o = i.map(
        (c) => this.nodeNeighbors.get(r.get(c)).map((l) => t[l]).sort().join(";")
      ).join("|");
      let a = e.get(o);
      a === void 0 && (a = {
        partitions: [],
        automorphisms: /* @__PURE__ */ new Map()
      }, e.set(o, a));
      for (const c of a.partitions) {
        const l = /* @__PURE__ */ new Map();
        for (let u = 0; u < t.length; u++) {
          const h = c.get(t[u]);
          if (h !== u) {
            const b = [
              h < u ? h : u,
              u < h ? h : u
            ];
            l.set(b[0] + "|" + b[1], b);
          }
        }
        const d = new j([...l.values()]);
        a.automorphisms.set(
          d.toString(),
          d
        );
        for (const u of d.mappings)
          for (let h = 0; h < n.length; h++)
            u.includes(n[h]) && u.filter((b) => b != n[h]).forEach(
              (b) => s.add([...n.slice(0, h), b].join("|"))
            );
      }
      a.partitions.push(r);
    };
  }
  /**
   * Calculates only the automorphisms of the graph.
   *
   * Note: if any of the graph, graph key, or node mapping are needed as well,
   * use the canonicalize() function.
   */
  aut() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
    this.individualizeDFS(
      e,
      [],
      i,
      this.handleRepresentationCurry(s, i)
    );
    const t = /* @__PURE__ */ new Map();
    return [...s.values()].forEach(
      (n) => [...n.automorphisms.entries()].forEach(
        ([r, o]) => t.set(r, o)
      )
    ), new v([...t.values()]);
  }
  partitionByPropertyKeys(e) {
    const s = /* @__PURE__ */ new Map();
    for (let t = 0; t < this.nodeCount; t++) {
      const n = this.nodeKeys.get(t);
      s.has(n) ? s.get(n).push(t) : s.set(n, [t]);
    }
    let i = 1;
    Array.from(s.keys()).sort((t, n) => t.localeCompare(n)).forEach((t) => {
      const n = s.get(t);
      n.forEach((r) => e[r] = i), i += n.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, s, i, t) {
    if (this.isCanon(e)) {
      t(e, s);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      t(e, s);
      return;
    }
    const n = this.getCellToBreak(e);
    for (const r of n[1])
      e[r] = n[0] + 1;
    for (const r of n[1]) {
      const o = [...s, r];
      i.has(o.join("|")) || (e[r] = n[0], this.individualizeDFS(
        [...e],
        o,
        i,
        t
      ), e[r] = n[0] + 1);
    }
  }
  individualizationRefinement(e) {
    let s = !1;
    for (; !s; ) {
      s = !0;
      const i = e.map((n, r) => this.nodeNeighbors.get(r).map((a) => {
        if (this.hasEdgeLabels) {
          const c = this.graph.edgeLabels;
          return this.isSymmetric ? `${e[a]};${c[r][a]}` : `${e[a]};${c[r][a]};${c[a][r]}`;
        }
        return e[a].toString();
      }).sort().join("|")), t = /* @__PURE__ */ new Map();
      i.forEach((n, r) => {
        const o = e[r];
        let a = t.get(o);
        a === void 0 && (a = /* @__PURE__ */ new Map(), t.set(o, a));
        let c = a.get(n);
        c === void 0 && (c = [], a.set(n, c)), c.push(r);
      });
      for (let n = 1; n <= this.nodeCount; n++) {
        const r = t.get(n);
        if (r === void 0 || r.size < 2)
          continue;
        s = !1;
        const o = [...r.keys()].sort((c, l) => l.localeCompare(c));
        let a = n;
        for (const c of o) {
          const l = r.get(c);
          l.forEach((d) => e[d] = a), a += l.length;
        }
        break;
      }
    }
  }
  getCellToBreak(e) {
    const s = Array.from({ length: e.length }, () => []);
    e.forEach((i, t) => s[i - 1].push(t));
    for (let i = 0; i < s.length; i++)
      if (s[i].length > 1)
        return [i + 1, s[i]];
    return [1, s[0]];
  }
  buildRepresentationGraph(e) {
    const s = e.map((t) => t - 1), i = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    if (this.isSymmetric)
      for (let t = 0; t < this.nodeCount; t++) {
        const n = s[t], r = this.graph.adjacencyMatrix[t];
        for (let o = t; o < this.nodeCount; o++)
          i.adjacencyMatrix[n][s[o]] = r[o], i.adjacencyMatrix[s[o]][n] = r[o];
      }
    else
      for (let t = 0; t < this.nodeCount; t++) {
        const n = s[t], r = this.graph.adjacencyMatrix[t];
        for (let o = 0; o < this.nodeCount; o++)
          i.adjacencyMatrix[n][s[o]] = r[o];
      }
    if (this.hasNodeLabels && (i.labels = new Array(this.nodeCount), s.forEach((t, n) => i.labels[t] = this.graph.labels[n])), this.hasNodeProperties && (i.nodeProperties = new Array(this.nodeCount), s.forEach(
      (t, n) => i.nodeProperties[t] = this.nodePropertiesMapper(
        this.graph,
        n,
        s
      )
    )), this.hasEdgeLabels)
      if (i.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let t = 0; t < this.nodeCount; t++) {
          const n = s[t], r = this.graph.edgeLabels[t];
          for (let o = t; o < this.nodeCount; o++)
            i.edgeLabels[n][s[o]] = r[o], i.edgeLabels[s[o]][n] = r[o];
        }
      else
        for (let t = 0; t < this.nodeCount; t++) {
          const n = s[t], r = this.graph.edgeLabels[t];
          for (let o = 0; o < this.nodeCount; o++)
            i.edgeLabels[n][s[o]] = r[o];
        }
    return i;
  }
  buildGraphStringCurry() {
    const e = this.hasEdgeLabels ? (t, n, r) => `${n}-${t.edgeLabels[n][r]}-${r}` : (t, n, r) => `${n}-${r}`, s = this.hasNodeProperties ? (t, n) => {
      const r = this.nodePropertiesCanonKeyMapper(
        t,
        n
      );
      return r.length > 0 ? `{${r}}` : "";
    } : (t, n) => "", i = this.hasNodeLabels ? (t) => ";" + t.labels.map((n, r) => n + s(t, r)).join("|") : this.hasNodeProperties ? (t) => ";" + t.nodeProperties.map(
      (n, r) => this.nodePropertiesCanonKeyMapper(t, r)
    ).join("|") : (t) => "";
    return this.isSymmetric ? (t) => {
      const n = [];
      for (let r = 0; r < this.nodeCount; r++) {
        const o = t.adjacencyMatrix[r];
        for (let a = r; a < this.nodeCount; a++)
          o[a] === 1 && n.push(e(t, r, a));
      }
      return n.join("|") + i(t);
    } : (t) => {
      const n = [];
      for (let r = 0; r < this.nodeCount; r++) {
        const o = t.adjacencyMatrix[r];
        for (let a = 0; a < this.nodeCount; a++)
          o[a] === 1 && n.push(e(t, r, a));
      }
      return n.join("|") + i(t);
    };
  }
  buildGraphString(e) {
    return this.graphStringBuilder(e);
  }
};
y(S, "DefaultNodeKeySuffixGenerator", (e, s) => e.labels ? e.labels[s] : ""), y(S, "DefaultNodePropertiesMapper", (e, s, i) => e.nodeProperties && e.nodeProperties[s] ? new Map(e.nodeProperties[s]) : void 0), y(S, "DefaultNodePropertiesCanonKeyMapper", (e, s) => "");
let E = S;
const z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: E
}, Symbol.toStringTag, { value: "Module" }));
class N {
  static find(e) {
    const s = [], i = /* @__PURE__ */ new Set(), t = (n, r) => {
      i.add(n), r.push(n);
      for (let o = 0; o < e.adjacencyMatrix.length; o++)
        (e.adjacencyMatrix[n][o] === 1 || e.adjacencyMatrix[o][n] === 1) && (i.has(o) || t(o, r));
    };
    for (let n = 0; n < e.adjacencyMatrix.length; n++)
      if (!i.has(n)) {
        const r = [];
        t(n, r), s.push(r);
      }
    return s;
  }
}
const C = class C {
  constructor(e) {
    y(this, "mappings");
    this.mappings = e;
  }
  apply(e) {
    for (const s of this.mappings) {
      if (s[0] === e)
        return s[1];
      if (s[1] === e)
        return s[0];
    }
    return e;
  }
  toString() {
    return this.mappings.map((e) => `(${e[0]} ${e[1]})`).join("");
  }
};
y(C, "Identity", new C([]));
let j = C;
class v {
  constructor(e) {
    y(this, "generators");
    this.generators = [j.Identity, ...e];
  }
  orbitOf(e) {
    const s = /* @__PURE__ */ new Set();
    s.add(e);
    for (const i of this.generators)
      s.add(i.apply(e));
    return Array.from(s).sort();
  }
  stabilizerOf(e) {
    return this.generators.filter((s) => s.apply(e) === e);
  }
  stabilizerSizeOf(e) {
    return this.generators.reduce(
      (s, i) => s += i.apply(e) === e ? 1 : 0,
      0
    );
  }
  /**
   * Orbit size of g via Orbit–Stabilizer Theorem.
   */
  orbitSizeOf(e) {
    return this.generators.length / this.stabilizerSizeOf(e);
  }
  orbits(e) {
    const s = /* @__PURE__ */ new Set(), i = [];
    for (const t of e)
      if (!s.has(t)) {
        const n = this.orbitOf(t);
        n.forEach((r) => s.add(r)), i.push(n);
      }
    return i;
  }
  toString() {
    return "[" + this.generators.map((e) => e.toString()).join(", ") + "]";
  }
}
function k(g) {
  const e = g.adjacencyMatrix.length;
  let s = [];
  for (let i = 0; i < e; i++)
    for (let t = i + 1; t < e; t++)
      g.adjacencyMatrix[i][t] !== 0 && s.push(`e ${i + 1} ${t + 1}`);
  return [`p edge ${e} ${s.length}`, ...s].join(`
`);
}
const B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Automorphism: j,
  AutomorphismGroup: v,
  ConnectedComponents: N,
  canon: z,
  matching: $,
  symmetricGraphToDIMACS: k
}, Symbol.toStringTag, { value: "Module" }));
export {
  B as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
