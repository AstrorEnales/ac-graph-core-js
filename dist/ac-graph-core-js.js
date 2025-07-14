var w = Object.defineProperty;
var C = (g, e, t) => e in g ? w(g, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : g[e] = t;
var y = (g, e, t) => C(g, typeof e != "symbol" ? e + "" : e, t);
class S {
}
class p extends S {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  isSubgraphIsomorphic(e, t) {
    const s = e.adjacencyMatrix.length, n = t.adjacencyMatrix.length;
    if (s > n)
      return !1;
    const r = e.labels && t.labels, a = Array(n).fill(!1), i = Array(s).fill(-1), l = [], d = [], h = [], M = [];
    for (let f = 0; f < s; f++) {
      const o = e.adjacencyMatrix[f];
      l.push(o.reduce((u, c) => u + c, 0)), d.push(
        o.map((u, c) => e.adjacencyMatrix[c][f]).reduce((u, c) => u + c, 0)
      );
    }
    for (let f = 0; f < n; f++) {
      const o = t.adjacencyMatrix[f];
      h.push(o.reduce((u, c) => u + c, 0)), M.push(
        o.map((u, c) => t.adjacencyMatrix[c][f]).reduce((u, c) => u + c, 0)
      );
    }
    const x = l.map(
      (f, o) => h.map((u, c) => u >= f && M[c] >= d[o] && (!r || e.labels[o] === t.labels[c]) ? c : -1).filter((u) => u !== -1)
    ), j = (f) => {
      if (f === s)
        return this.checkCompatibility(e, t, i);
      for (const o of x[f])
        if (!a[o]) {
          if (i[f] = o, a[o] = !0, this.isFeasible(e, t, i, f) && j(f + 1))
            return !0;
          a[o] = !1, i[f] = -1;
        }
      return !1;
    };
    return j(0);
  }
  /**
   * Collect all possible monomorphisms of the pattern graph in the target graph
   * including symmetries
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  findAllSubgraphMonomorphisms(e, t) {
    const s = e.adjacencyMatrix.length, n = t.adjacencyMatrix.length, r = [];
    if (s > n)
      return r;
    const a = e.labels && t.labels, i = Array(n).fill(!1), l = Array(s).fill(-1), d = [], h = [], M = [], x = [];
    for (let o = 0; o < s; o++) {
      const u = e.adjacencyMatrix[o];
      d.push(u.reduce((c, b) => c + b, 0)), h.push(
        u.map((c, b) => e.adjacencyMatrix[b][o]).reduce((c, b) => c + b, 0)
      );
    }
    for (let o = 0; o < n; o++) {
      const u = t.adjacencyMatrix[o];
      M.push(u.reduce((c, b) => c + b, 0)), x.push(
        u.map((c, b) => t.adjacencyMatrix[b][o]).reduce((c, b) => c + b, 0)
      );
    }
    const j = d.map(
      (o, u) => M.map((c, b) => c >= o && x[b] >= h[u] && (!a || e.labels[u] === t.labels[b]) ? b : -1).filter((c) => c !== -1)
    ), f = (o) => {
      if (o === s) {
        this.checkCompatibility(e, t, l) && r.push([...l]);
        return;
      }
      for (const u of j[o])
        i[u] || (l[o] = u, i[u] = !0, this.isFeasible(e, t, l, o) && f(o + 1), i[u] = !1, l[o] = -1);
    };
    return f(0), r;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, s, n) {
    const r = e.edgeLabels && t.edgeLabels;
    for (let a = 0; a < n; a++)
      if (e.adjacencyMatrix[n][a] && (!t.adjacencyMatrix[s[n]][s[a]] || r && e.edgeLabels[n][a] !== t.edgeLabels[s[n]][s[a]]) || e.adjacencyMatrix[a][n] && (!t.adjacencyMatrix[s[a]][s[n]] || r && e.edgeLabels[a][n] !== t.edgeLabels[s[a]][s[n]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, s) {
    const n = e.edgeLabels && t.edgeLabels, r = e.adjacencyMatrix.length;
    for (let a = 0; a < r; a++)
      for (let i = 0; i < r; i++)
        if (e.adjacencyMatrix[a][i] && (!t.adjacencyMatrix[s[a]][s[i]] || n && e.edgeLabels[a][i] !== t.edgeLabels[s[a]][s[i]]))
          return !1;
    return !0;
  }
}
const D = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: S,
  UllmannGraphMatcher: p
}, Symbol.toStringTag, { value: "Module" })), m = class m {
  constructor(e, t = m.DefaultNodeKeySuffixGenerator) {
    y(this, "nodeCount");
    y(this, "hasNodeLabels");
    y(this, "hasEdgeLabels");
    y(this, "graph");
    y(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    y(this, "nodeKeys", /* @__PURE__ */ new Map());
    y(this, "inDegrees", /* @__PURE__ */ new Map());
    y(this, "outDegrees", /* @__PURE__ */ new Map());
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0;
    for (let s = 0; s < this.nodeCount; s++) {
      const n = /* @__PURE__ */ new Set();
      let r = 0, a = 0;
      for (let l = 0; l < this.nodeCount; l++)
        e.adjacencyMatrix[s][l] === 1 && (a++, n.add(l)), e.adjacencyMatrix[l][s] === 1 && (r++, n.add(l));
      this.inDegrees.set(s, r), this.outDegrees.set(s, a), this.nodeNeighbors.set(s, [...n]);
      const i = a + "|" + r + t(e, s);
      this.nodeKeys.set(s, i);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let t = null, s = null, n = null;
    return this.individualizeDFS(e, [], (r, a) => {
      const i = this.buildRepresentationGraph(r), l = this.buildGraphString(i);
      (n === null || l.localeCompare(n) < 0) && (t = i, s = new Array(r.length), r.forEach((d, h) => s[d] = h), n = l);
    }), [t, n, s];
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let n = 0; n < this.nodeCount; n++) {
      const r = this.nodeKeys.get(n);
      t.has(r) ? t.get(r).push(n) : t.set(r, [n]);
    }
    let s = 1;
    Array.from(t.keys()).sort((n, r) => n.localeCompare(r)).forEach((n) => {
      const r = t.get(n);
      r.forEach((a) => e[a] = s), s += r.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, t, s) {
    if (this.isCanon(e)) {
      s(e, t);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      s(e, t);
      return;
    }
    const n = this.getCurrentCells(e), r = Array.from(n.entries()).sort(([a], [i]) => a - i).filter(([, a]) => a.length > 1)[0];
    for (const a of r[1]) {
      const i = [...e];
      r[1].forEach((l) => {
        l !== a && (i[l] = r[0] + 1);
      }), this.individualizeDFS(
        i,
        [...t, a],
        s
      );
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const s = e.map((a, i) => [this.nodeNeighbors.get(i).map((h) => {
        let M = e[h].toString();
        return this.hasEdgeLabels && (M += ";" + this.graph.edgeLabels[i][h] + ";" + this.graph.edgeLabels[h][i]), M;
      }).sort().join("|"), i]), n = /* @__PURE__ */ new Map();
      for (const [a, i] of s) {
        const l = e[i];
        n.has(l) || n.set(l, /* @__PURE__ */ new Map());
        const d = n.get(l);
        d.has(a) || d.set(a, []), d.get(a).push(i);
      }
      const r = Array.from(n.keys()).sort();
      for (const a of r) {
        const i = Array.from(n.get(a).entries());
        if (i.length > 1) {
          t = !1, i.sort(([d], [h]) => h.localeCompare(d));
          let l = a;
          i.forEach(([, d]) => {
            d.forEach((h) => e[h] = l), l += d.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const t = /* @__PURE__ */ new Map();
    return e.forEach((s, n) => {
      t.has(s) ? t.get(s).push(n) : t.set(s, [n]);
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
    for (let s = 0; s < this.nodeCount; s++)
      for (let n = 0; n < this.nodeCount; n++)
        t.adjacencyMatrix[e[s] - 1][e[n] - 1] = this.graph.adjacencyMatrix[s][n];
    if (this.hasNodeLabels && (t.labels = new Array(this.nodeCount), e.forEach(
      (s, n) => t.labels[s - 1] = this.graph.labels[n]
    )), this.hasEdgeLabels) {
      t.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let s = 0; s < this.nodeCount; s++)
        for (let n = 0; n < this.nodeCount; n++)
          t.edgeLabels[e[s] - 1][e[n] - 1] = this.graph.edgeLabels[s][n];
    }
    return t;
  }
  buildGraphString(e) {
    const t = [];
    for (let s = 0; s < this.nodeCount; s++)
      for (let n = 0; n < this.nodeCount; n++)
        e.adjacencyMatrix[s][n] === 1 && (this.hasEdgeLabels ? t.push(s + "-" + e.edgeLabels[s][n] + "-" + n) : t.push(s + "-" + n));
    return this.hasNodeLabels ? t.join("|") + ";" + e.labels.join("|") : t.join("|");
  }
};
y(m, "DefaultNodeKeySuffixGenerator", (e, t) => e.labels ? e.labels[t] : "");
let L = m;
const A = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: L
}, Symbol.toStringTag, { value: "Module" }));
class E {
  static find(e) {
    const t = [], s = /* @__PURE__ */ new Set(), n = (r, a) => {
      s.add(r), a.push(r);
      for (let i = 0; i < e.adjacencyMatrix.length; i++)
        (e.adjacencyMatrix[r][i] === 1 || e.adjacencyMatrix[i][r] === 1) && (s.has(i) || n(i, a));
    };
    for (let r = 0; r < e.adjacencyMatrix.length; r++)
      if (!s.has(r)) {
        const a = [];
        n(r, a), t.push(a);
      }
    return t;
  }
}
const I = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: E,
  canon: A,
  matching: D
}, Symbol.toStringTag, { value: "Module" }));
export {
  I as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
