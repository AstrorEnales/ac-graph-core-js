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
  isSubgraphIsomorphic(t, n, i = [], e = [], o = null) {
    const s = t.adjacencyMatrix.length, r = n.adjacencyMatrix.length;
    if (s > r)
      return !1;
    o === null && (o = new Array(s).fill(-1));
    const a = t.labels && n.labels, l = Array(r).fill(!1), u = Array(s).fill(-1), f = new Set(i), m = new Set(e), [
      M,
      c,
      g,
      y
    ] = this.getInOutDegrees(t, n), x = M.map(
      (h, d) => g.map((b, S) => b >= h && y[S] >= c[d] && (o[d] === -1 || o[d] === S) && (!a || f.has(d) || t.labels[d] === n.labels[S]) ? S : -1).filter((b) => b !== -1)
    ), L = (h) => {
      if (h === s)
        return this.checkCompatibility(
          t,
          n,
          u,
          m
        );
      for (const d of x[h])
        if (!l[d]) {
          if (u[h] = d, l[d] = !0, this.isFeasible(
            t,
            n,
            u,
            h,
            m
          ) && L(h + 1))
            return !0;
          l[d] = !1, u[h] = -1;
        }
      return !1;
    };
    return L(0);
  }
  getInOutDegrees(t, n) {
    const i = t.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), e = [], o = n.adjacencyMatrix.map(
      (r) => r.reduce((a, l) => a + l, 0)
    ), s = [];
    return t.adjacencyMatrix.forEach((r, a) => {
      e.push(
        r.map((l, u) => t.adjacencyMatrix[u][a]).reduce((l, u) => l + u, 0)
      );
    }), n.adjacencyMatrix.forEach((r, a) => {
      s.push(
        r.map((l, u) => n.adjacencyMatrix[u][a]).reduce((l, u) => l + u, 0)
      );
    }), [
      i,
      e,
      o,
      s
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
  findAllSubgraphMonomorphisms(t, n, i = [], e = [], o = null) {
    const s = t.adjacencyMatrix.length, r = n.adjacencyMatrix.length, a = [], l = new Set(i), u = new Set(e);
    if (s > r)
      return a;
    o === null && (o = new Array(s).fill(-1));
    const f = t.labels && n.labels, m = Array(r).fill(!1), M = Array(s).fill(-1), [
      c,
      g,
      y,
      x
    ] = this.getInOutDegrees(t, n), L = c.map(
      (d, b) => y.map((S, C) => S >= d && x[C] >= g[b] && (o[b] === -1 || o[b] === C) && (!f || l.has(b) || t.labels[b] === n.labels[C]) ? C : -1).filter((S) => S !== -1)
    ), h = (d) => {
      if (d === s) {
        this.checkCompatibility(
          t,
          n,
          M,
          u
        ) && a.push([...M]);
        return;
      }
      for (const b of L[d])
        m[b] || (M[d] = b, m[b] = !0, this.isFeasible(
          t,
          n,
          M,
          d,
          u
        ) && h(d + 1), m[b] = !1, M[d] = -1);
    };
    return h(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(t, n, i, e, o) {
    const s = t.edgeLabels && n.edgeLabels;
    for (let r = 0; r < e; r++)
      if (t.adjacencyMatrix[e][r] && (!n.adjacencyMatrix[i[e]][i[r]] || s && !o.has(e + "," + r) && t.edgeLabels[e][r] !== n.edgeLabels[i[e]][i[r]]) || t.adjacencyMatrix[r][e] && (!n.adjacencyMatrix[i[r]][i[e]] || s && !o.has(r + "," + e) && t.edgeLabels[r][e] !== n.edgeLabels[i[r]][i[e]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(t, n, i, e) {
    const o = t.edgeLabels && n.edgeLabels, s = t.adjacencyMatrix.length;
    for (let r = 0; r < s; r++)
      for (let a = 0; a < s; a++)
        if (t.adjacencyMatrix[r][a] && (!n.adjacencyMatrix[i[r]][i[a]] || o && !e.has(r + "," + a) && t.edgeLabels[r][a] !== n.edgeLabels[i[r]][i[a]]))
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
    let o = !0;
    for (let s = 0; s < this.nodeCount; s++) {
      const r = /* @__PURE__ */ new Set();
      let a = 0, l = 0;
      for (let f = 0; f < this.nodeCount; f++) {
        const m = t.adjacencyMatrix[s][f], M = t.adjacencyMatrix[f][s];
        m === 1 && (l++, r.add(f)), M === 1 && (a++, r.add(f)), m !== M && (o = !1);
      }
      this.nodeNeighbors.set(s, [...r]);
      const u = l + "|" + a + "|" + n(t, s);
      this.nodeKeys.set(s, u);
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
    const t = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(t);
    let n = null, i = null, e = null;
    const o = [], s = /* @__PURE__ */ new Map(), r = Array.from(
      { length: this.nodeCount },
      (l) => /* @__PURE__ */ new Set()
    ), a = /* @__PURE__ */ new Set();
    return this.individualizeDFS(t, [], a, (l, u) => {
      for (const c of o) {
        const g = /* @__PURE__ */ new Map();
        for (let h = 0; h < l.length; h++) {
          const d = c.get(l[h]);
          if (d !== h) {
            const b = [
              d < h ? d : h,
              h < d ? d : h
            ];
            g.set(b.join("|"), b);
          }
        }
        const y = [...g.values()];
        let x = !0;
        for (; x; ) {
          x = !1;
          for (let h = 0; h < y.length; h++)
            for (let d = h + 1; d < y.length; d++)
              if (y[h].some((b) => y[d].includes(b))) {
                y[h] = Array.from(
                  /* @__PURE__ */ new Set([...y[h], ...y[d]])
                ).sort(), y.splice(d, 1), x = !0;
                break;
              }
        }
        const L = y.map((h) => "(" + h.join(" ") + ")").join("");
        s.set(L, y);
      }
      const f = /* @__PURE__ */ new Map();
      l.forEach((c, g) => f.set(c, g)), o.push(f);
      for (let c = 0; c < l.length; c++)
        r[l[c] - 1].add(c);
      for (let c = 0; c < r.length; c++)
        r[c].size > 1 && [...r[c]].sort();
      const m = this.buildRepresentationGraph(l), M = this.buildGraphString(m);
      (e === null || M.localeCompare(e) < 0) && (n = m, i = new Array(l.length), l.forEach((c, g) => i[c - 1] = g), e = M);
    }), [
      n,
      e,
      i,
      new D([...s.values()])
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
      (s) => /* @__PURE__ */ new Set()
    ), o = /* @__PURE__ */ new Set();
    return this.individualizeDFS(t, [], o, (s, r) => {
      for (const l of n) {
        const u = /* @__PURE__ */ new Map();
        for (let c = 0; c < s.length; c++) {
          const g = l.get(s[c]);
          if (g !== c) {
            const y = [
              g < c ? g : c,
              c < g ? g : c
            ];
            u.set(y.join("|"), y);
          }
        }
        const f = [...u.values()];
        let m = !0;
        for (; m; ) {
          m = !1;
          for (let c = 0; c < f.length; c++)
            for (let g = c + 1; g < f.length; g++)
              if (f[c].some((y) => f[g].includes(y))) {
                f[c] = Array.from(
                  /* @__PURE__ */ new Set([...f[c], ...f[g]])
                ).sort(), f.splice(g, 1), m = !0;
                break;
              }
        }
        const M = f.map((c) => "(" + c.join(" ") + ")").join("");
        i.set(M, f);
      }
      const a = /* @__PURE__ */ new Map();
      s.forEach((l, u) => a.set(l, u)), n.push(a);
      for (let l = 0; l < s.length; l++)
        e[s[l] - 1].add(l);
      for (let l = 0; l < e.length; l++)
        e[l].size > 1 && [...e[l]].sort();
    }), new D([...i.values()]);
  }
  partitionByPropertyKeys(t) {
    const n = /* @__PURE__ */ new Map();
    for (let e = 0; e < this.nodeCount; e++) {
      const o = this.nodeKeys.get(e);
      n.has(o) ? n.get(o).push(e) : n.set(o, [e]);
    }
    let i = 1;
    Array.from(n.keys()).sort((e, o) => e.localeCompare(o)).forEach((e) => {
      const o = n.get(e);
      o.forEach((s) => t[s] = i), i += o.length;
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
    const o = this.getCellToBreak(t);
    for (const s of o[1])
      t[s] = o[0] + 1;
    for (const s of o[1])
      n.length === 0 && i.has(s) || (t[s] = o[0], this.individualizeDFS(
        [...t],
        [...n, s],
        i,
        e
      ), t[s] = o[0] + 1);
  }
  individualizationRefinement(t) {
    let n = !1;
    for (; !n; ) {
      n = !0;
      const i = t.map((o, s) => this.nodeNeighbors.get(s).map((a) => {
        if (this.hasEdgeLabels) {
          const l = this.graph.edgeLabels;
          return this.isSymmetric ? `${t[a]};${l[s][a]}` : `${t[a]};${l[s][a]};${l[a][s]}`;
        }
        return t[a].toString();
      }).sort().join("|")), e = /* @__PURE__ */ new Map();
      i.forEach((o, s) => {
        const r = t[s];
        let a = e.get(r);
        a === void 0 && (a = /* @__PURE__ */ new Map(), e.set(r, a));
        let l = a.get(o);
        l === void 0 && (l = [], a.set(o, l)), l.push(s);
      });
      for (let o = 1; o <= this.nodeCount; o++) {
        const s = e.get(o);
        if (s === void 0 || s.size < 2)
          continue;
        n = !1;
        const r = Array.from(s.keys()).sort(
          (l, u) => u.localeCompare(l)
        );
        let a = o;
        for (const l of r) {
          const u = s.get(l);
          u.forEach((f) => t[f] = a), a += u.length;
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
        const o = n[e], s = this.graph.adjacencyMatrix[e];
        for (let r = e; r < this.nodeCount; r++)
          i.adjacencyMatrix[o][n[r]] = s[r], i.adjacencyMatrix[n[r]][o] = s[r];
      }
    else
      for (let e = 0; e < this.nodeCount; e++) {
        const o = n[e], s = this.graph.adjacencyMatrix[e];
        for (let r = 0; r < this.nodeCount; r++)
          i.adjacencyMatrix[o][n[r]] = s[r];
      }
    if (this.hasNodeLabels && (i.labels = new Array(this.nodeCount), n.forEach((e, o) => i.labels[e] = this.graph.labels[o])), this.hasNodeProperties && (i.nodeProperties = new Array(this.nodeCount), n.forEach(
      (e, o) => i.nodeProperties[e] = this.nodePropertiesMapper(
        this.graph,
        o,
        n
      )
    )), this.hasEdgeLabels)
      if (i.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let e = 0; e < this.nodeCount; e++) {
          const o = n[e], s = this.graph.edgeLabels[e];
          for (let r = e; r < this.nodeCount; r++)
            i.edgeLabels[o][n[r]] = s[r], i.edgeLabels[n[r]][o] = s[r];
        }
      else
        for (let e = 0; e < this.nodeCount; e++) {
          const o = n[e], s = this.graph.edgeLabels[e];
          for (let r = 0; r < this.nodeCount; r++)
            i.edgeLabels[o][n[r]] = s[r];
        }
    return i;
  }
  buildGraphStringCurry() {
    const t = this.hasEdgeLabels ? (e, o, s) => `${o}-${e.edgeLabels[o][s]}-${s}` : (e, o, s) => `${o}-${s}`, n = this.hasNodeProperties ? (e, o) => {
      const s = this.nodePropertiesCanonKeyMapper(
        e,
        o
      );
      return s.length > 0 ? `{${s}}` : "";
    } : (e, o) => "", i = this.hasNodeLabels ? (e) => ";" + e.labels.map((o, s) => o + n(e, s)).join("|") : this.hasNodeProperties ? (e) => ";" + e.nodeProperties.map(
      (o, s) => this.nodePropertiesCanonKeyMapper(e, s)
    ).join("|") : (e) => "";
    return this.isSymmetric ? (e) => {
      const o = [];
      for (let s = 0; s < this.nodeCount; s++) {
        const r = e.adjacencyMatrix[s];
        for (let a = s; a < this.nodeCount; a++)
          r[a] === 1 && o.push(t(e, s, a));
      }
      return o.join("|") + i(e);
    } : (e) => {
      const o = [];
      for (let s = 0; s < this.nodeCount; s++) {
        const r = e.adjacencyMatrix[s];
        for (let a = 0; a < this.nodeCount; a++)
          r[a] === 1 && o.push(t(e, s, a));
      }
      return o.join("|") + i(e);
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
    const n = [], i = /* @__PURE__ */ new Set(), e = (o, s) => {
      i.add(o), s.push(o);
      for (let r = 0; r < t.adjacencyMatrix.length; r++)
        (t.adjacencyMatrix[o][r] === 1 || t.adjacencyMatrix[r][o] === 1) && (i.has(r) || e(r, s));
    };
    for (let o = 0; o < t.adjacencyMatrix.length; o++)
      if (!i.has(o)) {
        const s = [];
        e(o, s), n.push(s);
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
      for (const o of e)
        for (let s = 0; s < o.length; s++) {
          let r = t.get(o[s]);
          r === void 0 && (r = /* @__PURE__ */ new Set(), t.set(o[s], r));
          for (let a = 0; a < o.length; a++)
            s !== a && r.add(o[a]);
        }
    const n = [], i = /* @__PURE__ */ new Set();
    for (const [e, o] of t.entries())
      if (!i.has(e)) {
        i.add(e);
        for (const s of o)
          i.add(s);
        n.push([e, ...o].sort());
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
