var P = Object.defineProperty;
var N = (S, e, n) => e in S ? P(S, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : S[e] = n;
var d = (S, e, n) => N(S, typeof e != "symbol" ? e + "" : e, n);
class E {
}
class I extends E {
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
  isSubgraphIsomorphic(e, n, o = [], t = [], s = null) {
    const i = e.adjacencyMatrix.length, r = n.adjacencyMatrix.length;
    if (i > r)
      return !1;
    s === null && (s = new Array(i).fill(-1));
    const a = e.labels && n.labels, l = Array(r).fill(!1), c = Array(i).fill(-1), m = new Set(o), g = new Set(t), [
      u,
      h,
      f,
      y
    ] = this.getInOutDegrees(e, n), p = u.map(
      (j, b) => f.map((w, C) => w >= j && y[C] >= h[b] && (s[b] === -1 || s[b] === C) && (!a || m.has(b) || e.labels[b] === n.labels[C]) ? C : -1).filter((w) => w !== -1)
    ), x = (j) => {
      if (j === i)
        return this.checkCompatibility(
          e,
          n,
          c,
          g
        );
      for (const b of p[j])
        if (!l[b]) {
          if (c[j] = b, l[b] = !0, this.isFeasible(
            e,
            n,
            c,
            j,
            g
          ) && x(j + 1))
            return !0;
          l[b] = !1, c[j] = -1;
        }
      return !1;
    };
    return x(0);
  }
  getInOutDegrees(e, n) {
    const o = e.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), t = [], s = n.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), i = [];
    return e.adjacencyMatrix.forEach((r, a) => {
      t.push(
        r.map((l, c) => e.adjacencyMatrix[c][a]).reduce((l, c) => l + c, 0)
      );
    }), n.adjacencyMatrix.forEach((r, a) => {
      i.push(
        r.map((l, c) => n.adjacencyMatrix[c][a]).reduce((l, c) => l + c, 0)
      );
    }), [
      o,
      t,
      s,
      i
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
  findAllSubgraphMonomorphisms(e, n, o = [], t = [], s = null) {
    const i = e.adjacencyMatrix.length, r = n.adjacencyMatrix.length, a = [], l = new Set(o), c = new Set(t);
    if (i > r)
      return a;
    s === null && (s = new Array(i).fill(-1));
    const m = e.labels && n.labels, g = Array(r).fill(!1), u = Array(i).fill(-1), [
      h,
      f,
      y,
      p
    ] = this.getInOutDegrees(e, n), x = h.map(
      (b, w) => y.map((C, D) => C >= b && p[D] >= f[w] && (s[w] === -1 || s[w] === D) && (!m || l.has(w) || e.labels[w] === n.labels[D]) ? D : -1).filter((C) => C !== -1)
    ), j = (b) => {
      if (b === i) {
        this.checkCompatibility(
          e,
          n,
          u,
          c
        ) && a.push([...u]);
        return;
      }
      for (const w of x[b])
        g[w] || (u[b] = w, g[w] = !0, this.isFeasible(
          e,
          n,
          u,
          b,
          c
        ) && j(b + 1), g[w] = !1, u[b] = -1);
    };
    return j(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, n, o, t, s) {
    const i = e.edgeLabels && n.edgeLabels;
    for (let r = 0; r < t; r++)
      if (e.adjacencyMatrix[t][r] && (!n.adjacencyMatrix[o[t]][o[r]] || i && !s.has(t + "," + r) && e.edgeLabels[t][r] !== n.edgeLabels[o[t]][o[r]]) || e.adjacencyMatrix[r][t] && (!n.adjacencyMatrix[o[r]][o[t]] || i && !s.has(r + "," + t) && e.edgeLabels[r][t] !== n.edgeLabels[o[r]][o[t]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, n, o, t) {
    const s = e.edgeLabels && n.edgeLabels, i = e.adjacencyMatrix.length;
    for (let r = 0; r < i; r++)
      for (let a = 0; a < i; a++)
        if (e.adjacencyMatrix[r][a] && (!n.adjacencyMatrix[o[r]][o[a]] || s && !t.has(r + "," + a) && e.edgeLabels[r][a] !== n.edgeLabels[o[r]][o[a]]))
          return !1;
    return !0;
  }
}
const O = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: E,
  UllmannGraphMatcher: I
}, Symbol.toStringTag, { value: "Module" })), L = class L {
  constructor(e) {
    d(this, "mappings");
    d(this, "cycles", []);
    if (this.mappings = e, new Set(e).size !== e.length)
      throw "Automorphism is not bijective";
    const n = /* @__PURE__ */ new Set(), o = [...e.keys()].sort();
    for (const t of o)
      if (!n.has(t)) {
        n.add(t);
        const s = [t];
        for (; ; ) {
          const i = e[s[s.length - 1]];
          if (n.add(i), i !== s[0])
            s.push(i);
          else
            break;
        }
        s.length > 1 && this.cycles.push(s);
      }
  }
  apply(e) {
    return this.mappings[e];
  }
  /**
   * Compose this automorphism (f) with another one (g): (f ∘ g)(x) = f(g(x))
   */
  compose(e) {
    const n = new Array(this.mappings.length);
    for (let o = 0; o < this.mappings.length; o++) {
      const t = e.apply(o), s = this.apply(t);
      n[o] = s;
    }
    return new L(n);
  }
  reverse() {
    const e = new Array(this.mappings.length);
    for (let n = 0; n < this.mappings.length; n++)
      e[this.mappings[n]] = n;
    return new L(e);
  }
  equals(e) {
    for (let n = 0; n < this.mappings.length; n++)
      if (this.mappings[n] !== e.mappings[n])
        return !1;
    return !0;
  }
  isIdentity() {
    for (let e = 0; e < this.mappings.length; e++)
      if (this.mappings[e] !== e)
        return !1;
    return !0;
  }
  toString() {
    return this.cycles.length === 0 ? "()" : this.cycles.map((e) => `(${e.join(" ")})`).sort().join("");
  }
  static identity(e) {
    return new L(Array.from({ length: e }, (n, o) => o));
  }
};
d(L, "fromCycleNotation", (e, n) => {
  const o = Array.from({ length: e }, (t, s) => s);
  return n.split("(").filter((t) => t.length > 1).map(
    (t) => t.replace(")", "").split(/\s+/).filter((s) => s.length > 0).map((s) => parseInt(s))
  ).forEach((t) => {
    for (let s = 0; s < t.length; s++)
      o[t[s]] = t[(s + 1) % t.length];
  }), new L(o);
});
let A = L;
class v {
  constructor(e, n) {
    d(this, "generators");
    d(this, "n");
    this.n = n, e.some((o) => o.isIdentity()) ? this.generators = [...e] : this.generators = [A.identity(n), ...e];
  }
  orbitOf(e) {
    const n = /* @__PURE__ */ new Set();
    n.add(e);
    for (const o of this.generators)
      n.add(o.apply(e));
    return Array.from(n).sort();
  }
  stabilizerOf(e) {
    return this.generators.filter((n) => n.apply(e) === e);
  }
  stabilizerSizeOf(e) {
    return this.generators.reduce(
      (n, o) => n += o.apply(e) === e ? 1 : 0,
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
    const e = /* @__PURE__ */ new Set(), n = [];
    for (const o of this.generators[0].mappings.keys())
      if (!e.has(o)) {
        const t = this.orbitOf(o);
        t.forEach((s) => e.add(s)), n.push(t);
      }
    return n;
  }
  closure() {
    const e = [], n = /* @__PURE__ */ new Set(), o = (s) => {
      const i = s.toString();
      n.has(i) || (e.push(s), n.add(i));
    }, t = [
      ...this.generators,
      ...this.generators.map((s) => s.reverse())
    ];
    for (t.forEach((s) => o(s)); t.length > 0; ) {
      const s = t.pop();
      for (const i of e)
        o(s.compose(i)), o(i.compose(s));
    }
    return e;
  }
  remap(e) {
    const n = [];
    for (const o of this.generators) {
      const t = Array.from({ length: this.n }, (s, i) => i);
      for (let s = 0; s < this.n; s++)
        t[e[s]] = e[o.mappings[s]];
      n.push(new A(t));
    }
    return new v(n, this.n);
  }
  toString() {
    return "[" + this.generators.map((e) => e.toString()).join(", ") + "]";
  }
}
const M = class M {
  // public static timingsCanonicalize: number[] = [];
  // public static timingsIndividualizeDFS: number[] = [];
  // public static timingsIndividualizationRefinement: number[] = [];
  // public static timingsHandleRepresentation: number[] = [];
  constructor(e, n = M.DefaultNodeKeySuffixGenerator, o = M.DefaultNodePropertiesMapper, t = M.DefaultNodeLabelCanonKeyMapper, s = M.DefaultEdgeLabelCanonKeyMapper, i = M.DefaultNodePropertiesCanonKeyMapper) {
    d(this, "nodeCount");
    d(this, "hasNodeLabels");
    d(this, "hasNodeProperties");
    d(this, "hasEdgeLabels");
    d(this, "isSymmetric");
    d(this, "graph");
    d(this, "nodeNeighbors");
    d(this, "nodeNeighborEdgeSignatures");
    d(this, "nodeKeys", /* @__PURE__ */ new Map());
    d(this, "nodePropertiesMapper");
    d(this, "nodeLabelCanonKeyMapper");
    d(this, "edgeLabelCanonKeyMapper");
    d(this, "nodePropertiesCanonKeyMapper");
    d(this, "graphStringBuilder");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.nodeNeighbors = Array.from({ length: this.nodeCount }, () => []), this.nodeNeighborEdgeSignatures = Array.from(
      { length: this.nodeCount },
      () => []
    ), this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = o, this.nodeLabelCanonKeyMapper = t, this.edgeLabelCanonKeyMapper = s, this.nodePropertiesCanonKeyMapper = i;
    let r = !0;
    for (let a = 0; a < this.nodeCount; a++) {
      const l = this.nodeNeighbors[a], c = this.nodeNeighborEdgeSignatures[a];
      let m = 0, g = 0;
      for (let h = 0; h < this.nodeCount; h++) {
        const f = e.adjacencyMatrix[a][h], y = e.adjacencyMatrix[h][a];
        if (f === 1 && g++, y === 1 && m++, f !== y && (r = !1), (f === 1 || y === 1) && l.push(h), this.hasEdgeLabels) {
          const p = this.graph.edgeLabels;
          p[a][h] !== p[h][a] ? c.push(
            `;${p[a][h]};${p[h][a]}`
          ) : c.push(`;${p[a][h]}`);
        } else
          c.push("");
      }
      const u = g + "|" + m + "|" + n(e, a);
      this.nodeKeys.set(a, u);
    }
    this.isSymmetric = r, this.graphStringBuilder = this.buildGraphStringCurry();
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
    const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), t = new Array(this.nodeCount).fill(-1);
    this.individualizeDFS(
      e,
      t,
      0,
      o,
      this.handleRepresentationCurry(n, o)
    );
    const s = [...n.keys()].sort(
      (u, h) => u.localeCompare(h)
    )[0], i = n.get(s), r = new Array(this.nodeCount), a = new Array(r.length);
    [...i.partitions[0].entries()].forEach(([u, h]) => {
      r[h] = u + 1, a[u] = h;
    });
    const l = this.buildRepresentationGraph(
      r
    ), c = /* @__PURE__ */ new Map();
    for (const u of n.values())
      for (const [h, f] of u.automorphisms)
        c.set(h, f);
    const m = this.buildGraphString(l), g = new v(
      [...c.values()].map((u) => new A(u)),
      this.nodeCount
    );
    return [l, m, a, g];
  }
  handleRepresentationCurry(e, n) {
    const o = Array.from({ length: this.nodeCount }, (i, r) => r), t = [], s = new Array(this.nodeCount);
    return (i, r, a) => {
      const l = new Array(this.nodeCount);
      for (let g = 0; g < this.nodeCount; g++)
        l[i[g] - 1] = g;
      for (let g = 0; g < o.length; g++) {
        const u = o[g], h = this.nodeNeighbors[l[u]];
        t.length = h.length;
        for (let y = 0; y < h.length; y++)
          t[y] = i[h[y]];
        t.sort((y, p) => y - p);
        let f = "" + t[0];
        for (let y = 1; y < t.length; y++)
          f += ";" + t[y];
        s[g] = f;
      }
      const c = s.join("|");
      let m = e.get(c);
      m === void 0 && (m = {
        partitions: [],
        automorphisms: /* @__PURE__ */ new Map()
      }, e.set(c, m));
      for (const g of m.partitions) {
        const u = new Array(this.nodeCount);
        for (let f = 0; f < this.nodeCount; f++)
          u[f] = g[i[f] - 1];
        const h = u.join("|");
        if (!m.automorphisms.has(h)) {
          m.automorphisms.set(h, u);
          for (let f = 0; f < this.nodeCount; f++) {
            const y = u[f];
            if (f !== y)
              for (let p = 0; p < a; p++)
                r[p] === f ? p > 0 ? n.add(r.slice(0, p).join("|") + "|" + y) : n.add(y.toString()) : r[p] === y && (p > 0 ? n.add(r.slice(0, p).join("|") + "|" + f) : n.add(f.toString()));
          }
        }
      }
      m.partitions.push(l);
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
    const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), t = new Array(this.nodeCount).fill(-1);
    this.individualizeDFS(
      e,
      t,
      0,
      o,
      this.handleRepresentationCurry(n, o)
    );
    const s = /* @__PURE__ */ new Map();
    for (const i of n.values())
      for (const [r, a] of i.automorphisms)
        s.set(r, a);
    return new v(
      [...s.values()].map((i) => new A(i)),
      this.nodeCount
    );
  }
  partitionByPropertyKeys(e) {
    const n = /* @__PURE__ */ new Map();
    for (let t = 0; t < this.nodeCount; t++) {
      const s = this.nodeKeys.get(t);
      n.has(s) ? n.get(s).push(t) : n.set(s, [t]);
    }
    let o = 1;
    Array.from(n.keys()).sort((t, s) => t.localeCompare(s)).forEach((t) => {
      const s = n.get(t);
      s.forEach((i) => e[i] = o), o += s.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, n, o, t, s) {
    if (this.isCanon(e)) {
      s(e, n, o);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      s(e, n, o);
      return;
    }
    const [i, r] = this.getCellToBreak(e);
    for (const a of r)
      e[a] = i + 1;
    for (const a of r) {
      if (n[o] = a, t.has(n.slice(0, o + 1).join("|"))) {
        n[o] = -1;
        continue;
      }
      e[a] = i, this.individualizeDFS(
        [...e],
        n,
        o + 1,
        t,
        s
      ), e[a] = i + 1, n[o] = -1;
    }
  }
  individualizationRefinement(e) {
    let n = !1;
    for (; !n; ) {
      n = !0;
      const o = new Array(
        e.length
      ).fill(void 0);
      let t = e.length + 1;
      for (let s = 0; s < e.length; s++) {
        const i = this.nodeNeighborEdgeSignatures[s], r = this.nodeNeighbors[s].map((c) => e[c] + i[c]).sort().join("|"), a = e[s], l = o[a];
        if (l === void 0)
          o[a] = /* @__PURE__ */ new Map([[r, [s]]]);
        else {
          const c = l.get(r);
          c === void 0 ? l.set(r, [s]) : c.push(s), l.size > 1 && (n = !1, a < t && (t = a));
        }
      }
      if (!n) {
        const i = [...o[t].entries()].sort(
          (a, l) => l[0].localeCompare(a[0])
        );
        let r = t;
        for (const [a, l] of i) {
          for (let c = 0; c < l.length; c++)
            e[l[c]] = r;
          r += l.length;
        }
      }
    }
  }
  getCellToBreak(e) {
    let n = e.length;
    const o = new Array(e.length).fill(void 0);
    for (let t = 0; t < e.length; t++) {
      const s = e[t] - 1;
      s > n || (o[s] === void 0 ? o[s] = [t] : (o[s].push(t), s < n && (n = s)));
    }
    if (n !== e.length) {
      const t = o[n];
      if (t !== void 0 && t.length > 1)
        return [n + 1, t];
    }
    return [1, o[0]];
  }
  buildRepresentationGraph(e) {
    const n = e.map((t) => t - 1), o = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    if (this.isSymmetric)
      for (let t = 0; t < this.nodeCount; t++) {
        const s = n[t], i = this.graph.adjacencyMatrix[t];
        for (let r = t; r < this.nodeCount; r++)
          o.adjacencyMatrix[s][n[r]] = i[r], o.adjacencyMatrix[n[r]][s] = i[r];
      }
    else
      for (let t = 0; t < this.nodeCount; t++) {
        const s = n[t], i = this.graph.adjacencyMatrix[t];
        for (let r = 0; r < this.nodeCount; r++)
          o.adjacencyMatrix[s][n[r]] = i[r];
      }
    if (this.hasNodeLabels && (o.labels = new Array(this.nodeCount), n.forEach((t, s) => o.labels[t] = this.graph.labels[s])), this.hasNodeProperties && (o.nodeProperties = new Array(this.nodeCount), n.forEach(
      (t, s) => o.nodeProperties[t] = this.nodePropertiesMapper(
        this.graph,
        s,
        n
      )
    )), this.hasEdgeLabels)
      if (o.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let t = 0; t < this.nodeCount; t++) {
          const s = n[t], i = this.graph.edgeLabels[t];
          for (let r = t; r < this.nodeCount; r++)
            o.edgeLabels[s][n[r]] = i[r], o.edgeLabels[n[r]][s] = i[r];
        }
      else
        for (let t = 0; t < this.nodeCount; t++) {
          const s = n[t], i = this.graph.edgeLabels[t];
          for (let r = 0; r < this.nodeCount; r++)
            o.edgeLabels[s][n[r]] = i[r];
        }
    return o;
  }
  buildGraphStringCurry() {
    const e = this.hasEdgeLabels ? (t, s, i) => `${s}-${this.edgeLabelCanonKeyMapper(t, s, i)}-${i}` : (t, s, i) => `${s}-${i}`, n = this.hasNodeProperties ? (t, s) => {
      const i = this.nodePropertiesCanonKeyMapper(
        t,
        s
      );
      return i.length > 0 ? `{${i}}` : "";
    } : (t, s) => "", o = this.hasNodeLabels ? (t) => ";" + t.labels.map(
      (s, i) => this.nodeLabelCanonKeyMapper(t, i) + n(t, i)
    ).join("|") : this.hasNodeProperties ? (t) => ";" + t.nodeProperties.map(
      (s, i) => this.nodePropertiesCanonKeyMapper(t, i)
    ).join("|") : (t) => "";
    return this.isSymmetric ? (t) => {
      const s = [];
      for (let i = 0; i < this.nodeCount; i++) {
        const r = t.adjacencyMatrix[i];
        for (let a = i; a < this.nodeCount; a++)
          r[a] === 1 && s.push(e(t, i, a));
      }
      return M.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";sym;" + s.join("|") + o(t);
    } : (t) => {
      const s = [];
      for (let i = 0; i < this.nodeCount; i++) {
        const r = t.adjacencyMatrix[i];
        for (let a = 0; a < this.nodeCount; a++)
          r[a] === 1 && s.push(e(t, i, a));
      }
      return M.KEY_VERSION + ";" + t.adjacencyMatrix.length + ";" + s.join("|") + o(t);
    };
  }
  buildGraphString(e) {
    return this.graphStringBuilder(e);
  }
};
d(M, "KEY_VERSION", "v2"), d(M, "DefaultNodeKeySuffixGenerator", (e, n) => e.labels ? e.labels[n] : ""), d(M, "DefaultNodePropertiesMapper", (e, n, o) => e.nodeProperties && e.nodeProperties[n] ? new Map(e.nodeProperties[n]) : void 0), d(M, "DefaultNodeLabelCanonKeyMapper", (e, n) => e.labels ? e.labels[n] : ""), d(M, "DefaultEdgeLabelCanonKeyMapper", (e, n, o) => e.edgeLabels ? e.edgeLabels[n][o] : ""), d(M, "DefaultNodePropertiesCanonKeyMapper", (e, n) => "");
let K = M;
const k = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: K
}, Symbol.toStringTag, { value: "Module" }));
class z {
  static find(e) {
    const n = [], o = /* @__PURE__ */ new Set(), t = (s, i) => {
      o.add(s), i.push(s);
      for (let r = 0; r < e.adjacencyMatrix.length; r++)
        (e.adjacencyMatrix[s][r] === 1 || e.adjacencyMatrix[r][s] === 1) && (o.has(r) || t(r, i));
    };
    for (let s = 0; s < e.adjacencyMatrix.length; s++)
      if (!o.has(s)) {
        const i = [];
        t(s, i), n.push(i);
      }
    return n;
  }
}
function $(S) {
  const e = S.adjacencyMatrix.length;
  let n = [];
  for (let o = 0; o < e; o++)
    for (let t = o + 1; t < e; t++)
      S.adjacencyMatrix[o][t] !== 0 && n.push(`e ${o + 1} ${t + 1}`);
  return [`p edge ${e} ${n.length}`, ...n].join(`
`);
}
const R = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Automorphism: A,
  AutomorphismGroup: v,
  ConnectedComponents: z,
  canon: k,
  matching: O,
  symmetricGraphToDIMACS: $
}, Symbol.toStringTag, { value: "Module" }));
export {
  R as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
