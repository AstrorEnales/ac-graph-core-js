var S = Object.defineProperty;
var w = (g, e, t) => e in g ? S(g, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : g[e] = t;
var y = (g, e, t) => w(g, typeof e != "symbol" ? e + "" : e, t);
class C {
}
class p extends C {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  isSubgraphIsomorphic(e, t) {
    const s = e.adjacencyMatrix.length, n = t.adjacencyMatrix.length;
    if (s > n)
      return !1;
    const i = e.labels && t.labels, a = Array(n).fill(!1), r = Array(s).fill(-1), u = [], f = [], b = [], M = [];
    for (let d = 0; d < s; d++) {
      const o = e.adjacencyMatrix[d];
      u.push(o.reduce((c, l) => c + l, 0)), f.push(
        o.map((c, l) => e.adjacencyMatrix[l][d]).reduce((c, l) => c + l, 0)
      );
    }
    for (let d = 0; d < n; d++) {
      const o = t.adjacencyMatrix[d];
      b.push(o.reduce((c, l) => c + l, 0)), M.push(
        o.map((c, l) => t.adjacencyMatrix[l][d]).reduce((c, l) => c + l, 0)
      );
    }
    const j = u.map(
      (d, o) => b.map((c, l) => c >= d && M[l] >= f[o] && (!i || e.labels[o] === t.labels[l]) ? l : -1).filter((c) => c !== -1)
    ), x = (d) => {
      if (d === s)
        return this.checkCompatibility(e, t, r);
      for (const o of j[d])
        if (!a[o]) {
          if (r[d] = o, a[o] = !0, this.isFeasible(e, t, r, d) && x(d + 1))
            return !0;
          a[o] = !1, r[d] = -1;
        }
      return !1;
    };
    return x(0);
  }
  /**
   * Collect all possible monomorphisms of the pattern graph in the target graph
   * including symmetries
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  findAllSubgraphMonomorphisms(e, t) {
    const s = e.adjacencyMatrix.length, n = t.adjacencyMatrix.length, i = [];
    if (s > n)
      return i;
    const a = e.labels && t.labels, r = Array(n).fill(!1), u = Array(s).fill(-1), f = [], b = [], M = [], j = [];
    for (let o = 0; o < s; o++) {
      const c = e.adjacencyMatrix[o];
      f.push(c.reduce((l, h) => l + h, 0)), b.push(
        c.map((l, h) => e.adjacencyMatrix[h][o]).reduce((l, h) => l + h, 0)
      );
    }
    for (let o = 0; o < n; o++) {
      const c = t.adjacencyMatrix[o];
      M.push(c.reduce((l, h) => l + h, 0)), j.push(
        c.map((l, h) => t.adjacencyMatrix[h][o]).reduce((l, h) => l + h, 0)
      );
    }
    const x = f.map(
      (o, c) => M.map((l, h) => l >= o && j[h] >= b[c] && (!a || e.labels[c] === t.labels[h]) ? h : -1).filter((l) => l !== -1)
    ), d = (o) => {
      if (o === s) {
        this.checkCompatibility(e, t, u) && i.push([...u]);
        return;
      }
      for (const c of x[o])
        r[c] || (u[o] = c, r[c] = !0, this.isFeasible(e, t, u, o) && d(o + 1), r[c] = !1, u[o] = -1);
    };
    return d(0), i;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, s, n) {
    const i = e.edgeLabels && t.edgeLabels;
    for (let a = 0; a < n; a++)
      if (e.adjacencyMatrix[n][a] && (!t.adjacencyMatrix[s[n]][s[a]] || i && e.edgeLabels[n][a] !== t.edgeLabels[s[n]][s[a]]) || e.adjacencyMatrix[a][n] && (!t.adjacencyMatrix[s[a]][s[n]] || i && e.edgeLabels[a][n] !== t.edgeLabels[s[a]][s[n]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, s) {
    const n = e.edgeLabels && t.edgeLabels, i = e.adjacencyMatrix.length;
    for (let a = 0; a < i; a++)
      for (let r = 0; r < i; r++)
        if (e.adjacencyMatrix[a][r] && (!t.adjacencyMatrix[s[a]][s[r]] || n && e.edgeLabels[a][r] !== t.edgeLabels[s[a]][s[r]]))
          return !1;
    return !0;
  }
}
const D = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: C,
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
      let i = 0, a = 0;
      for (let u = 0; u < this.nodeCount; u++)
        e.adjacencyMatrix[s][u] === 1 && (a++, n.add(u)), e.adjacencyMatrix[u][s] === 1 && (i++, n.add(u));
      this.inDegrees.set(s, i), this.outDegrees.set(s, a), this.nodeNeighbors.set(s, [...n]);
      const r = a + "|" + i + t(e, s);
      this.nodeKeys.set(s, r);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let t = null, s = null;
    return this.individualizeDFS(e, [], (n, i) => {
      const a = this.buildRepresentationGraph(n), r = this.buildGraphString(a);
      (s === null || r.localeCompare(s) < 0) && (t = a, s = r);
    }), t;
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let n = 0; n < this.nodeCount; n++) {
      const i = this.nodeKeys.get(n);
      t.has(i) ? t.get(i).push(n) : t.set(i, [n]);
    }
    let s = 1;
    Array.from(t.keys()).sort((n, i) => n.localeCompare(i)).forEach((n) => {
      const i = t.get(n);
      i.forEach((a) => e[a] = s), s += i.length;
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
    const n = this.getCurrentCells(e), i = Array.from(n.entries()).sort(([a], [r]) => a - r).filter(([, a]) => a.length > 1)[0];
    for (const a of i[1]) {
      const r = [...e];
      i[1].forEach((u) => {
        u !== a && (r[u] = i[0] + 1);
      }), this.individualizeDFS(
        r,
        [...t, a],
        s
      );
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const s = e.map((a, r) => [this.nodeNeighbors.get(r).map((b) => {
        let M = e[b].toString();
        return this.hasEdgeLabels && (M += ";" + this.graph.edgeLabels[r][b] + ";" + this.graph.edgeLabels[b][r]), M;
      }).sort().join("|"), r]), n = /* @__PURE__ */ new Map();
      for (const [a, r] of s) {
        const u = e[r];
        n.has(u) || n.set(u, /* @__PURE__ */ new Map());
        const f = n.get(u);
        f.has(a) || f.set(a, []), f.get(a).push(r);
      }
      const i = Array.from(n.keys()).sort();
      for (const a of i) {
        const r = Array.from(n.get(a).entries());
        if (r.length > 1) {
          t = !1, r.sort(([f], [b]) => b.localeCompare(f));
          let u = a;
          r.forEach(([, f]) => {
            f.forEach((b) => e[b] = u), u += f.length;
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
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: L
}, Symbol.toStringTag, { value: "Module" }));
class A {
  static find(e) {
    const t = [], s = /* @__PURE__ */ new Set(), n = (i, a) => {
      s.add(i), a.push(i);
      for (let r = 0; r < e.adjacencyMatrix.length; r++)
        (e.adjacencyMatrix[i][r] === 1 || e.adjacencyMatrix[r][i] === 1) && (s.has(r) || n(r, a));
    };
    for (let i = 0; i < e.adjacencyMatrix.length; i++)
      if (!s.has(i)) {
        const a = [];
        n(i, a), t.push(a);
      }
    return t;
  }
}
const I = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: A,
  canon: _,
  matching: D
}, Symbol.toStringTag, { value: "Module" }));
export {
  I as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
