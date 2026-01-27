var k = Object.defineProperty;
var K = (m, e, s) => e in m ? k(m, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : m[e] = s;
var h = (m, e, s) => K(m, typeof e != "symbol" ? e + "" : e, s);
class D {
}
class A extends D {
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
    const o = e.adjacencyMatrix.length, r = s.adjacencyMatrix.length;
    if (o > r)
      return !1;
    n === null && (n = new Array(o).fill(-1));
    const a = e.labels && s.labels, c = Array(r).fill(!1), l = Array(o).fill(-1), f = new Set(i), y = new Set(t), [
      d,
      p,
      x,
      L
    ] = this.getInOutDegrees(e, s), v = d.map(
      (M, u) => x.map((g, S) => g >= M && L[S] >= p[u] && (n[u] === -1 || n[u] === S) && (!a || f.has(u) || e.labels[u] === s.labels[S]) ? S : -1).filter((g) => g !== -1)
    ), w = (M) => {
      if (M === o)
        return this.checkCompatibility(
          e,
          s,
          l,
          y
        );
      for (const u of v[M])
        if (!c[u]) {
          if (l[M] = u, c[u] = !0, this.isFeasible(
            e,
            s,
            l,
            M,
            y
          ) && w(M + 1))
            return !0;
          c[u] = !1, l[M] = -1;
        }
      return !1;
    };
    return w(0);
  }
  getInOutDegrees(e, s) {
    const i = e.adjacencyMatrix.map(
      (r) => r.reduce((a, c) => a + c, 0)
    ), t = [], n = s.adjacencyMatrix.map(
      (r) => r.reduce((a, c) => a + c, 0)
    ), o = [];
    return e.adjacencyMatrix.forEach((r, a) => {
      t.push(
        r.map((c, l) => e.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), s.adjacencyMatrix.forEach((r, a) => {
      o.push(
        r.map((c, l) => s.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), [
      i,
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
  findAllSubgraphMonomorphisms(e, s, i = [], t = [], n = null) {
    const o = e.adjacencyMatrix.length, r = s.adjacencyMatrix.length, a = [], c = new Set(i), l = new Set(t);
    if (o > r)
      return a;
    n === null && (n = new Array(o).fill(-1));
    const f = e.labels && s.labels, y = Array(r).fill(!1), d = Array(o).fill(-1), [
      p,
      x,
      L,
      v
    ] = this.getInOutDegrees(e, s), w = p.map(
      (u, g) => L.map((S, C) => S >= u && v[C] >= x[g] && (n[g] === -1 || n[g] === C) && (!f || c.has(g) || e.labels[g] === s.labels[C]) ? C : -1).filter((S) => S !== -1)
    ), M = (u) => {
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
        ) && M(u + 1), y[g] = !1, d[u] = -1);
    };
    return M(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, s, i, t, n) {
    const o = e.edgeLabels && s.edgeLabels;
    for (let r = 0; r < t; r++)
      if (e.adjacencyMatrix[t][r] && (!s.adjacencyMatrix[i[t]][i[r]] || o && !n.has(t + "," + r) && e.edgeLabels[t][r] !== s.edgeLabels[i[t]][i[r]]) || e.adjacencyMatrix[r][t] && (!s.adjacencyMatrix[i[r]][i[t]] || o && !n.has(r + "," + t) && e.edgeLabels[r][t] !== s.edgeLabels[i[r]][i[t]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, s, i, t) {
    const n = e.edgeLabels && s.edgeLabels, o = e.adjacencyMatrix.length;
    for (let r = 0; r < o; r++)
      for (let a = 0; a < o; a++)
        if (e.adjacencyMatrix[r][a] && (!s.adjacencyMatrix[i[r]][i[a]] || n && !t.has(r + "," + a) && e.edgeLabels[r][a] !== s.edgeLabels[i[r]][i[a]]))
          return !1;
    return !0;
  }
}
const I = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: D,
  UllmannGraphMatcher: A
}, Symbol.toStringTag, { value: "Module" }));
class j {
  constructor(e) {
    h(this, "mappings");
    h(this, "cycles", []);
    if (this.mappings = e, new Set(e.values()).size !== e.size)
      throw "Automorphism is not bijective";
    const s = /* @__PURE__ */ new Set(), i = [...e.keys()].sort();
    for (const t of i)
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
    for (const i of this.mappings.keys()) {
      const t = e.apply(i), n = this.apply(t);
      s.set(i, n);
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
    h(this, "generators");
    if (e.some((i) => i.isIdentity()))
      this.generators = [...e];
    else {
      const i = new j(
        new Map(Array.from({ length: s }, (t, n) => [n, n]))
      );
      this.generators = [i, ...e];
    }
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
   * Orbit size of x via Orbit–Stabilizer Theorem.
   */
  orbitSizeOf(e) {
    return this.generators.length / this.stabilizerSizeOf(e);
  }
  orbits() {
    const e = /* @__PURE__ */ new Set(), s = [];
    for (const i of this.generators[0].mappings.keys())
      if (!e.has(i)) {
        const t = this.orbitOf(i);
        t.forEach((n) => e.add(n)), s.push(t);
      }
    return s;
  }
  closure() {
    const e = [], s = /* @__PURE__ */ new Set(), i = (n) => {
      const o = n.toString();
      s.has(o) || (e.push(n), s.add(o));
    }, t = [
      ...this.generators,
      ...this.generators.map((n) => n.reverse())
    ];
    for (t.forEach((n) => i(n)); t.length > 0; ) {
      const n = t.pop();
      for (const o of e)
        i(n.compose(o)), i(o.compose(n));
    }
    return e;
  }
  toString() {
    return "[" + this.generators.map((e) => e.toString()).join(", ") + "]";
  }
}
const b = class b {
  constructor(e, s = b.DefaultNodeKeySuffixGenerator, i = b.DefaultNodePropertiesMapper, t = b.DefaultNodeLabelCanonKeyMapper, n = b.DefaultNodePropertiesCanonKeyMapper) {
    h(this, "nodeCount");
    h(this, "hasNodeLabels");
    h(this, "hasNodeProperties");
    h(this, "hasEdgeLabels");
    h(this, "isSymmetric");
    h(this, "graph");
    h(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    h(this, "nodeKeys", /* @__PURE__ */ new Map());
    h(this, "nodePropertiesMapper");
    h(this, "nodeLabelCanonKeyMapper");
    h(this, "nodePropertiesCanonKeyMapper");
    h(this, "graphStringBuilder");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = i, this.nodeLabelCanonKeyMapper = t, this.nodePropertiesCanonKeyMapper = n;
    let o = !0;
    for (let r = 0; r < this.nodeCount; r++) {
      const a = /* @__PURE__ */ new Set();
      let c = 0, l = 0;
      for (let y = 0; y < this.nodeCount; y++) {
        const d = e.adjacencyMatrix[r][y], p = e.adjacencyMatrix[y][r];
        d === 1 && (l++, a.add(y)), p === 1 && (c++, a.add(y)), d !== p && (o = !1);
      }
      this.nodeNeighbors.set(r, [...a]);
      const f = l + "|" + c + "|" + s(e, r);
      this.nodeKeys.set(r, f);
    }
    this.isSymmetric = o, this.graphStringBuilder = this.buildGraphStringCurry();
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
      (l, f) => l.localeCompare(f)
    )[0], n = s.get(t), o = new Array(this.nodeCount), r = new Array(o.length);
    [...n.partitions[0].entries()].forEach(([l, f]) => {
      o[f] = l, r[l - 1] = f;
    });
    const a = this.buildRepresentationGraph(
      o
    ), c = /* @__PURE__ */ new Map();
    return [...s.values()].forEach(
      (l) => [...l.automorphisms.entries()].forEach(
        ([f, y]) => c.set(f, y)
      )
    ), [
      a,
      this.buildGraphString(a),
      r,
      new P([...c.values()], this.nodeCount)
    ];
  }
  handleRepresentationCurry(e, s) {
    const i = Array.from({ length: this.nodeCount }, (t, n) => n + 1);
    return (t, n) => {
      const o = /* @__PURE__ */ new Map();
      t.forEach((c, l) => o.set(c, l));
      const r = i.map(
        (c) => this.nodeNeighbors.get(o.get(c)).map((l) => t[l]).sort().join(";")
      ).join("|");
      let a = e.get(r);
      a === void 0 && (a = {
        partitions: [],
        automorphisms: /* @__PURE__ */ new Map()
      }, e.set(r, a));
      for (const c of a.partitions) {
        const l = /* @__PURE__ */ new Map();
        for (let d = 0; d < t.length; d++) {
          const p = c.get(t[d]);
          l.set(d, p);
        }
        const f = new j(l), y = f.toString();
        if (!a.automorphisms.has(y)) {
          a.automorphisms.set(y, f);
          for (const d of f.mappings)
            if (d[0] !== d[1])
              for (let p = 0; p < n.length; p++)
                n[p] === d[0] ? s.add([...n.slice(0, p), d[1]].join("|")) : n[p] === d[1] && s.add([...n.slice(0, p), d[0]].join("|"));
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
        ([o, r]) => t.set(o, r)
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
    let i = 1;
    Array.from(s.keys()).sort((t, n) => t.localeCompare(n)).forEach((t) => {
      const n = s.get(t);
      n.forEach((o) => e[o] = i), i += n.length;
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
    for (const o of n[1])
      e[o] = n[0] + 1;
    for (const o of n[1]) {
      const r = [...s, o];
      i.has(r.join("|")) || (e[o] = n[0], this.individualizeDFS(
        [...e],
        r,
        i,
        t
      ), e[o] = n[0] + 1);
    }
  }
  individualizationRefinement(e) {
    let s = !1;
    for (; !s; ) {
      s = !0;
      const i = e.map((n, o) => this.nodeNeighbors.get(o).map((a) => {
        if (this.hasEdgeLabels) {
          const c = this.graph.edgeLabels;
          return this.isSymmetric ? `${e[a]};${c[o][a]}` : `${e[a]};${c[o][a]};${c[a][o]}`;
        }
        return e[a].toString();
      }).sort().join("|")), t = /* @__PURE__ */ new Map();
      i.forEach((n, o) => {
        const r = e[o];
        let a = t.get(r);
        a === void 0 && (a = /* @__PURE__ */ new Map(), t.set(r, a));
        let c = a.get(n);
        c === void 0 && (c = [], a.set(n, c)), c.push(o);
      });
      for (let n = 1; n <= this.nodeCount; n++) {
        const o = t.get(n);
        if (o === void 0 || o.size < 2)
          continue;
        s = !1;
        const r = [...o.keys()].sort((c, l) => l.localeCompare(c));
        let a = n;
        for (const c of r) {
          const l = o.get(c);
          l.forEach((f) => e[f] = a), a += l.length;
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
        const n = s[t], o = this.graph.adjacencyMatrix[t];
        for (let r = t; r < this.nodeCount; r++)
          i.adjacencyMatrix[n][s[r]] = o[r], i.adjacencyMatrix[s[r]][n] = o[r];
      }
    else
      for (let t = 0; t < this.nodeCount; t++) {
        const n = s[t], o = this.graph.adjacencyMatrix[t];
        for (let r = 0; r < this.nodeCount; r++)
          i.adjacencyMatrix[n][s[r]] = o[r];
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
          const n = s[t], o = this.graph.edgeLabels[t];
          for (let r = t; r < this.nodeCount; r++)
            i.edgeLabels[n][s[r]] = o[r], i.edgeLabels[s[r]][n] = o[r];
        }
      else
        for (let t = 0; t < this.nodeCount; t++) {
          const n = s[t], o = this.graph.edgeLabels[t];
          for (let r = 0; r < this.nodeCount; r++)
            i.edgeLabels[n][s[r]] = o[r];
        }
    return i;
  }
  buildGraphStringCurry() {
    const e = this.hasEdgeLabels ? (t, n, o) => `${n}-${t.edgeLabels[n][o]}-${o}` : (t, n, o) => `${n}-${o}`, s = this.hasNodeProperties ? (t, n) => {
      const o = this.nodePropertiesCanonKeyMapper(
        t,
        n
      );
      return o.length > 0 ? `{${o}}` : "";
    } : (t, n) => "", i = this.hasNodeLabels ? (t) => ";" + t.labels.map(
      (n, o) => this.nodeLabelCanonKeyMapper(t, o) + s(t, o)
    ).join("|") : this.hasNodeProperties ? (t) => ";" + t.nodeProperties.map(
      (n, o) => this.nodePropertiesCanonKeyMapper(t, o)
    ).join("|") : (t) => "";
    return this.isSymmetric ? (t) => {
      const n = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const r = t.adjacencyMatrix[o];
        for (let a = o; a < this.nodeCount; a++)
          r[a] === 1 && n.push(e(t, o, a));
      }
      return b.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";sym;" + n.join("|") + i(t);
    } : (t) => {
      const n = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const r = t.adjacencyMatrix[o];
        for (let a = 0; a < this.nodeCount; a++)
          r[a] === 1 && n.push(e(t, o, a));
      }
      return b.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";" + n.join("|") + i(t);
    };
  }
  buildGraphString(e) {
    return this.graphStringBuilder(e);
  }
};
h(b, "KEY_VERSION", "v2"), h(b, "DefaultNodeKeySuffixGenerator", (e, s) => e.labels ? e.labels[s] : ""), h(b, "DefaultNodePropertiesMapper", (e, s, i) => e.nodeProperties && e.nodeProperties[s] ? new Map(e.nodeProperties[s]) : void 0), h(b, "DefaultNodeLabelCanonKeyMapper", (e, s) => e.labels ? e.labels[s] : ""), h(b, "DefaultNodePropertiesCanonKeyMapper", (e, s) => "");
let E = b;
const O = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: E
}, Symbol.toStringTag, { value: "Module" }));
class N {
  static find(e) {
    const s = [], i = /* @__PURE__ */ new Set(), t = (n, o) => {
      i.add(n), o.push(n);
      for (let r = 0; r < e.adjacencyMatrix.length; r++)
        (e.adjacencyMatrix[n][r] === 1 || e.adjacencyMatrix[r][n] === 1) && (i.has(r) || t(r, o));
    };
    for (let n = 0; n < e.adjacencyMatrix.length; n++)
      if (!i.has(n)) {
        const o = [];
        t(n, o), s.push(o);
      }
    return s;
  }
}
function z(m) {
  const e = m.adjacencyMatrix.length;
  let s = [];
  for (let i = 0; i < e; i++)
    for (let t = i + 1; t < e; t++)
      m.adjacencyMatrix[i][t] !== 0 && s.push(`e ${i + 1} ${t + 1}`);
  return [`p edge ${e} ${s.length}`, ...s].join(`
`);
}
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: N,
  canon: O,
  matching: I,
  symmetricGraphToDIMACS: z
}, Symbol.toStringTag, { value: "Module" }));
export {
  _ as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
