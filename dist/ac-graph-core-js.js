var I = Object.defineProperty;
var A = (g, e, t) => e in g ? I(g, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : g[e] = t;
var h = (g, e, t) => A(g, typeof e != "symbol" ? e + "" : e, t);
class E {
}
class O extends E {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  isSubgraphIsomorphic(e, t, n = [], s = []) {
    const r = e.adjacencyMatrix.length, i = t.adjacencyMatrix.length;
    if (r > i)
      return !1;
    const a = e.labels && t.labels, o = Array(i).fill(!1), l = Array(r).fill(-1), c = new Set(n), b = new Set(s), [
      y,
      m,
      L,
      S
    ] = this.getInOutDegrees(e, t), D = y.map(
      (f, u) => L.map((d, M) => d >= f && S[M] >= m[u] && (!a || c.has(u) || e.labels[u] === t.labels[M]) ? M : -1).filter((d) => d !== -1)
    ), x = (f) => {
      if (f === r)
        return this.checkCompatibility(
          e,
          t,
          l,
          b
        );
      for (const u of D[f])
        if (!o[u]) {
          if (l[f] = u, o[u] = !0, this.isFeasible(
            e,
            t,
            l,
            f,
            b
          ) && x(f + 1))
            return !0;
          o[u] = !1, l[f] = -1;
        }
      return !1;
    };
    return x(0);
  }
  getInOutDegrees(e, t) {
    const n = e.adjacencyMatrix.map(
      (a) => a.reduce((o, l) => o + l, 0)
    ), s = [], r = t.adjacencyMatrix.map(
      (a) => a.reduce((o, l) => o + l, 0)
    ), i = [];
    return e.adjacencyMatrix.forEach((a, o) => {
      s.push(
        a.map((l, c) => e.adjacencyMatrix[c][o]).reduce((l, c) => l + c, 0)
      );
    }), t.adjacencyMatrix.forEach((a, o) => {
      i.push(
        a.map((l, c) => t.adjacencyMatrix[c][o]).reduce((l, c) => l + c, 0)
      );
    }), [
      n,
      s,
      r,
      i
    ];
  }
  /**
   * Collect all possible monomorphisms of the pattern graph in the target graph
   * including symmetries
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  findAllSubgraphMonomorphisms(e, t, n = [], s = []) {
    const r = e.adjacencyMatrix.length, i = t.adjacencyMatrix.length, a = [], o = new Set(n), l = new Set(s);
    if (r > i)
      return a;
    const c = e.labels && t.labels, b = Array(i).fill(!1), y = Array(r).fill(-1), [
      m,
      L,
      S,
      D
    ] = this.getInOutDegrees(e, t), x = m.map(
      (u, d) => S.map((M, w) => M >= u && D[w] >= L[d] && (!c || o.has(d) || e.labels[d] === t.labels[w]) ? w : -1).filter((M) => M !== -1)
    ), f = (u) => {
      if (u === r) {
        this.checkCompatibility(
          e,
          t,
          y,
          l
        ) && a.push([...y]);
        return;
      }
      for (const d of x[u])
        b[d] || (y[u] = d, b[d] = !0, this.isFeasible(
          e,
          t,
          y,
          u,
          l
        ) && f(u + 1), b[d] = !1, y[u] = -1);
    };
    return f(0), a;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, n, s, r) {
    const i = e.edgeLabels && t.edgeLabels;
    for (let a = 0; a < s; a++)
      if (e.adjacencyMatrix[s][a] && (!t.adjacencyMatrix[n[s]][n[a]] || i && !r.has(s + "," + a) && e.edgeLabels[s][a] !== t.edgeLabels[n[s]][n[a]]) || e.adjacencyMatrix[a][s] && (!t.adjacencyMatrix[n[a]][n[s]] || i && !r.has(a + "," + s) && e.edgeLabels[a][s] !== t.edgeLabels[n[a]][n[s]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, n, s) {
    const r = e.edgeLabels && t.edgeLabels, i = e.adjacencyMatrix.length;
    for (let a = 0; a < i; a++)
      for (let o = 0; o < i; o++)
        if (e.adjacencyMatrix[a][o] && (!t.adjacencyMatrix[n[a]][n[o]] || r && !s.has(a + "," + o) && e.edgeLabels[a][o] !== t.edgeLabels[n[a]][n[o]]))
          return !1;
    return !0;
  }
}
const p = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: E,
  UllmannGraphMatcher: O
}, Symbol.toStringTag, { value: "Module" })), j = class j {
  constructor(e, t = j.DefaultNodeKeySuffixGenerator) {
    h(this, "nodeCount");
    h(this, "hasNodeLabels");
    h(this, "hasEdgeLabels");
    h(this, "graph");
    h(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    h(this, "nodeKeys", /* @__PURE__ */ new Map());
    h(this, "inDegrees", /* @__PURE__ */ new Map());
    h(this, "outDegrees", /* @__PURE__ */ new Map());
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0;
    for (let n = 0; n < this.nodeCount; n++) {
      const s = /* @__PURE__ */ new Set();
      let r = 0, i = 0;
      for (let o = 0; o < this.nodeCount; o++)
        e.adjacencyMatrix[n][o] === 1 && (i++, s.add(o)), e.adjacencyMatrix[o][n] === 1 && (r++, s.add(o));
      this.inDegrees.set(n, r), this.outDegrees.set(n, i), this.nodeNeighbors.set(n, [...s]);
      const a = i + "|" + r + t(e, n);
      this.nodeKeys.set(n, a);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let t = null, n = null, s = null;
    return this.individualizeDFS(e, [], (r, i) => {
      const a = this.buildRepresentationGraph(r), o = this.buildGraphString(a);
      (s === null || o.localeCompare(s) < 0) && (t = a, n = new Array(r.length), r.forEach((l, c) => n[l - 1] = c), s = o);
    }), [t, s, n];
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let s = 0; s < this.nodeCount; s++) {
      const r = this.nodeKeys.get(s);
      t.has(r) ? t.get(r).push(s) : t.set(r, [s]);
    }
    let n = 1;
    Array.from(t.keys()).sort((s, r) => s.localeCompare(r)).forEach((s) => {
      const r = t.get(s);
      r.forEach((i) => e[i] = n), n += r.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, t, n) {
    if (this.isCanon(e)) {
      n(e, t);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      n(e, t);
      return;
    }
    const s = this.getCurrentCells(e), r = Array.from(s.entries()).sort(([i], [a]) => i - a).filter(([, i]) => i.length > 1)[0];
    for (const i of r[1]) {
      const a = [...e];
      r[1].forEach((o) => {
        o !== i && (a[o] = r[0] + 1);
      }), this.individualizeDFS(
        a,
        [...t, i],
        n
      );
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const n = e.map((i, a) => [this.nodeNeighbors.get(a).map((c) => {
        let b = e[c].toString();
        return this.hasEdgeLabels && (b += ";" + this.graph.edgeLabels[a][c] + ";" + this.graph.edgeLabels[c][a]), b;
      }).sort().join("|"), a]), s = /* @__PURE__ */ new Map();
      for (const [i, a] of n) {
        const o = e[a];
        s.has(o) || s.set(o, /* @__PURE__ */ new Map());
        const l = s.get(o);
        l.has(i) || l.set(i, []), l.get(i).push(a);
      }
      const r = Array.from(s.keys()).sort();
      for (const i of r) {
        const a = Array.from(s.get(i).entries());
        if (a.length > 1) {
          t = !1, a.sort(([l], [c]) => c.localeCompare(l));
          let o = i;
          a.forEach(([, l]) => {
            l.forEach((c) => e[c] = o), o += l.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const t = /* @__PURE__ */ new Map();
    return e.forEach((n, s) => {
      t.has(n) ? t.get(n).push(s) : t.set(n, [s]);
    }), t;
  }
  /*private getCellsString(nodeCells: number[]): string {
  	const cells = this.getCurrentCells(nodeCells);
  	const cellIds = Array.from(cells.keys()).sort();
  	let text = '[';
  	for (const cellId of cellIds) {
  		const nodeIds = Array.from(cells.get(cellId)!.values()).sort();
  		if (text.length > 1) {
  			text += '|';
  		}
  		text += nodeIds.join(' ');
  	}
  	return text + ']';
  }*/
  buildRepresentationGraph(e) {
    const t = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    for (let n = 0; n < this.nodeCount; n++)
      for (let s = 0; s < this.nodeCount; s++)
        t.adjacencyMatrix[e[n] - 1][e[s] - 1] = this.graph.adjacencyMatrix[n][s];
    if (this.hasNodeLabels && (t.labels = new Array(this.nodeCount), e.forEach(
      (n, s) => t.labels[n - 1] = this.graph.labels[s]
    )), this.hasEdgeLabels) {
      t.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let n = 0; n < this.nodeCount; n++)
        for (let s = 0; s < this.nodeCount; s++)
          t.edgeLabels[e[n] - 1][e[s] - 1] = this.graph.edgeLabels[n][s];
    }
    return t;
  }
  buildGraphString(e) {
    const t = [];
    for (let n = 0; n < this.nodeCount; n++)
      for (let s = 0; s < this.nodeCount; s++)
        e.adjacencyMatrix[n][s] === 1 && (this.hasEdgeLabels ? t.push(n + "-" + e.edgeLabels[n][s] + "-" + s) : t.push(n + "-" + s));
    return this.hasNodeLabels ? t.join("|") + ";" + e.labels.join("|") : t.join("|");
  }
};
h(j, "DefaultNodeKeySuffixGenerator", (e, t) => e.labels ? e.labels[t] : "");
let C = j;
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: C
}, Symbol.toStringTag, { value: "Module" }));
class v {
  static find(e) {
    const t = [], n = /* @__PURE__ */ new Set(), s = (r, i) => {
      n.add(r), i.push(r);
      for (let a = 0; a < e.adjacencyMatrix.length; a++)
        (e.adjacencyMatrix[r][a] === 1 || e.adjacencyMatrix[a][r] === 1) && (n.has(a) || s(a, i));
    };
    for (let r = 0; r < e.adjacencyMatrix.length; r++)
      if (!n.has(r)) {
        const i = [];
        s(r, i), t.push(i);
      }
    return t;
  }
}
const G = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: v,
  canon: _,
  matching: p
}, Symbol.toStringTag, { value: "Module" }));
export {
  G as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
