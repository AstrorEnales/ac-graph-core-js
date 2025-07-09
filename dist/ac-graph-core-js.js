var S = Object.defineProperty;
var w = (M, e, t) => e in M ? S(M, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : M[e] = t;
var y = (M, e, t) => w(M, typeof e != "symbol" ? e + "" : e, t);
class C {
}
class p extends C {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  isSubgraphIsomorphic(e, t) {
    const s = e.adjacencyMatrix.length, r = t.adjacencyMatrix.length;
    if (s > r)
      return !1;
    const o = e.labels && t.labels, n = Array(r).fill(!1), a = Array(s).fill(-1), u = [], f = [], b = [], g = [];
    for (let d = 0; d < s; d++) {
      const i = e.adjacencyMatrix[d];
      u.push(i.reduce((c, l) => c + l, 0)), f.push(
        i.map((c, l) => e.adjacencyMatrix[l][d]).reduce((c, l) => c + l, 0)
      );
    }
    for (let d = 0; d < r; d++) {
      const i = t.adjacencyMatrix[d];
      b.push(i.reduce((c, l) => c + l, 0)), g.push(
        i.map((c, l) => t.adjacencyMatrix[l][d]).reduce((c, l) => c + l, 0)
      );
    }
    const j = u.map(
      (d, i) => b.map((c, l) => c >= d && g[l] >= f[i] && (!o || e.labels[i] === t.labels[l]) ? l : -1).filter((c) => c !== -1)
    ), x = (d) => {
      if (d === s)
        return this.checkCompatibility(e, t, a);
      for (const i of j[d])
        if (!n[i]) {
          if (a[d] = i, n[i] = !0, this.isFeasible(e, t, a, d) && x(d + 1))
            return !0;
          n[i] = !1, a[d] = -1;
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
    const s = e.adjacencyMatrix.length, r = t.adjacencyMatrix.length, o = [];
    if (s > r)
      return o;
    const n = e.labels && t.labels, a = Array(r).fill(!1), u = Array(s).fill(-1), f = [], b = [], g = [], j = [];
    for (let i = 0; i < s; i++) {
      const c = e.adjacencyMatrix[i];
      f.push(c.reduce((l, h) => l + h, 0)), b.push(
        c.map((l, h) => e.adjacencyMatrix[h][i]).reduce((l, h) => l + h, 0)
      );
    }
    for (let i = 0; i < r; i++) {
      const c = t.adjacencyMatrix[i];
      g.push(c.reduce((l, h) => l + h, 0)), j.push(
        c.map((l, h) => t.adjacencyMatrix[h][i]).reduce((l, h) => l + h, 0)
      );
    }
    const x = f.map(
      (i, c) => g.map((l, h) => l >= i && j[h] >= b[c] && (!n || e.labels[c] === t.labels[h]) ? h : -1).filter((l) => l !== -1)
    ), d = (i) => {
      if (i === s) {
        this.checkCompatibility(e, t, u) && o.push([...u]);
        return;
      }
      for (const c of x[i])
        a[c] || (u[i] = c, a[c] = !0, this.isFeasible(e, t, u, i) && d(i + 1), a[c] = !1, u[i] = -1);
    };
    return d(0), o;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, s, r) {
    const o = e.edgeLabels && t.edgeLabels;
    for (let n = 0; n < r; n++)
      if (e.adjacencyMatrix[r][n] && (!t.adjacencyMatrix[s[r]][s[n]] || o && e.edgeLabels[r][n] !== t.edgeLabels[s[r]][s[n]]) || e.adjacencyMatrix[n][r] && (!t.adjacencyMatrix[s[n]][s[r]] || o && e.edgeLabels[n][r] !== t.edgeLabels[s[n]][s[r]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, s) {
    const r = e.edgeLabels && t.edgeLabels, o = e.adjacencyMatrix.length;
    for (let n = 0; n < o; n++)
      for (let a = 0; a < o; a++)
        if (e.adjacencyMatrix[n][a] && (!t.adjacencyMatrix[s[n]][s[a]] || r && e.edgeLabels[n][a] !== t.edgeLabels[s[n]][s[a]]))
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
      const r = /* @__PURE__ */ new Set();
      let o = 0, n = 0;
      for (let u = 0; u < this.nodeCount; u++)
        e.adjacencyMatrix[s][u] === 1 && (n++, r.add(u)), e.adjacencyMatrix[u][s] === 1 && (o++, r.add(u));
      this.inDegrees.set(s, o), this.outDegrees.set(s, n), this.nodeNeighbors.set(s, [...r]);
      const a = n + "|" + o + t(e, s);
      this.nodeKeys.set(s, a);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let t = null, s = null;
    return this.individualizeDFS(e, [], (r, o) => {
      const n = this.buildRepresentationGraph(r), a = this.buildGraphString(n);
      (s === null || a.localeCompare(s) < 0) && (t = n, s = a);
    }), t;
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let r = 0; r < this.nodeCount; r++) {
      const o = this.nodeKeys.get(r);
      t.has(o) ? t.get(o).push(r) : t.set(o, [r]);
    }
    let s = 1;
    Array.from(t.keys()).sort((r, o) => r.localeCompare(o)).forEach((r) => {
      const o = t.get(r);
      o.forEach((n) => e[n] = s), s += o.length;
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
    const r = this.getCurrentCells(e), o = Array.from(r.entries()).sort(([n], [a]) => n - a).filter(([, n]) => n.length > 1)[0];
    for (const n of o[1]) {
      const a = [...e];
      o[1].forEach((u) => {
        u !== n && (a[u] = o[0] + 1);
      }), this.individualizeDFS(
        a,
        [...t, n],
        s
      );
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const s = e.map((n, a) => [this.nodeNeighbors.get(a).map((b) => {
        let g = e[b].toString();
        return this.hasEdgeLabels && (g += ";" + this.graph.edgeLabels[a][b] + ";" + this.graph.edgeLabels[b][a]), g;
      }).sort().join("|"), a]), r = /* @__PURE__ */ new Map();
      for (const [n, a] of s) {
        const u = e[a];
        r.has(u) || r.set(u, /* @__PURE__ */ new Map());
        const f = r.get(u);
        f.has(n) || f.set(n, []), f.get(n).push(a);
      }
      const o = Array.from(r.keys()).sort();
      for (const n of o) {
        const a = Array.from(r.get(n).entries());
        if (a.length > 1) {
          t = !1, a.sort(([f], [b]) => b.localeCompare(f));
          let u = n;
          a.forEach(([, f]) => {
            f.forEach((b) => e[b] = u), u += f.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const t = /* @__PURE__ */ new Map();
    return e.forEach((s, r) => {
      t.has(s) ? t.get(s).push(r) : t.set(s, [r]);
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
      for (let r = 0; r < this.nodeCount; r++)
        t.adjacencyMatrix[e[s] - 1][e[r] - 1] = this.graph.adjacencyMatrix[s][r];
    if (this.hasNodeLabels && (t.labels = new Array(this.nodeCount), e.forEach(
      (s, r) => t.labels[s - 1] = this.graph.labels[r]
    )), this.hasEdgeLabels) {
      t.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let s = 0; s < this.nodeCount; s++)
        for (let r = 0; r < this.nodeCount; r++)
          t.edgeLabels[e[s] - 1][e[r] - 1] = this.graph.edgeLabels[s][r];
    }
    return t;
  }
  buildGraphString(e) {
    const t = [];
    for (let s = 0; s < this.nodeCount; s++)
      for (let r = 0; r < this.nodeCount; r++)
        e.adjacencyMatrix[s][r] === 1 && (this.hasEdgeLabels ? t.push(s + "-" + e.edgeLabels[s][r] + "-" + r) : t.push(s + "-" + r));
    return this.hasNodeLabels ? t.join("|") + ";" + e.labels.join("|") : t.join("|");
  }
};
y(m, "DefaultNodeKeySuffixGenerator", (e, t) => e.labels ? e.labels[t] : "");
let L = m;
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: L
}, Symbol.toStringTag, { value: "Module" })), E = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  canon: _,
  matching: D
}, Symbol.toStringTag, { value: "Module" }));
export {
  E as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
