var D = Object.defineProperty;
var A = (p, e, s) => e in p ? D(p, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : p[e] = s;
var f = (p, e, s) => A(p, typeof e != "symbol" ? e + "" : e, s);
class k {
}
class I extends k {
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
  isSubgraphIsomorphic(e, s, r = [], t = [], n = null) {
    const o = e.adjacencyMatrix.length, i = s.adjacencyMatrix.length;
    if (o > i)
      return !1;
    n === null && (n = new Array(o).fill(-1));
    const a = e.labels && s.labels, c = Array(i).fill(!1), l = Array(o).fill(-1), h = new Set(r), y = new Set(t), [
      d,
      b,
      C,
      L
    ] = this.getInOutDegrees(e, s), v = d.map(
      (m, u) => C.map((g, S) => g >= m && L[S] >= b[u] && (n[u] === -1 || n[u] === S) && (!a || h.has(u) || e.labels[u] === s.labels[S]) ? S : -1).filter((g) => g !== -1)
    ), w = (m) => {
      if (m === o)
        return this.checkCompatibility(
          e,
          s,
          l,
          y
        );
      for (const u of v[m])
        if (!c[u]) {
          if (l[m] = u, c[u] = !0, this.isFeasible(
            e,
            s,
            l,
            m,
            y
          ) && w(m + 1))
            return !0;
          c[u] = !1, l[m] = -1;
        }
      return !1;
    };
    return w(0);
  }
  getInOutDegrees(e, s) {
    const r = e.adjacencyMatrix.map(
      (i) => i.reduce((a, c) => a + c, 0)
    ), t = [], n = s.adjacencyMatrix.map(
      (i) => i.reduce((a, c) => a + c, 0)
    ), o = [];
    return e.adjacencyMatrix.forEach((i, a) => {
      t.push(
        i.map((c, l) => e.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), s.adjacencyMatrix.forEach((i, a) => {
      o.push(
        i.map((c, l) => s.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), [
      r,
      t,
      n,
      o
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
  findAllSubgraphMonomorphisms(e, s, r = [], t = [], n = null) {
    const o = e.adjacencyMatrix.length, i = s.adjacencyMatrix.length, a = [], c = new Set(r), l = new Set(t);
    if (o > i)
      return a;
    n === null && (n = new Array(o).fill(-1));
    const h = e.labels && s.labels, y = Array(i).fill(!1), d = Array(o).fill(-1), [
      b,
      C,
      L,
      v
    ] = this.getInOutDegrees(e, s), w = b.map(
      (u, g) => L.map((S, x) => S >= u && v[x] >= C[g] && (n[g] === -1 || n[g] === x) && (!h || c.has(g) || e.labels[g] === s.labels[x]) ? x : -1).filter((S) => S !== -1)
    ), m = (u) => {
      if (u === o) {
        this.checkCompatibility(
          e,
          s,
          d,
          l
        ) && a.push([...d]);
        return;
      }
      for (const g of w[u])
        y[g] || (d[u] = g, y[g] = !0, this.isFeasible(
          e,
          s,
          d,
          u,
          l
        ) && m(u + 1), y[g] = !1, d[u] = -1);
    };
    return m(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, s, r, t, n) {
    const o = e.edgeLabels && s.edgeLabels;
    for (let i = 0; i < t; i++)
      if (e.adjacencyMatrix[t][i] && (!s.adjacencyMatrix[r[t]][r[i]] || o && !n.has(t + "," + i) && e.edgeLabels[t][i] !== s.edgeLabels[r[t]][r[i]]) || e.adjacencyMatrix[i][t] && (!s.adjacencyMatrix[r[i]][r[t]] || o && !n.has(i + "," + t) && e.edgeLabels[i][t] !== s.edgeLabels[r[i]][r[t]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, s, r, t) {
    const n = e.edgeLabels && s.edgeLabels, o = e.adjacencyMatrix.length;
    for (let i = 0; i < o; i++)
      for (let a = 0; a < o; a++)
        if (e.adjacencyMatrix[i][a] && (!s.adjacencyMatrix[r[i]][r[a]] || n && !t.has(i + "," + a) && e.edgeLabels[i][a] !== s.edgeLabels[r[i]][r[a]]))
          return !1;
    return !0;
  }
}
const O = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: k,
  UllmannGraphMatcher: I
}, Symbol.toStringTag, { value: "Module" }));
class j {
  constructor(e) {
    f(this, "mappings");
    f(this, "cycles", []);
    if (this.mappings = e, new Set(e.values()).size !== e.size)
      throw "Automorphism is not bijective";
    const s = /* @__PURE__ */ new Set(), r = [...e.keys()].sort();
    for (const t of r)
      if (!s.has(t)) {
        s.add(t);
        const n = [t];
        for (; e.has(n[n.length - 1]); ) {
          const o = e.get(n[n.length - 1]);
          if (s.add(o), o !== n[0])
            n.push(o);
          else
            break;
        }
        n.length > 1 && this.cycles.push(n);
      }
  }
  apply(e) {
    return this.mappings.get(e);
  }
  /**
   * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
   */
  compose(e) {
    const s = /* @__PURE__ */ new Map();
    for (const r of this.mappings.keys()) {
      const t = e.apply(r), n = this.apply(t);
      s.set(r, n);
    }
    return new j(s);
  }
  reverse() {
    return new j(
      new Map([...this.mappings.entries()].map(([e, s]) => [s, e]))
    );
  }
  equals(e) {
    for (const s of this.mappings.keys())
      if (this.mappings.get(s) !== e.mappings.get(s))
        return !1;
    return !0;
  }
  isIdentity() {
    for (const e of this.mappings.keys())
      if (this.mappings.get(e) !== e)
        return !1;
    return !0;
  }
  toString() {
    return this.cycles.length === 0 ? "()" : this.cycles.map((e) => `(${e.join(" ")})`).sort().join("");
  }
}
class P {
  constructor(e, s) {
    f(this, "generators");
    if (e.some((r) => r.isIdentity()))
      this.generators = [...e];
    else {
      const r = new j(
        new Map(Array.from({ length: s }, (t, n) => [n, n]))
      );
      this.generators = [r, ...e];
    }
  }
  orbitOf(e) {
    const s = /* @__PURE__ */ new Set();
    s.add(e);
    for (const r of this.generators)
      s.add(r.apply(e));
    return Array.from(s).sort();
  }
  stabilizerOf(e) {
    return this.generators.filter((s) => s.apply(e) === e);
  }
  stabilizerSizeOf(e) {
    return this.generators.reduce(
      (s, r) => s += r.apply(e) === e ? 1 : 0,
      0
    );
  }
  /**
   * Orbit size of x via Orbit–Stabilizer Theorem.
   */
  orbitSizeOf(e) {
    return this.generators.length / this.stabilizerSizeOf(e);
  }
  orbits() {
    const e = /* @__PURE__ */ new Set(), s = [];
    for (const r of this.generators[0].mappings.keys())
      if (!e.has(r)) {
        const t = this.orbitOf(r);
        t.forEach((n) => e.add(n)), s.push(t);
      }
    return s;
  }
  closure() {
    const e = [], s = /* @__PURE__ */ new Set(), r = (n) => {
      const o = n.toString();
      s.has(o) || (e.push(n), s.add(o));
    }, t = [
      ...this.generators,
      ...this.generators.map((n) => n.reverse())
    ];
    for (t.forEach((n) => r(n)); t.length > 0; ) {
      const n = t.pop();
      for (const o of e)
        r(n.compose(o)), r(o.compose(n));
    }
    return e;
  }
  toString() {
    return "[" + this.generators.map((e) => e.toString()).join(", ") + "]";
  }
}
const M = class M {
  constructor(e, s = M.DefaultNodeKeySuffixGenerator, r = M.DefaultNodePropertiesMapper, t = M.DefaultNodePropertiesCanonKeyMapper) {
    f(this, "nodeCount");
    f(this, "hasNodeLabels");
    f(this, "hasNodeProperties");
    f(this, "hasEdgeLabels");
    f(this, "isSymmetric");
    f(this, "graph");
    f(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    f(this, "nodeKeys", /* @__PURE__ */ new Map());
    f(this, "nodePropertiesMapper");
    f(this, "nodePropertiesCanonKeyMapper");
    f(this, "graphStringBuilder");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = r, this.nodePropertiesCanonKeyMapper = t;
    let n = !0;
    for (let o = 0; o < this.nodeCount; o++) {
      const i = /* @__PURE__ */ new Set();
      let a = 0, c = 0;
      for (let h = 0; h < this.nodeCount; h++) {
        const y = e.adjacencyMatrix[o][h], d = e.adjacencyMatrix[h][o];
        y === 1 && (c++, i.add(h)), d === 1 && (a++, i.add(h)), y !== d && (n = !1);
      }
      this.nodeNeighbors.set(o, [...i]);
      const l = c + "|" + a + "|" + s(e, o);
      this.nodeKeys.set(o, l);
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
    const s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
    this.individualizeDFS(
      e,
      [],
      r,
      this.handleRepresentationCurry(s, r)
    );
    const t = [...s.keys()].sort(
      (l, h) => l.localeCompare(h)
    )[0], n = s.get(t), o = new Array(this.nodeCount), i = new Array(o.length);
    [...n.partitions[0].entries()].forEach(([l, h]) => {
      o[h] = l, i[l - 1] = h;
    });
    const a = this.buildRepresentationGraph(
      o
    ), c = /* @__PURE__ */ new Map();
    return [...s.values()].forEach(
      (l) => [...l.automorphisms.entries()].forEach(
        ([h, y]) => c.set(h, y)
      )
    ), [
      a,
      this.buildGraphString(a),
      i,
      new P([...c.values()], this.nodeCount)
    ];
  }
  handleRepresentationCurry(e, s) {
    const r = Array.from({ length: this.nodeCount }, (t, n) => n + 1);
    return (t, n) => {
      const o = /* @__PURE__ */ new Map();
      t.forEach((c, l) => o.set(c, l));
      const i = r.map(
        (c) => this.nodeNeighbors.get(o.get(c)).map((l) => t[l]).sort().join(";")
      ).join("|");
      let a = e.get(i);
      a === void 0 && (a = {
        partitions: [],
        automorphisms: /* @__PURE__ */ new Map()
      }, e.set(i, a));
      for (const c of a.partitions) {
        const l = /* @__PURE__ */ new Map();
        for (let d = 0; d < t.length; d++) {
          const b = c.get(t[d]);
          l.set(d, b);
        }
        const h = new j(l), y = h.toString();
        if (!a.automorphisms.has(y)) {
          a.automorphisms.set(y, h);
          for (const d of h.mappings)
            if (d[0] !== d[1])
              for (let b = 0; b < n.length; b++)
                n[b] === d[0] ? s.add([...n.slice(0, b), d[1]].join("|")) : n[b] === d[1] && s.add([...n.slice(0, b), d[0]].join("|"));
        }
      }
      a.partitions.push(o);
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
    const s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
    this.individualizeDFS(
      e,
      [],
      r,
      this.handleRepresentationCurry(s, r)
    );
    const t = /* @__PURE__ */ new Map();
    return [...s.values()].forEach(
      (n) => [...n.automorphisms.entries()].forEach(
        ([o, i]) => t.set(o, i)
      )
    ), new P(
      [...t.values()],
      this.nodeCount
    );
  }
  partitionByPropertyKeys(e) {
    const s = /* @__PURE__ */ new Map();
    for (let t = 0; t < this.nodeCount; t++) {
      const n = this.nodeKeys.get(t);
      s.has(n) ? s.get(n).push(t) : s.set(n, [t]);
    }
    let r = 1;
    Array.from(s.keys()).sort((t, n) => t.localeCompare(n)).forEach((t) => {
      const n = s.get(t);
      n.forEach((o) => e[o] = r), r += n.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, s, r, t) {
    if (this.isCanon(e)) {
      t(e, s);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      t(e, s);
      return;
    }
    const n = this.getCellToBreak(e);
    for (const o of n[1])
      e[o] = n[0] + 1;
    for (const o of n[1]) {
      const i = [...s, o];
      r.has(i.join("|")) || (e[o] = n[0], this.individualizeDFS(
        [...e],
        i,
        r,
        t
      ), e[o] = n[0] + 1);
    }
  }
  individualizationRefinement(e) {
    let s = !1;
    for (; !s; ) {
      s = !0;
      const r = e.map((n, o) => this.nodeNeighbors.get(o).map((a) => {
        if (this.hasEdgeLabels) {
          const c = this.graph.edgeLabels;
          return this.isSymmetric ? `${e[a]};${c[o][a]}` : `${e[a]};${c[o][a]};${c[a][o]}`;
        }
        return e[a].toString();
      }).sort().join("|")), t = /* @__PURE__ */ new Map();
      r.forEach((n, o) => {
        const i = e[o];
        let a = t.get(i);
        a === void 0 && (a = /* @__PURE__ */ new Map(), t.set(i, a));
        let c = a.get(n);
        c === void 0 && (c = [], a.set(n, c)), c.push(o);
      });
      for (let n = 1; n <= this.nodeCount; n++) {
        const o = t.get(n);
        if (o === void 0 || o.size < 2)
          continue;
        s = !1;
        const i = [...o.keys()].sort((c, l) => l.localeCompare(c));
        let a = n;
        for (const c of i) {
          const l = o.get(c);
          l.forEach((h) => e[h] = a), a += l.length;
        }
        break;
      }
    }
  }
  getCellToBreak(e) {
    const s = Array.from({ length: e.length }, () => []);
    e.forEach((r, t) => s[r - 1].push(t));
    for (let r = 0; r < s.length; r++)
      if (s[r].length > 1)
        return [r + 1, s[r]];
    return [1, s[0]];
  }
  buildRepresentationGraph(e) {
    const s = e.map((t) => t - 1), r = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    if (this.isSymmetric)
      for (let t = 0; t < this.nodeCount; t++) {
        const n = s[t], o = this.graph.adjacencyMatrix[t];
        for (let i = t; i < this.nodeCount; i++)
          r.adjacencyMatrix[n][s[i]] = o[i], r.adjacencyMatrix[s[i]][n] = o[i];
      }
    else
      for (let t = 0; t < this.nodeCount; t++) {
        const n = s[t], o = this.graph.adjacencyMatrix[t];
        for (let i = 0; i < this.nodeCount; i++)
          r.adjacencyMatrix[n][s[i]] = o[i];
      }
    if (this.hasNodeLabels && (r.labels = new Array(this.nodeCount), s.forEach((t, n) => r.labels[t] = this.graph.labels[n])), this.hasNodeProperties && (r.nodeProperties = new Array(this.nodeCount), s.forEach(
      (t, n) => r.nodeProperties[t] = this.nodePropertiesMapper(
        this.graph,
        n,
        s
      )
    )), this.hasEdgeLabels)
      if (r.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let t = 0; t < this.nodeCount; t++) {
          const n = s[t], o = this.graph.edgeLabels[t];
          for (let i = t; i < this.nodeCount; i++)
            r.edgeLabels[n][s[i]] = o[i], r.edgeLabels[s[i]][n] = o[i];
        }
      else
        for (let t = 0; t < this.nodeCount; t++) {
          const n = s[t], o = this.graph.edgeLabels[t];
          for (let i = 0; i < this.nodeCount; i++)
            r.edgeLabels[n][s[i]] = o[i];
        }
    return r;
  }
  buildGraphStringCurry() {
    const e = this.hasEdgeLabels ? (t, n, o) => `${n}-${t.edgeLabels[n][o]}-${o}` : (t, n, o) => `${n}-${o}`, s = this.hasNodeProperties ? (t, n) => {
      const o = this.nodePropertiesCanonKeyMapper(
        t,
        n
      );
      return o.length > 0 ? `{${o}}` : "";
    } : (t, n) => "", r = this.hasNodeLabels ? (t) => ";" + t.labels.map((n, o) => n + s(t, o)).join("|") : this.hasNodeProperties ? (t) => ";" + t.nodeProperties.map(
      (n, o) => this.nodePropertiesCanonKeyMapper(t, o)
    ).join("|") : (t) => "";
    return this.isSymmetric ? (t) => {
      const n = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const i = t.adjacencyMatrix[o];
        for (let a = o; a < this.nodeCount; a++)
          i[a] === 1 && n.push(e(t, o, a));
      }
      return M.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";sym;" + n.join("|") + r(t);
    } : (t) => {
      const n = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const i = t.adjacencyMatrix[o];
        for (let a = 0; a < this.nodeCount; a++)
          i[a] === 1 && n.push(e(t, o, a));
      }
      return M.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";" + n.join("|") + r(t);
    };
  }
  buildGraphString(e) {
    return this.graphStringBuilder(e);
  }
};
f(M, "KEY_VERSION", "v2"), f(M, "DefaultNodeKeySuffixGenerator", (e, s) => e.labels ? e.labels[s] : ""), f(M, "DefaultNodePropertiesMapper", (e, s, r) => e.nodeProperties && e.nodeProperties[s] ? new Map(e.nodeProperties[s]) : void 0), f(M, "DefaultNodePropertiesCanonKeyMapper", (e, s) => "");
let E = M;
const K = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: E
}, Symbol.toStringTag, { value: "Module" }));
class N {
  static find(e) {
    const s = [], r = /* @__PURE__ */ new Set(), t = (n, o) => {
      r.add(n), o.push(n);
      for (let i = 0; i < e.adjacencyMatrix.length; i++)
        (e.adjacencyMatrix[n][i] === 1 || e.adjacencyMatrix[i][n] === 1) && (r.has(i) || t(i, o));
    };
    for (let n = 0; n < e.adjacencyMatrix.length; n++)
      if (!r.has(n)) {
        const o = [];
        t(n, o), s.push(o);
      }
    return s;
  }
}
function z(p) {
  const e = p.adjacencyMatrix.length;
  let s = [];
  for (let r = 0; r < e; r++)
    for (let t = r + 1; t < e; t++)
      p.adjacencyMatrix[r][t] !== 0 && s.push(`e ${r + 1} ${t + 1}`);
  return [`p edge ${e} ${s.length}`, ...s].join(`
`);
}
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: N,
  canon: K,
  matching: O,
  symmetricGraphToDIMACS: z
}, Symbol.toStringTag, { value: "Module" }));
export {
  _ as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
