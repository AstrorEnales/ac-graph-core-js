var A = Object.defineProperty;
var _ = (j, t, n) => t in j ? A(j, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : j[t] = n;
var p = (j, t, n) => _(j, typeof t != "symbol" ? t + "" : t, n);
class v {
}
class E extends v {
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
  isSubgraphIsomorphic(t, n, i = [], e = [], s = null) {
    const o = t.adjacencyMatrix.length, r = n.adjacencyMatrix.length;
    if (o > r)
      return !1;
    s === null && (s = new Array(o).fill(-1));
    const a = t.labels && n.labels, l = Array(r).fill(!1), d = Array(o).fill(-1), u = new Set(i), m = new Set(e), [
      M,
      c,
      g,
      y
    ] = this.getInOutDegrees(t, n), x = M.map(
      (f, h) => g.map((b, S) => b >= f && y[S] >= c[h] && (s[h] === -1 || s[h] === S) && (!a || u.has(h) || t.labels[h] === n.labels[S]) ? S : -1).filter((b) => b !== -1)
    ), L = (f) => {
      if (f === o)
        return this.checkCompatibility(
          t,
          n,
          d,
          m
        );
      for (const h of x[f])
        if (!l[h]) {
          if (d[f] = h, l[h] = !0, this.isFeasible(
            t,
            n,
            d,
            f,
            m
          ) && L(f + 1))
            return !0;
          l[h] = !1, d[f] = -1;
        }
      return !1;
    };
    return L(0);
  }
  getInOutDegrees(t, n) {
    const i = t.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), e = [], s = n.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), o = [];
    return t.adjacencyMatrix.forEach((r, a) => {
      e.push(
        r.map((l, d) => t.adjacencyMatrix[d][a]).reduce((l, d) => l + d, 0)
      );
    }), n.adjacencyMatrix.forEach((r, a) => {
      o.push(
        r.map((l, d) => n.adjacencyMatrix[d][a]).reduce((l, d) => l + d, 0)
      );
    }), [
      i,
      e,
      s,
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
  findAllSubgraphMonomorphisms(t, n, i = [], e = [], s = null) {
    const o = t.adjacencyMatrix.length, r = n.adjacencyMatrix.length, a = [], l = new Set(i), d = new Set(e);
    if (o > r)
      return a;
    s === null && (s = new Array(o).fill(-1));
    const u = t.labels && n.labels, m = Array(r).fill(!1), M = Array(o).fill(-1), [
      c,
      g,
      y,
      x
    ] = this.getInOutDegrees(t, n), L = c.map(
      (h, b) => y.map((S, C) => S >= h && x[C] >= g[b] && (s[b] === -1 || s[b] === C) && (!u || l.has(b) || t.labels[b] === n.labels[C]) ? C : -1).filter((S) => S !== -1)
    ), f = (h) => {
      if (h === o) {
        this.checkCompatibility(
          t,
          n,
          M,
          d
        ) && a.push([...M]);
        return;
      }
      for (const b of L[h])
        m[b] || (M[h] = b, m[b] = !0, this.isFeasible(
          t,
          n,
          M,
          h,
          d
        ) && f(h + 1), m[b] = !1, M[h] = -1);
    };
    return f(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(t, n, i, e, s) {
    const o = t.edgeLabels && n.edgeLabels;
    for (let r = 0; r < e; r++)
      if (t.adjacencyMatrix[e][r] && (!n.adjacencyMatrix[i[e]][i[r]] || o && !s.has(e + "," + r) && t.edgeLabels[e][r] !== n.edgeLabels[i[e]][i[r]]) || t.adjacencyMatrix[r][e] && (!n.adjacencyMatrix[i[r]][i[e]] || o && !s.has(r + "," + e) && t.edgeLabels[r][e] !== n.edgeLabels[i[r]][i[e]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(t, n, i, e) {
    const s = t.edgeLabels && n.edgeLabels, o = t.adjacencyMatrix.length;
    for (let r = 0; r < o; r++)
      for (let a = 0; a < o; a++)
        if (t.adjacencyMatrix[r][a] && (!n.adjacencyMatrix[i[r]][i[a]] || s && !e.has(r + "," + a) && t.edgeLabels[r][a] !== n.edgeLabels[i[r]][i[a]]))
          return !1;
    return !0;
  }
}
const K = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: v,
  UllmannGraphMatcher: E
}, Symbol.toStringTag, { value: "Module" })), w = class w {
  constructor(t, n = w.DefaultNodeKeySuffixGenerator, i = w.DefaultNodePropertiesMapper, e = w.DefaultNodePropertiesCanonKeyMapper) {
    p(this, "nodeCount");
    p(this, "hasNodeLabels");
    p(this, "hasNodeProperties");
    p(this, "hasEdgeLabels");
    p(this, "isSymmetric");
    p(this, "graph");
    p(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    p(this, "nodeKeys", /* @__PURE__ */ new Map());
    p(this, "nodePropertiesMapper");
    p(this, "nodePropertiesCanonKeyMapper");
    p(this, "graphStringBuilder");
    this.graph = t, this.nodeCount = t.adjacencyMatrix.length, this.hasNodeLabels = t.labels !== void 0, this.hasNodeProperties = t.nodeProperties !== void 0, this.hasEdgeLabels = t.edgeLabels !== void 0, this.nodePropertiesMapper = i, this.nodePropertiesCanonKeyMapper = e;
    let s = !0;
    for (let o = 0; o < this.nodeCount; o++) {
      const r = /* @__PURE__ */ new Set();
      let a = 0, l = 0;
      for (let u = 0; u < this.nodeCount; u++) {
        const m = t.adjacencyMatrix[o][u], M = t.adjacencyMatrix[u][o];
        m === 1 && (l++, r.add(u)), M === 1 && (a++, r.add(u)), m !== M && (s = !1);
      }
      this.nodeNeighbors.set(o, [...r]);
      const d = l + "|" + a + "|" + n(t, o);
      this.nodeKeys.set(o, d);
    }
    this.isSymmetric = s, this.graphStringBuilder = this.buildGraphStringCurry();
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
    const t = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(t);
    let n = null, i = null, e = null;
    const s = [], o = /* @__PURE__ */ new Map(), r = Array.from(
      { length: this.nodeCount },
      (l) => /* @__PURE__ */ new Set()
    ), a = /* @__PURE__ */ new Set();
    return this.individualizeDFS(t, [], a, (l, d) => {
      for (const c of s) {
        const g = /* @__PURE__ */ new Map();
        for (let f = 0; f < l.length; f++) {
          const h = c.get(l[f]);
          if (h !== f) {
            const b = [
              h < f ? h : f,
              f < h ? h : f
            ];
            g.set(b.join("|"), b);
          }
        }
        const y = [...g.values()];
        let x = !0;
        for (; x; ) {
          x = !1;
          for (let f = 0; f < y.length; f++)
            for (let h = f + 1; h < y.length; h++)
              if (y[f].some((b) => y[h].includes(b))) {
                y[f] = Array.from(
                  /* @__PURE__ */ new Set([...y[f], ...y[h]])
                ).sort(), y.splice(h, 1), x = !0;
                break;
              }
        }
        const L = y.map((f) => "(" + f.join(" ") + ")").join("");
        o.set(L, y);
      }
      const u = /* @__PURE__ */ new Map();
      l.forEach((c, g) => u.set(c, g)), s.push(u);
      for (let c = 0; c < l.length; c++)
        r[l[c] - 1].add(c);
      for (let c = 0; c < r.length; c++)
        if (r[c].size > 1) {
          const g = [...r[c]].sort();
          for (let y = 1; y < g.length; y++)
            a.add(g[y]);
        }
      const m = this.buildRepresentationGraph(l), M = this.buildGraphString(m);
      (e === null || M.localeCompare(e) < 0) && (n = m, i = new Array(l.length), l.forEach((c, g) => i[c - 1] = g), e = M);
    }), [
      n,
      e,
      i,
      new D([...o.values()])
    ];
  }
  /**
   * Calculates only the automorphisms of the graph.
   *
   * Note: if any of the graph, graph key, or node mapping are needed as well,
   * use the canonicalize() function.
   */
  aut() {
    const t = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(t);
    const n = [], i = /* @__PURE__ */ new Map(), e = Array.from(
      { length: this.nodeCount },
      (o) => /* @__PURE__ */ new Set()
    ), s = /* @__PURE__ */ new Set();
    return this.individualizeDFS(t, [], s, (o, r) => {
      for (const l of n) {
        const d = /* @__PURE__ */ new Map();
        for (let c = 0; c < o.length; c++) {
          const g = l.get(o[c]);
          if (g !== c) {
            const y = [
              g < c ? g : c,
              c < g ? g : c
            ];
            d.set(y.join("|"), y);
          }
        }
        const u = [...d.values()];
        let m = !0;
        for (; m; ) {
          m = !1;
          for (let c = 0; c < u.length; c++)
            for (let g = c + 1; g < u.length; g++)
              if (u[c].some((y) => u[g].includes(y))) {
                u[c] = Array.from(
                  /* @__PURE__ */ new Set([...u[c], ...u[g]])
                ).sort(), u.splice(g, 1), m = !0;
                break;
              }
        }
        const M = u.map((c) => "(" + c.join(" ") + ")").join("");
        i.set(M, u);
      }
      const a = /* @__PURE__ */ new Map();
      o.forEach((l, d) => a.set(l, d)), n.push(a);
      for (let l = 0; l < o.length; l++)
        e[o[l] - 1].add(l);
      for (let l = 0; l < e.length; l++)
        if (e[l].size > 1) {
          const d = [...e[l]].sort();
          for (let u = 1; u < d.length; u++)
            s.add(d[u]);
        }
    }), new D([...i.values()]);
  }
  partitionByPropertyKeys(t) {
    const n = /* @__PURE__ */ new Map();
    for (let e = 0; e < this.nodeCount; e++) {
      const s = this.nodeKeys.get(e);
      n.has(s) ? n.get(s).push(e) : n.set(s, [e]);
    }
    let i = 1;
    Array.from(n.keys()).sort((e, s) => e.localeCompare(s)).forEach((e) => {
      const s = n.get(e);
      s.forEach((o) => t[o] = i), i += s.length;
    });
  }
  isCanon(t) {
    return new Set(t).size === this.nodeCount;
  }
  individualizeDFS(t, n, i, e) {
    if (this.isCanon(t)) {
      e(t, n);
      return;
    }
    if (this.individualizationRefinement(t), this.isCanon(t)) {
      e(t, n);
      return;
    }
    const s = this.getCellToBreak(t);
    for (const o of s[1])
      t[o] = s[0] + 1;
    for (const o of s[1])
      n.length === 0 && i.has(o) || (t[o] = s[0], this.individualizeDFS(
        [...t],
        [...n, o],
        i,
        e
      ), t[o] = s[0] + 1);
  }
  individualizationRefinement(t) {
    let n = !1;
    for (; !n; ) {
      n = !0;
      const i = t.map((s, o) => this.nodeNeighbors.get(o).map((a) => {
        if (this.hasEdgeLabels) {
          const l = this.graph.edgeLabels;
          return this.isSymmetric ? `${t[a]};${l[o][a]}` : `${t[a]};${l[o][a]};${l[a][o]}`;
        }
        return t[a].toString();
      }).sort().join("|")), e = /* @__PURE__ */ new Map();
      i.forEach((s, o) => {
        const r = t[o];
        let a = e.get(r);
        a === void 0 && (a = /* @__PURE__ */ new Map(), e.set(r, a));
        let l = a.get(s);
        l === void 0 && (l = [], a.set(s, l)), l.push(o);
      });
      for (let s = 1; s <= this.nodeCount; s++) {
        const o = e.get(s);
        if (o === void 0 || o.size < 2)
          continue;
        n = !1;
        const r = Array.from(o.keys()).sort(
          (l, d) => d.localeCompare(l)
        );
        let a = s;
        for (const l of r) {
          const d = o.get(l);
          d.forEach((u) => t[u] = a), a += d.length;
        }
        break;
      }
    }
  }
  getCellToBreak(t) {
    const n = Array.from({ length: t.length }, () => []);
    t.forEach((i, e) => n[i - 1].push(e));
    for (let i = 0; i < n.length; i++)
      if (n[i].length > 1)
        return [i + 1, n[i]];
    return [1, n[0]];
  }
  buildRepresentationGraph(t) {
    const n = t.map((e) => e - 1), i = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    if (this.isSymmetric)
      for (let e = 0; e < this.nodeCount; e++) {
        const s = n[e], o = this.graph.adjacencyMatrix[e];
        for (let r = e; r < this.nodeCount; r++)
          i.adjacencyMatrix[s][n[r]] = o[r], i.adjacencyMatrix[n[r]][s] = o[r];
      }
    else
      for (let e = 0; e < this.nodeCount; e++) {
        const s = n[e], o = this.graph.adjacencyMatrix[e];
        for (let r = 0; r < this.nodeCount; r++)
          i.adjacencyMatrix[s][n[r]] = o[r];
      }
    if (this.hasNodeLabels && (i.labels = new Array(this.nodeCount), n.forEach((e, s) => i.labels[e] = this.graph.labels[s])), this.hasNodeProperties && (i.nodeProperties = new Array(this.nodeCount), n.forEach(
      (e, s) => i.nodeProperties[e] = this.nodePropertiesMapper(
        this.graph,
        s,
        n
      )
    )), this.hasEdgeLabels)
      if (i.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let e = 0; e < this.nodeCount; e++) {
          const s = n[e], o = this.graph.edgeLabels[e];
          for (let r = e; r < this.nodeCount; r++)
            i.edgeLabels[s][n[r]] = o[r], i.edgeLabels[n[r]][s] = o[r];
        }
      else
        for (let e = 0; e < this.nodeCount; e++) {
          const s = n[e], o = this.graph.edgeLabels[e];
          for (let r = 0; r < this.nodeCount; r++)
            i.edgeLabels[s][n[r]] = o[r];
        }
    return i;
  }
  buildGraphStringCurry() {
    const t = this.hasEdgeLabels ? (e, s, o) => `${s}-${e.edgeLabels[s][o]}-${o}` : (e, s, o) => `${s}-${o}`, n = this.hasNodeProperties ? (e, s) => {
      const o = this.nodePropertiesCanonKeyMapper(
        e,
        s
      );
      return o.length > 0 ? `{${o}}` : "";
    } : (e, s) => "", i = this.hasNodeLabels ? (e) => ";" + e.labels.map((s, o) => s + n(e, o)).join("|") : this.hasNodeProperties ? (e) => ";" + e.nodeProperties.map(
      (s, o) => this.nodePropertiesCanonKeyMapper(e, o)
    ).join("|") : (e) => "";
    return this.isSymmetric ? (e) => {
      const s = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const r = e.adjacencyMatrix[o];
        for (let a = o; a < this.nodeCount; a++)
          r[a] === 1 && s.push(t(e, o, a));
      }
      return s.join("|") + i(e);
    } : (e) => {
      const s = [];
      for (let o = 0; o < this.nodeCount; o++) {
        const r = e.adjacencyMatrix[o];
        for (let a = 0; a < this.nodeCount; a++)
          r[a] === 1 && s.push(t(e, o, a));
      }
      return s.join("|") + i(e);
    };
  }
  buildGraphString(t) {
    return this.graphStringBuilder(t);
  }
};
p(w, "DefaultNodeKeySuffixGenerator", (t, n) => t.labels ? t.labels[n] : ""), p(w, "DefaultNodePropertiesMapper", (t, n, i) => t.nodeProperties && t.nodeProperties[n] ? new Map(t.nodeProperties[n]) : void 0), p(w, "DefaultNodePropertiesCanonKeyMapper", (t, n) => "");
let P = w;
const k = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: P
}, Symbol.toStringTag, { value: "Module" }));
class I {
  static find(t) {
    const n = [], i = /* @__PURE__ */ new Set(), e = (s, o) => {
      i.add(s), o.push(s);
      for (let r = 0; r < t.adjacencyMatrix.length; r++)
        (t.adjacencyMatrix[s][r] === 1 || t.adjacencyMatrix[r][s] === 1) && (i.has(r) || e(r, o));
    };
    for (let s = 0; s < t.adjacencyMatrix.length; s++)
      if (!i.has(s)) {
        const o = [];
        e(s, o), n.push(o);
      }
    return n;
  }
}
class D {
  constructor(t) {
    p(this, "generators");
    this.generators = t;
  }
  orbits() {
    const t = /* @__PURE__ */ new Map();
    for (const e of this.generators)
      for (const s of e)
        for (let o = 0; o < s.length; o++) {
          let r = t.get(s[o]);
          r === void 0 && (r = /* @__PURE__ */ new Set(), t.set(s[o], r));
          for (let a = 0; a < s.length; a++)
            o !== a && r.add(s[a]);
        }
    const n = [], i = /* @__PURE__ */ new Set();
    for (const [e, s] of t.entries())
      if (!i.has(e)) {
        i.add(e);
        for (const o of s)
          i.add(o);
        n.push([e, ...s].sort());
      }
    return n;
  }
  toString() {
    return "gen[" + this.generators.map((t) => t.map((n) => "(" + n.join(" ") + ")").join("")).join(", ") + "], orb[" + this.orbits().map((t) => "{" + t.join(" ") + "}").join(", ") + "]";
  }
}
const z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AutomorphismGroup: D,
  ConnectedComponents: I,
  canon: k,
  matching: K
}, Symbol.toStringTag, { value: "Module" }));
export {
  z as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
