var B = Object.defineProperty;
var W = (x, e, t) => e in x ? B(x, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : x[e] = t;
var j = (x, e, t) => W(x, typeof e != "symbol" ? e + "" : e, t);
class k {
}
class V extends k {
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
  isSubgraphIsomorphic(e, t, r = [], n = [], s = null) {
    const i = e.adjacencyMatrix.length, o = t.adjacencyMatrix.length;
    if (i > o)
      return !1;
    s === null && (s = new Array(i).fill(-1));
    const a = e.labels && t.labels, d = Array(o).fill(!1), f = Array(i).fill(-1), M = new Set(r), y = new Set(n), [
      u,
      l,
      c,
      h
    ] = this.getInOutDegrees(e, t), g = u.map(
      (p, b) => c.map((S, L) => S >= p && h[L] >= l[b] && (s[b] === -1 || s[b] === L) && (!a || M.has(b) || e.labels[b] === t.labels[L]) ? L : -1).filter((S) => S !== -1)
    ), w = (p) => {
      if (p === i)
        return this.checkCompatibility(
          e,
          t,
          f,
          y
        );
      for (const b of g[p])
        if (!d[b]) {
          if (f[p] = b, d[b] = !0, this.isFeasible(
            e,
            t,
            f,
            p,
            y
          ) && w(p + 1))
            return !0;
          d[b] = !1, f[p] = -1;
        }
      return !1;
    };
    return w(0);
  }
  getInOutDegrees(e, t) {
    const r = e.adjacencyMatrix.map(
      (o) => o.reduce((a, d) => a + d, 0)
    ), n = [], s = t.adjacencyMatrix.map(
      (o) => o.reduce((a, d) => a + d, 0)
    ), i = [];
    return e.adjacencyMatrix.forEach((o, a) => {
      n.push(
        o.map((d, f) => e.adjacencyMatrix[f][a]).reduce((d, f) => d + f, 0)
      );
    }), t.adjacencyMatrix.forEach((o, a) => {
      i.push(
        o.map((d, f) => t.adjacencyMatrix[f][a]).reduce((d, f) => d + f, 0)
      );
    }), [
      r,
      n,
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
  findAllSubgraphMonomorphisms(e, t, r = [], n = [], s = null) {
    const i = e.adjacencyMatrix.length, o = t.adjacencyMatrix.length, a = [], d = new Set(r), f = new Set(n);
    if (i > o)
      return a;
    s === null && (s = new Array(i).fill(-1));
    const M = e.labels && t.labels, y = Array(o).fill(!1), u = Array(i).fill(-1), [
      l,
      c,
      h,
      g
    ] = this.getInOutDegrees(e, t), w = l.map(
      (b, S) => h.map((L, N) => L >= b && g[N] >= c[S] && (s[S] === -1 || s[S] === N) && (!M || d.has(S) || e.labels[S] === t.labels[N]) ? N : -1).filter((L) => L !== -1)
    ), p = (b) => {
      if (b === i) {
        this.checkCompatibility(
          e,
          t,
          u,
          f
        ) && a.push([...u]);
        return;
      }
      for (const S of w[b])
        y[S] || (u[b] = S, y[S] = !0, this.isFeasible(
          e,
          t,
          u,
          b,
          f
        ) && p(b + 1), y[S] = !1, u[b] = -1);
    };
    return p(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, r, n, s) {
    const i = e.edgeLabels && t.edgeLabels;
    for (let o = 0; o < n; o++)
      if (e.adjacencyMatrix[n][o] && (!t.adjacencyMatrix[r[n]][r[o]] || i && !s.has(n + "," + o) && e.edgeLabels[n][o] !== t.edgeLabels[r[n]][r[o]]) || e.adjacencyMatrix[o][n] && (!t.adjacencyMatrix[r[o]][r[n]] || i && !s.has(o + "," + n) && e.edgeLabels[o][n] !== t.edgeLabels[r[o]][r[n]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, r, n) {
    const s = e.edgeLabels && t.edgeLabels, i = e.adjacencyMatrix.length;
    for (let o = 0; o < i; o++)
      for (let a = 0; a < i; a++)
        if (e.adjacencyMatrix[o][a] && (!t.adjacencyMatrix[r[o]][r[a]] || s && !n.has(o + "," + a) && e.edgeLabels[o][a] !== t.edgeLabels[r[o]][r[a]]))
          return !1;
    return !0;
  }
}
class T extends k {
  isSubgraphIsomorphic(e, t, r = [], n = [], s = null) {
    let i = !1;
    return this.search(
      e,
      t,
      r,
      n,
      s,
      () => (i = !0, !0)
    ), i;
  }
  findAllSubgraphMonomorphisms(e, t, r = [], n = [], s = null) {
    const i = [];
    return this.search(
      e,
      t,
      r,
      n,
      s,
      (o) => (i.push([...o]), !1)
    ), i;
  }
  search(e, t, r, n, s, i) {
    const o = e.adjacencyMatrix.length, a = t.adjacencyMatrix.length;
    if (o > a)
      return;
    const [d, f, M, y] = this.getDegrees(e, t), u = {
      pattern: e,
      target: t,
      n: o,
      m: a,
      core1: new Array(o).fill(-1),
      core2: new Array(a).fill(-1),
      in1: new Array(o).fill(0),
      out1: new Array(o).fill(0),
      in2: new Array(a).fill(0),
      out2: new Array(a).fill(0),
      fixed: s ?? new Array(o).fill(-1),
      isLabeled: !!(e.labels && t.labels),
      isEdgeLabeled: !!(e.edgeLabels && t.edgeLabels),
      nodeWild: new Set(r),
      edgeWild: new Set(n),
      pIn: d,
      pOut: f,
      tIn: M,
      tOut: y
    }, l = this.createContext(u), c = (h) => {
      if (h === o)
        return i(l.core1);
      const g = this.selectPatternNode(l, h), w = this.gatherCandidates(l, g);
      for (const p of w) {
        if (l.tIn[p] < l.pIn[g] || l.tOut[p] < l.pOut[g] || l.isLabeled && !l.nodeWild.has(g) && l.pattern.labels[g] !== l.target.labels[p] || !this.isFeasiblePair(l, g, p))
          continue;
        l.core1[g] = p, l.core2[p] = g;
        const b = h + 1;
        if (this.extendTerminals(l.pattern, g, l.in1, l.out1, b), this.extendTerminals(l.target, p, l.in2, l.out2, b), c(h + 1))
          return !0;
        l.core1[g] = -1, l.core2[p] = -1, this.rollbackStamp(l.in1, b), this.rollbackStamp(l.out1, b), this.rollbackStamp(l.in2, b), this.rollbackStamp(l.out2, b);
      }
      return !1;
    };
    c(0);
  }
  /**
   * Build the candidate target-node set for `pn`:
   *   - If `pn` is pinned via `fixed`, the only candidate is that target.
   *   - If `pn` sits in some terminal set, candidates are restricted to
   *     the matching target terminal set (mirror of the mapped frontier).
   *   - Otherwise (first node in a connected component, etc.), every
   *     unmapped target node is a candidate.
   */
  gatherCandidates(e, t) {
    const r = [];
    if (e.fixed[t] !== -1)
      return e.core2[e.fixed[t]] === -1 && r.push(e.fixed[t]), r;
    const n = e.in1[t] > 0, s = e.out1[t] > 0;
    if (n || s)
      for (let i = 0; i < e.m; i++)
        e.core2[i] === -1 && (s && e.out2[i] === 0 || n && e.in2[i] === 0 || r.push(i));
    else
      for (let i = 0; i < e.m; i++)
        e.core2[i] === -1 && r.push(i);
    return r;
  }
  /**
   * Default VF2 feasibility check: consistency (layer 1) + structural
   * look-ahead (layer 2). Subclasses may override to add more layers
   * before/after; the convention is to call `super.isFeasiblePair(...)`
   * first so the cheap layers run before the expensive ones.
   */
  isFeasiblePair(e, t, r) {
    const { pattern: n, target: s, core1: i, core2: o, in1: a, out1: d, in2: f, out2: M } = e, { n: y, m: u, isEdgeLabeled: l, edgeWild: c } = e, h = n.adjacencyMatrix, g = s.adjacencyMatrix;
    for (let m = 0; m < y; m++) {
      const I = i[m];
      if (I !== -1 && (h[t][m] && (!g[r][I] || l && !c.has(t + "," + m) && n.edgeLabels[t][m] !== s.edgeLabels[r][I]) || h[m][t] && (!g[I][r] || l && !c.has(m + "," + t) && n.edgeLabels[m][t] !== s.edgeLabels[I][r])))
        return !1;
    }
    let w = 0, p = 0, b = 0, S = 0, L = 0, N = 0;
    for (let m = 0; m < y; m++) {
      if (m === t || i[m] !== -1)
        continue;
      const I = !!h[t][m], D = !!h[m][t];
      if (!I && !D)
        continue;
      const A = d[m] > 0, O = a[m] > 0;
      I && (A && w++, O && p++, !A && !O && b++), D && (A && S++, O && L++, !A && !O && N++);
    }
    let z = 0, $ = 0, F = 0, _ = 0, G = 0, R = 0;
    for (let m = 0; m < u; m++) {
      if (m === r || o[m] !== -1)
        continue;
      const I = !!g[r][m], D = !!g[m][r];
      if (!I && !D)
        continue;
      const A = M[m] > 0, O = f[m] > 0;
      I && (A && z++, O && $++, !A && !O && F++), D && (A && _++, O && G++, !A && !O && R++);
    }
    return w <= z && p <= $ && b <= F && S <= _ && L <= G && N <= R;
  }
  /**
   * After committing `node` to the mapping, mark every unmapped neighbor
   * with the current insertion stamp. Out-neighbors join the "out" set,
   * in-neighbors join the "in" set. For undirected graphs both sets end
   * up identical.
   */
  extendTerminals(e, t, r, n, s) {
    const i = e.adjacencyMatrix, o = i.length;
    for (let a = 0; a < o; a++)
      i[t][a] && n[a] === 0 && (n[a] = s), i[a][t] && r[a] === 0 && (r[a] = s);
  }
  /**
   * Undo `extendTerminals` for one recursion frame by zeroing every entry
   * whose insertion stamp matches `stamp`. Older insertions are untouched.
   */
  rollbackStamp(e, t) {
    for (let r = 0; r < e.length; r++)
      e[r] === t && (e[r] = 0);
  }
  /**
   * Row-sum / column-sum degree precomputation. Naming follows
   * UllmannGraphMatcher (row-sum is "in", col-sum is "out") so both files
   * reject the same candidate pairs at the cheap degree-filter step.
   */
  getDegrees(e, t) {
    const r = e.adjacencyMatrix.map(
      (o) => o.reduce((a, d) => a + d, 0)
    ), n = t.adjacencyMatrix.map((o) => o.reduce((a, d) => a + d, 0)), s = [], i = [];
    return e.adjacencyMatrix.forEach((o, a) => {
      s.push(
        o.map((d, f) => e.adjacencyMatrix[f][a]).reduce((d, f) => d + f, 0)
      );
    }), t.adjacencyMatrix.forEach((o, a) => {
      i.push(
        o.map((d, f) => t.adjacencyMatrix[f][a]).reduce((d, f) => d + f, 0)
      );
    }), [r, s, n, i];
  }
}
class q extends T {
  createContext(e) {
    return e;
  }
  /**
   * VF2's "pick from the frontier" heuristic. Preferring nodes already
   * adjacent to the mapped region propagates structural constraints
   * earlier than picking arbitrarily. For connected patterns rooted at
   * node 0 this happens to match Ullmann's natural-index iteration.
   */
  selectPatternNode(e, t) {
    let r = -1;
    for (let n = 0; n < e.n; n++)
      if (e.core1[n] === -1) {
        if (e.in1[n] > 0 || e.out1[n] > 0)
          return n;
        r === -1 && (r = n);
      }
    return r;
  }
}
class Y extends T {
  createContext(e) {
    return {
      ...e,
      order: this.computeOrder(e.pattern, e.target, e.nodeWild)
    };
  }
  selectPatternNode(e, t) {
    return e.order[t];
  }
  /**
   * Build the VF2++ pattern-node processing order.
   *
   * Idea: visit constrained nodes first. A node is "constrained" when it
   * has high degree (many edges the mapping must preserve) and/or a label
   * that is rare in the target (few mappable candidates).
   *
   * Algorithm:
   *   while pattern nodes remain unvisited:
   *     pick the most-constrained unvisited node as the next BFS root
   *     BFS outward, processing one level at a time;
   *     within each level, repeatedly pick the best remaining node by
   *     the comparator below until the level is empty.
   *
   * Comparator (positive = first arg preferred):
   *   1. Most edges back into the already-ordered prefix.
   *   2. Highest degree.
   *   3. Rarest label (smallest count of that label in the target).
   *   4. Smallest index (deterministic tie-break).
   *
   * Recomputing (1) inside the inner loop matters: as members of the level
   * get added to the order, their level-siblings' connection counts grow.
   */
  computeOrder(e, t, r) {
    const n = e.adjacencyMatrix.length, s = t.adjacencyMatrix.length, i = new Array(n).fill(0);
    for (let u = 0; u < n; u++) {
      let l = 0;
      for (let c = 0; c < n; c++)
        l += e.adjacencyMatrix[u][c] + e.adjacencyMatrix[c][u];
      i[u] = l;
    }
    const o = /* @__PURE__ */ new Map();
    if (t.labels)
      for (const u of t.labels)
        o.set(u, (o.get(u) ?? 0) + 1);
    const a = (u) => !e.labels || r.has(u) ? s + 1 : o.get(e.labels[u]) ?? 0, d = [], f = new Array(n).fill(!1), M = (u) => {
      let l = 0;
      for (const c of d)
        (e.adjacencyMatrix[u][c] || e.adjacencyMatrix[c][u]) && l++;
      return l;
    }, y = (u, l) => {
      const c = M(u), h = M(l);
      if (c !== h)
        return c - h;
      if (i[u] !== i[l])
        return i[u] - i[l];
      const g = a(u), w = a(l);
      return g !== w ? w - g : l - u;
    };
    for (; d.length < n; ) {
      let u = -1;
      for (let c = 0; c < n; c++)
        f[c] || (u === -1 || y(c, u) > 0) && (u = c);
      if (u === -1)
        break;
      f[u] = !0, d.push(u);
      let l = [u];
      for (; l.length > 0; ) {
        const c = /* @__PURE__ */ new Set();
        for (const w of l)
          for (let p = 0; p < n; p++)
            !f[p] && (e.adjacencyMatrix[w][p] || e.adjacencyMatrix[p][w]) && c.add(p);
        if (c.size === 0)
          break;
        const h = new Set(c), g = [];
        for (; h.size > 0; ) {
          let w = -1;
          for (const p of h)
            (w === -1 || y(p, w) > 0) && (w = p);
          h.delete(w), f[w] = !0, d.push(w), g.push(w);
        }
        l = g;
      }
    }
    return d;
  }
  /**
   * VF2++'s addition: a label-aware look-ahead layer on top of the base's
   * consistency + structural look-ahead. Pattern non-wildcard neighbors
   * are bucketed by label, target neighbors of `tn` likewise; we then
   * require pattern[L] <= target[L] for every label L that appears in the
   * pattern bucket. Wildcards skip the check (they can match any label,
   * and the structural total bound is already enforced upstream).
   */
  isFeasiblePair(e, t, r) {
    if (!super.isFeasiblePair(e, t, r))
      return !1;
    if (!e.isLabeled)
      return !0;
    const { pattern: n, target: s, core1: i, core2: o, n: a, m: d, nodeWild: f } = e, M = n.adjacencyMatrix, y = s.adjacencyMatrix, u = /* @__PURE__ */ new Map();
    for (let c = 0; c < a; c++) {
      if (c === t || i[c] !== -1 || !(M[t][c] || M[c][t]) || f.has(c))
        continue;
      const h = n.labels[c];
      u.set(h, (u.get(h) ?? 0) + 1);
    }
    if (u.size === 0)
      return !0;
    const l = /* @__PURE__ */ new Map();
    for (let c = 0; c < d; c++) {
      if (c === r || o[c] !== -1 || !(y[r][c] || y[c][r]))
        continue;
      const h = s.labels[c];
      l.set(h, (l.get(h) ?? 0) + 1);
    }
    for (const [c, h] of u)
      if ((l.get(c) ?? 0) < h)
        return !1;
    return !0;
  }
}
const U = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: k,
  UllmannGraphMatcher: V,
  VF2BaseGraphMatcher: T,
  VF2GraphMatcher: q,
  VF2PlusPlusGraphMatcher: Y
}, Symbol.toStringTag, { value: "Module" })), P = class P {
  constructor(e) {
    j(this, "mappings");
    j(this, "cycles", []);
    if (this.mappings = e, new Set(e).size !== e.length)
      throw "Automorphism is not bijective";
    const t = /* @__PURE__ */ new Set(), r = [...e.keys()].sort();
    for (const n of r)
      if (!t.has(n)) {
        t.add(n);
        const s = [n];
        for (; ; ) {
          const i = e[s[s.length - 1]];
          if (t.add(i), i !== s[0])
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
    const t = new Array(this.mappings.length);
    for (let r = 0; r < this.mappings.length; r++) {
      const n = e.apply(r), s = this.apply(n);
      t[r] = s;
    }
    return new P(t);
  }
  reverse() {
    const e = new Array(this.mappings.length);
    for (let t = 0; t < this.mappings.length; t++)
      e[this.mappings[t]] = t;
    return new P(e);
  }
  equals(e) {
    for (let t = 0; t < this.mappings.length; t++)
      if (this.mappings[t] !== e.mappings[t])
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
    return new P(Array.from({ length: e }, (t, r) => r));
  }
};
j(P, "fromCycleNotation", (e, t) => {
  const r = Array.from({ length: e }, (n, s) => s);
  return t.split("(").filter((n) => n.length > 1).map(
    (n) => n.replace(")", "").split(/\s+/).filter((s) => s.length > 0).map((s) => parseInt(s))
  ).forEach((n) => {
    for (let s = 0; s < n.length; s++)
      r[n[s]] = n[(s + 1) % n.length];
  }), new P(r);
});
let v = P;
class E {
  constructor(e, t) {
    j(this, "generators");
    j(this, "n");
    this.n = t, e.some((r) => r.isIdentity()) ? this.generators = [...e] : this.generators = [v.identity(t), ...e];
  }
  orbitOf(e) {
    const t = /* @__PURE__ */ new Set();
    t.add(e);
    for (const r of this.generators)
      t.add(r.apply(e));
    return Array.from(t).sort();
  }
  stabilizerOf(e) {
    return this.generators.filter((t) => t.apply(e) === e);
  }
  stabilizerSizeOf(e) {
    return this.generators.reduce(
      (t, r) => t += r.apply(e) === e ? 1 : 0,
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
    const e = /* @__PURE__ */ new Set(), t = [];
    for (const r of this.generators[0].mappings.keys())
      if (!e.has(r)) {
        const n = this.orbitOf(r);
        n.forEach((s) => e.add(s)), t.push(n);
      }
    return t;
  }
  closure() {
    const e = [], t = /* @__PURE__ */ new Set(), r = (s) => {
      const i = s.toString();
      t.has(i) || (e.push(s), t.add(i));
    }, n = [
      ...this.generators,
      ...this.generators.map((s) => s.reverse())
    ];
    for (n.forEach((s) => r(s)); n.length > 0; ) {
      const s = n.pop();
      for (const i of e)
        r(s.compose(i)), r(i.compose(s));
    }
    return e;
  }
  remap(e) {
    const t = [];
    for (const r of this.generators) {
      const n = Array.from({ length: this.n }, (s, i) => i);
      for (let s = 0; s < this.n; s++) {
        const i = e.indexOf(s), o = e.indexOf(r.mappings[s]);
        n[i] = o;
      }
      t.push(new v(n));
    }
    return new E(t, this.n);
  }
  toString() {
    return "[" + this.generators.map((e) => e.toString()).join(", ") + "]";
  }
}
const C = class C {
  // public static timingsCanonicalize: number[] = [];
  // public static timingsIndividualizeDFS: number[] = [];
  // public static timingsIndividualizationRefinement: number[] = [];
  // public static timingsHandleRepresentation: number[] = [];
  constructor(e, t = C.DefaultNodeKeySuffixGenerator, r = C.DefaultNodePropertiesMapper, n = C.DefaultNodeLabelCanonKeyMapper, s = C.DefaultEdgeLabelCanonKeyMapper, i = C.DefaultNodePropertiesCanonKeyMapper) {
    j(this, "nodeCount");
    j(this, "hasNodeLabels");
    j(this, "hasNodeProperties");
    j(this, "hasEdgeLabels");
    j(this, "isSymmetric");
    j(this, "graph");
    j(this, "nodeNeighbors");
    j(this, "nodeNeighborEdgeSignatures");
    j(this, "nodeKeys", /* @__PURE__ */ new Map());
    j(this, "nodePropertiesMapper");
    j(this, "nodeLabelCanonKeyMapper");
    j(this, "edgeLabelCanonKeyMapper");
    j(this, "nodePropertiesCanonKeyMapper");
    j(this, "graphStringBuilder");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.nodeNeighbors = Array.from({ length: this.nodeCount }, () => []), this.nodeNeighborEdgeSignatures = Array.from(
      { length: this.nodeCount },
      () => []
    ), this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = r, this.nodeLabelCanonKeyMapper = n, this.edgeLabelCanonKeyMapper = s, this.nodePropertiesCanonKeyMapper = i;
    let o = !0;
    for (let a = 0; a < this.nodeCount; a++) {
      const d = this.nodeNeighbors[a], f = this.nodeNeighborEdgeSignatures[a];
      let M = 0, y = 0;
      for (let l = 0; l < this.nodeCount; l++) {
        const c = e.adjacencyMatrix[a][l], h = e.adjacencyMatrix[l][a];
        if (c === 1 && y++, h === 1 && M++, c !== h && (o = !1), (c === 1 || h === 1) && d.push(l), this.hasEdgeLabels) {
          const g = this.graph.edgeLabels;
          g[a][l] !== g[l][a] ? f.push(
            `;${g[a][l]};${g[l][a]}`
          ) : f.push(`;${g[a][l]}`);
        } else
          f.push("");
      }
      const u = y + "|" + M + "|" + t(e, a);
      this.nodeKeys.set(a, u);
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
    const t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), n = new Array(this.nodeCount).fill(-1);
    this.individualizeDFS(
      e,
      n,
      0,
      r,
      this.handleRepresentationCurry(t, r)
    );
    const s = [...t.keys()].sort(
      (u, l) => u.localeCompare(l)
    )[0], i = t.get(s), o = new Array(this.nodeCount), a = new Array(o.length);
    [...i.partitions[0].entries()].forEach(([u, l]) => {
      o[l] = u + 1, a[u] = l;
    });
    const d = this.buildRepresentationGraph(
      o
    ), f = /* @__PURE__ */ new Map();
    for (const u of t.values())
      for (const [l, c] of u.automorphisms)
        f.set(l, c);
    const M = this.buildGraphString(d), y = new E(
      [...f.values()].map((u) => new v(u)),
      this.nodeCount
    );
    return [d, M, a, y];
  }
  handleRepresentationCurry(e, t) {
    const r = Array.from({ length: this.nodeCount }, (i, o) => o), n = [], s = new Array(this.nodeCount);
    return (i, o, a) => {
      const d = new Array(this.nodeCount);
      for (let y = 0; y < this.nodeCount; y++)
        d[i[y] - 1] = y;
      for (let y = 0; y < r.length; y++) {
        const u = r[y], l = this.nodeNeighbors[d[u]];
        n.length = l.length;
        for (let h = 0; h < l.length; h++)
          n[h] = i[l[h]];
        n.sort((h, g) => h - g);
        let c = "" + n[0];
        for (let h = 1; h < n.length; h++)
          c += ";" + n[h];
        s[y] = c;
      }
      const f = s.join("|");
      let M = e.get(f);
      M === void 0 && (M = {
        partitions: [],
        automorphisms: /* @__PURE__ */ new Map()
      }, e.set(f, M));
      for (const y of M.partitions) {
        const u = new Array(this.nodeCount);
        for (let c = 0; c < this.nodeCount; c++)
          u[c] = y[i[c] - 1];
        const l = u.join("|");
        if (!M.automorphisms.has(l)) {
          M.automorphisms.set(l, u);
          for (let c = 0; c < this.nodeCount; c++) {
            const h = u[c];
            if (c !== h)
              for (let g = 0; g < a; g++)
                o[g] === c ? g > 0 ? t.add(o.slice(0, g).join("|") + "|" + h) : t.add(h.toString()) : o[g] === h && (g > 0 ? t.add(o.slice(0, g).join("|") + "|" + c) : t.add(c.toString()));
          }
        }
      }
      M.partitions.push(d);
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
    const t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), n = new Array(this.nodeCount).fill(-1);
    this.individualizeDFS(
      e,
      n,
      0,
      r,
      this.handleRepresentationCurry(t, r)
    );
    const s = /* @__PURE__ */ new Map();
    for (const i of t.values())
      for (const [o, a] of i.automorphisms)
        s.set(o, a);
    return new E(
      [...s.values()].map((i) => new v(i)),
      this.nodeCount
    );
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let n = 0; n < this.nodeCount; n++) {
      const s = this.nodeKeys.get(n);
      t.has(s) ? t.get(s).push(n) : t.set(s, [n]);
    }
    let r = 1;
    Array.from(t.keys()).sort((n, s) => n.localeCompare(s)).forEach((n) => {
      const s = t.get(n);
      s.forEach((i) => e[i] = r), r += s.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, t, r, n, s) {
    if (this.isCanon(e)) {
      s(e, t, r);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      s(e, t, r);
      return;
    }
    const [i, o] = this.getCellToBreak(e);
    for (const a of o)
      e[a] = i + 1;
    for (const a of o) {
      if (t[r] = a, n.has(t.slice(0, r + 1).join("|"))) {
        t[r] = -1;
        continue;
      }
      e[a] = i, this.individualizeDFS(
        [...e],
        t,
        r + 1,
        n,
        s
      ), e[a] = i + 1, t[r] = -1;
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const r = new Array(
        e.length
      ).fill(void 0);
      let n = e.length + 1;
      for (let s = 0; s < e.length; s++) {
        const i = this.nodeNeighborEdgeSignatures[s], o = this.nodeNeighbors[s].map((f) => e[f] + i[f]).sort().join("|"), a = e[s], d = r[a];
        if (d === void 0)
          r[a] = /* @__PURE__ */ new Map([[o, [s]]]);
        else {
          const f = d.get(o);
          f === void 0 ? d.set(o, [s]) : f.push(s), d.size > 1 && (t = !1, a < n && (n = a));
        }
      }
      if (!t) {
        const i = [...r[n].entries()].sort(
          (a, d) => d[0].localeCompare(a[0])
        );
        let o = n;
        for (const [a, d] of i) {
          for (let f = 0; f < d.length; f++)
            e[d[f]] = o;
          o += d.length;
        }
      }
    }
  }
  getCellToBreak(e) {
    let t = e.length;
    const r = new Array(e.length).fill(void 0);
    for (let n = 0; n < e.length; n++) {
      const s = e[n] - 1;
      s > t || (r[s] === void 0 ? r[s] = [n] : (r[s].push(n), s < t && (t = s)));
    }
    if (t !== e.length) {
      const n = r[t];
      if (n !== void 0 && n.length > 1)
        return [t + 1, n];
    }
    return [1, r[0]];
  }
  buildRepresentationGraph(e) {
    const t = e.map((n) => n - 1), r = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    if (this.isSymmetric)
      for (let n = 0; n < this.nodeCount; n++) {
        const s = t[n], i = this.graph.adjacencyMatrix[n];
        for (let o = n; o < this.nodeCount; o++)
          r.adjacencyMatrix[s][t[o]] = i[o], r.adjacencyMatrix[t[o]][s] = i[o];
      }
    else
      for (let n = 0; n < this.nodeCount; n++) {
        const s = t[n], i = this.graph.adjacencyMatrix[n];
        for (let o = 0; o < this.nodeCount; o++)
          r.adjacencyMatrix[s][t[o]] = i[o];
      }
    if (this.hasNodeLabels && (r.labels = new Array(this.nodeCount), t.forEach((n, s) => r.labels[n] = this.graph.labels[s])), this.hasNodeProperties && (r.nodeProperties = new Array(this.nodeCount), t.forEach(
      (n, s) => r.nodeProperties[n] = this.nodePropertiesMapper(
        this.graph,
        s,
        t
      )
    )), this.hasEdgeLabels)
      if (r.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      ), this.isSymmetric)
        for (let n = 0; n < this.nodeCount; n++) {
          const s = t[n], i = this.graph.edgeLabels[n];
          for (let o = n; o < this.nodeCount; o++)
            r.edgeLabels[s][t[o]] = i[o], r.edgeLabels[t[o]][s] = i[o];
        }
      else
        for (let n = 0; n < this.nodeCount; n++) {
          const s = t[n], i = this.graph.edgeLabels[n];
          for (let o = 0; o < this.nodeCount; o++)
            r.edgeLabels[s][t[o]] = i[o];
        }
    return r;
  }
  buildGraphStringCurry() {
    const e = this.hasEdgeLabels ? (n, s, i) => `${s}-${this.edgeLabelCanonKeyMapper(n, s, i)}-${i}` : (n, s, i) => `${s}-${i}`, t = this.hasNodeProperties ? (n, s) => {
      const i = this.nodePropertiesCanonKeyMapper(
        n,
        s
      );
      return i.length > 0 ? `{${i}}` : "";
    } : (n, s) => "", r = this.hasNodeLabels ? (n) => ";" + n.labels.map(
      (s, i) => this.nodeLabelCanonKeyMapper(n, i) + t(n, i)
    ).join("|") : this.hasNodeProperties ? (n) => ";" + n.nodeProperties.map(
      (s, i) => this.nodePropertiesCanonKeyMapper(n, i)
    ).join("|") : (n) => "";
    return this.isSymmetric ? (n) => {
      const s = [];
      for (let i = 0; i < this.nodeCount; i++) {
        const o = n.adjacencyMatrix[i];
        for (let a = i; a < this.nodeCount; a++)
          o[a] === 1 && s.push(e(n, i, a));
      }
      return C.KEY_VERSION + ";" + n.adjacencyMatrix.length + ";sym;" + s.join("|") + r(n);
    } : (n) => {
      const s = [];
      for (let i = 0; i < this.nodeCount; i++) {
        const o = n.adjacencyMatrix[i];
        for (let a = 0; a < this.nodeCount; a++)
          o[a] === 1 && s.push(e(n, i, a));
      }
      return C.KEY_VERSION + ";" + n.adjacencyMatrix.length + ";" + s.join("|") + r(n);
    };
  }
  buildGraphString(e) {
    return this.graphStringBuilder(e);
  }
};
j(C, "KEY_VERSION", "v2"), j(C, "DefaultNodeKeySuffixGenerator", (e, t) => e.labels ? e.labels[t] : ""), j(C, "DefaultNodePropertiesMapper", (e, t, r) => e.nodeProperties && e.nodeProperties[t] ? new Map(e.nodeProperties[t]) : void 0), j(C, "DefaultNodeLabelCanonKeyMapper", (e, t) => e.labels ? e.labels[t] : ""), j(C, "DefaultEdgeLabelCanonKeyMapper", (e, t, r) => e.edgeLabels ? e.edgeLabels[t][r] : ""), j(C, "DefaultNodePropertiesCanonKeyMapper", (e, t) => "");
let K = C;
const H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: K
}, Symbol.toStringTag, { value: "Module" }));
class J {
  static find(e) {
    const t = [], r = /* @__PURE__ */ new Set(), n = (s, i) => {
      r.add(s), i.push(s);
      for (let o = 0; o < e.adjacencyMatrix.length; o++)
        (e.adjacencyMatrix[s][o] === 1 || e.adjacencyMatrix[o][s] === 1) && (r.has(o) || n(o, i));
    };
    for (let s = 0; s < e.adjacencyMatrix.length; s++)
      if (!r.has(s)) {
        const i = [];
        n(s, i), t.push(i);
      }
    return t;
  }
}
function Q(x) {
  const e = x.adjacencyMatrix.length;
  let t = [];
  for (let r = 0; r < e; r++)
    for (let n = r + 1; n < e; n++)
      x.adjacencyMatrix[r][n] !== 0 && t.push(`e ${r + 1} ${n + 1}`);
  return [`p edge ${e} ${t.length}`, ...t].join(`
`);
}
const Z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Automorphism: v,
  AutomorphismGroup: E,
  ConnectedComponents: J,
  canon: H,
  matching: U,
  symmetricGraphToDIMACS: Q
}, Symbol.toStringTag, { value: "Module" }));
export {
  Z as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
