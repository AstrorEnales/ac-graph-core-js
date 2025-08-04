var I = Object.defineProperty;
var O = (b, e, s) => e in b ? I(b, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : b[e] = s;
var h = (b, e, s) => O(b, typeof e != "symbol" ? e + "" : e, s);
class E {
}
class _ extends E {
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
  isSubgraphIsomorphic(e, s, n = [], t = [], a = null) {
    const i = e.adjacencyMatrix.length, r = s.adjacencyMatrix.length;
    if (i > r)
      return !1;
    a === null && (a = new Array(i).fill(-1));
    const o = e.labels && s.labels, l = Array(r).fill(!1), c = Array(i).fill(-1), x = new Set(n), M = new Set(t), [
      y,
      S,
      D,
      w
    ] = this.getInOutDegrees(e, s), C = y.map(
      (d, u) => D.map((f, g) => f >= d && w[g] >= S[u] && (a[u] === -1 || a[u] === g) && (!o || x.has(u) || e.labels[u] === s.labels[g]) ? g : -1).filter((f) => f !== -1)
    ), j = (d) => {
      if (d === i)
        return this.checkCompatibility(
          e,
          s,
          c,
          M
        );
      for (const u of C[d])
        if (!l[u]) {
          if (c[d] = u, l[u] = !0, this.isFeasible(
            e,
            s,
            c,
            d,
            M
          ) && j(d + 1))
            return !0;
          l[u] = !1, c[d] = -1;
        }
      return !1;
    };
    return j(0);
  }
  getInOutDegrees(e, s) {
    const n = e.adjacencyMatrix.map(
      (r) => r.reduce((o, l) => o + l, 0)
    ), t = [], a = s.adjacencyMatrix.map(
      (r) => r.reduce((o, l) => o + l, 0)
    ), i = [];
    return e.adjacencyMatrix.forEach((r, o) => {
      t.push(
        r.map((l, c) => e.adjacencyMatrix[c][o]).reduce((l, c) => l + c, 0)
      );
    }), s.adjacencyMatrix.forEach((r, o) => {
      i.push(
        r.map((l, c) => s.adjacencyMatrix[c][o]).reduce((l, c) => l + c, 0)
      );
    }), [
      n,
      t,
      a,
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
  findAllSubgraphMonomorphisms(e, s, n = [], t = [], a = null) {
    const i = e.adjacencyMatrix.length, r = s.adjacencyMatrix.length, o = [], l = new Set(n), c = new Set(t);
    if (i > r)
      return o;
    a === null && (a = new Array(i).fill(-1));
    const x = e.labels && s.labels, M = Array(r).fill(!1), y = Array(i).fill(-1), [
      S,
      D,
      w,
      C
    ] = this.getInOutDegrees(e, s), j = S.map(
      (u, f) => w.map((g, m) => g >= u && C[m] >= D[f] && (a[f] === -1 || a[f] === m) && (!x || l.has(f) || e.labels[f] === s.labels[m]) ? m : -1).filter((g) => g !== -1)
    ), d = (u) => {
      if (u === i) {
        this.checkCompatibility(
          e,
          s,
          y,
          c
        ) && o.push([...y]);
        return;
      }
      for (const f of j[u])
        M[f] || (y[u] = f, M[f] = !0, this.isFeasible(
          e,
          s,
          y,
          u,
          c
        ) && d(u + 1), M[f] = !1, y[u] = -1);
    };
    return d(0), o;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, s, n, t, a) {
    const i = e.edgeLabels && s.edgeLabels;
    for (let r = 0; r < t; r++)
      if (e.adjacencyMatrix[t][r] && (!s.adjacencyMatrix[n[t]][n[r]] || i && !a.has(t + "," + r) && e.edgeLabels[t][r] !== s.edgeLabels[n[t]][n[r]]) || e.adjacencyMatrix[r][t] && (!s.adjacencyMatrix[n[r]][n[t]] || i && !a.has(r + "," + t) && e.edgeLabels[r][t] !== s.edgeLabels[n[r]][n[t]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, s, n, t) {
    const a = e.edgeLabels && s.edgeLabels, i = e.adjacencyMatrix.length;
    for (let r = 0; r < i; r++)
      for (let o = 0; o < i; o++)
        if (e.adjacencyMatrix[r][o] && (!s.adjacencyMatrix[n[r]][n[o]] || a && !t.has(r + "," + o) && e.edgeLabels[r][o] !== s.edgeLabels[n[r]][n[o]]))
          return !1;
    return !0;
  }
}
const v = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: E,
  UllmannGraphMatcher: _
}, Symbol.toStringTag, { value: "Module" })), L = class L {
  constructor(e, s = L.DefaultNodeKeySuffixGenerator) {
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
      const t = /* @__PURE__ */ new Set();
      let a = 0, i = 0;
      for (let o = 0; o < this.nodeCount; o++)
        e.adjacencyMatrix[n][o] === 1 && (i++, t.add(o)), e.adjacencyMatrix[o][n] === 1 && (a++, t.add(o));
      this.inDegrees.set(n, a), this.outDegrees.set(n, i), this.nodeNeighbors.set(n, [...t]);
      const r = i + "|" + a + s(e, n);
      this.nodeKeys.set(n, r);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let s = null, n = null, t = null;
    return this.individualizeDFS(e, [], (a, i) => {
      const r = this.buildRepresentationGraph(a), o = this.buildGraphString(r);
      (t === null || o.localeCompare(t) < 0) && (s = r, n = new Array(a.length), a.forEach((l, c) => n[l - 1] = c), t = o);
    }), [s, t, n];
  }
  partitionByPropertyKeys(e) {
    const s = /* @__PURE__ */ new Map();
    for (let t = 0; t < this.nodeCount; t++) {
      const a = this.nodeKeys.get(t);
      s.has(a) ? s.get(a).push(t) : s.set(a, [t]);
    }
    let n = 1;
    Array.from(s.keys()).sort((t, a) => t.localeCompare(a)).forEach((t) => {
      const a = s.get(t);
      a.forEach((i) => e[i] = n), n += a.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, s, n) {
    if (this.isCanon(e)) {
      n(e, s);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      n(e, s);
      return;
    }
    const t = this.getCurrentCells(e), a = Array.from(t.entries()).sort(([i], [r]) => i - r).filter(([, i]) => i.length > 1)[0];
    for (const i of a[1]) {
      const r = [...e];
      a[1].forEach((o) => {
        o !== i && (r[o] = a[0] + 1);
      }), this.individualizeDFS(
        r,
        [...s, i],
        n
      );
    }
  }
  individualizationRefinement(e) {
    let s = !1;
    for (; !s; ) {
      s = !0;
      const n = e.map((i, r) => [this.nodeNeighbors.get(r).map((c) => {
        let x = e[c].toString();
        return this.hasEdgeLabels && (x += ";" + this.graph.edgeLabels[r][c] + ";" + this.graph.edgeLabels[c][r]), x;
      }).sort().join("|"), r]), t = /* @__PURE__ */ new Map();
      for (const [i, r] of n) {
        const o = e[r];
        t.has(o) || t.set(o, /* @__PURE__ */ new Map());
        const l = t.get(o);
        l.has(i) || l.set(i, []), l.get(i).push(r);
      }
      const a = Array.from(t.keys()).sort();
      for (const i of a) {
        const r = Array.from(t.get(i).entries());
        if (r.length > 1) {
          s = !1, r.sort(([l], [c]) => c.localeCompare(l));
          let o = i;
          r.forEach(([, l]) => {
            l.forEach((c) => e[c] = o), o += l.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const s = /* @__PURE__ */ new Map();
    return e.forEach((n, t) => {
      s.has(n) ? s.get(n).push(t) : s.set(n, [t]);
    }), s;
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
    const s = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    for (let n = 0; n < this.nodeCount; n++)
      for (let t = 0; t < this.nodeCount; t++)
        s.adjacencyMatrix[e[n] - 1][e[t] - 1] = this.graph.adjacencyMatrix[n][t];
    if (this.hasNodeLabels && (s.labels = new Array(this.nodeCount), e.forEach(
      (n, t) => s.labels[n - 1] = this.graph.labels[t]
    )), this.hasEdgeLabels) {
      s.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let n = 0; n < this.nodeCount; n++)
        for (let t = 0; t < this.nodeCount; t++)
          s.edgeLabels[e[n] - 1][e[t] - 1] = this.graph.edgeLabels[n][t];
    }
    return s;
  }
  buildGraphString(e) {
    const s = [];
    for (let n = 0; n < this.nodeCount; n++)
      for (let t = 0; t < this.nodeCount; t++)
        e.adjacencyMatrix[n][t] === 1 && (this.hasEdgeLabels ? s.push(n + "-" + e.edgeLabels[n][t] + "-" + t) : s.push(n + "-" + t));
    return this.hasNodeLabels ? s.join("|") + ";" + e.labels.join("|") : s.join("|");
  }
};
h(L, "DefaultNodeKeySuffixGenerator", (e, s) => e.labels ? e.labels[s] : "");
let A = L;
const z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: A
}, Symbol.toStringTag, { value: "Module" }));
class G {
  static find(e) {
    const s = [], n = /* @__PURE__ */ new Set(), t = (a, i) => {
      n.add(a), i.push(a);
      for (let r = 0; r < e.adjacencyMatrix.length; r++)
        (e.adjacencyMatrix[a][r] === 1 || e.adjacencyMatrix[r][a] === 1) && (n.has(r) || t(r, i));
    };
    for (let a = 0; a < e.adjacencyMatrix.length; a++)
      if (!n.has(a)) {
        const i = [];
        t(a, i), s.push(i);
      }
    return s;
  }
}
const k = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: G,
  canon: z,
  matching: v
}, Symbol.toStringTag, { value: "Module" }));
export {
  k as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
