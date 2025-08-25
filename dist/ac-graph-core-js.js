var N = Object.defineProperty;
var A = (b, e, t) => e in b ? N(b, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : b[e] = t;
var u = (b, e, t) => A(b, typeof e != "symbol" ? e + "" : e, t);
class w {
}
class E extends w {
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
  isSubgraphIsomorphic(e, t, o = [], n = [], s = null) {
    const a = e.adjacencyMatrix.length, r = t.adjacencyMatrix.length;
    if (a > r)
      return !1;
    s === null && (s = new Array(a).fill(-1));
    const i = e.labels && t.labels, c = Array(r).fill(!1), l = Array(a).fill(-1), p = new Set(o), x = new Set(n), [
      M,
      L,
      C,
      S
    ] = this.getInOutDegrees(e, t), D = M.map(
      (h, d) => C.map((f, y) => f >= h && S[y] >= L[d] && (s[d] === -1 || s[d] === y) && (!i || p.has(d) || e.labels[d] === t.labels[y]) ? y : -1).filter((f) => f !== -1)
    ), j = (h) => {
      if (h === a)
        return this.checkCompatibility(
          e,
          t,
          l,
          x
        );
      for (const d of D[h])
        if (!c[d]) {
          if (l[h] = d, c[d] = !0, this.isFeasible(
            e,
            t,
            l,
            h,
            x
          ) && j(h + 1))
            return !0;
          c[d] = !1, l[h] = -1;
        }
      return !1;
    };
    return j(0);
  }
  getInOutDegrees(e, t) {
    const o = e.adjacencyMatrix.map(
      (r) => r.reduce((i, c) => i + c, 0)
    ), n = [], s = t.adjacencyMatrix.map(
      (r) => r.reduce((i, c) => i + c, 0)
    ), a = [];
    return e.adjacencyMatrix.forEach((r, i) => {
      n.push(
        r.map((c, l) => e.adjacencyMatrix[l][i]).reduce((c, l) => c + l, 0)
      );
    }), t.adjacencyMatrix.forEach((r, i) => {
      a.push(
        r.map((c, l) => t.adjacencyMatrix[l][i]).reduce((c, l) => c + l, 0)
      );
    }), [
      o,
      n,
      s,
      a
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
  findAllSubgraphMonomorphisms(e, t, o = [], n = [], s = null) {
    const a = e.adjacencyMatrix.length, r = t.adjacencyMatrix.length, i = [], c = new Set(o), l = new Set(n);
    if (a > r)
      return i;
    s === null && (s = new Array(a).fill(-1));
    const p = e.labels && t.labels, x = Array(r).fill(!1), M = Array(a).fill(-1), [
      L,
      C,
      S,
      D
    ] = this.getInOutDegrees(e, t), j = L.map(
      (d, f) => S.map((y, m) => y >= d && D[m] >= C[f] && (s[f] === -1 || s[f] === m) && (!p || c.has(f) || e.labels[f] === t.labels[m]) ? m : -1).filter((y) => y !== -1)
    ), h = (d) => {
      if (d === a) {
        this.checkCompatibility(
          e,
          t,
          M,
          l
        ) && i.push([...M]);
        return;
      }
      for (const f of j[d])
        x[f] || (M[d] = f, x[f] = !0, this.isFeasible(
          e,
          t,
          M,
          d,
          l
        ) && h(d + 1), x[f] = !1, M[d] = -1);
    };
    return h(0), i;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(e, t, o, n, s) {
    const a = e.edgeLabels && t.edgeLabels;
    for (let r = 0; r < n; r++)
      if (e.adjacencyMatrix[n][r] && (!t.adjacencyMatrix[o[n]][o[r]] || a && !s.has(n + "," + r) && e.edgeLabels[n][r] !== t.edgeLabels[o[n]][o[r]]) || e.adjacencyMatrix[r][n] && (!t.adjacencyMatrix[o[r]][o[n]] || a && !s.has(r + "," + n) && e.edgeLabels[r][n] !== t.edgeLabels[o[r]][o[n]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(e, t, o, n) {
    const s = e.edgeLabels && t.edgeLabels, a = e.adjacencyMatrix.length;
    for (let r = 0; r < a; r++)
      for (let i = 0; i < a; i++)
        if (e.adjacencyMatrix[r][i] && (!t.adjacencyMatrix[o[r]][o[i]] || s && !n.has(r + "," + i) && e.edgeLabels[r][i] !== t.edgeLabels[o[r]][o[i]]))
          return !1;
    return !0;
  }
}
const I = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: w,
  UllmannGraphMatcher: E
}, Symbol.toStringTag, { value: "Module" })), g = class g {
  constructor(e, t = g.DefaultNodeKeySuffixGenerator, o = g.DefaultNodePropertiesMapper, n = g.DefaultNodePropertiesCanonKeyMapper) {
    u(this, "nodeCount");
    u(this, "hasNodeLabels");
    u(this, "hasNodeProperties");
    u(this, "hasEdgeLabels");
    u(this, "graph");
    u(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    u(this, "nodeKeys", /* @__PURE__ */ new Map());
    u(this, "inDegrees", /* @__PURE__ */ new Map());
    u(this, "outDegrees", /* @__PURE__ */ new Map());
    u(this, "nodePropertiesMapper");
    u(this, "nodePropertiesCanonKeyMapper");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = o, this.nodePropertiesCanonKeyMapper = n;
    for (let s = 0; s < this.nodeCount; s++) {
      const a = /* @__PURE__ */ new Set();
      let r = 0, i = 0;
      for (let l = 0; l < this.nodeCount; l++)
        e.adjacencyMatrix[s][l] === 1 && (i++, a.add(l)), e.adjacencyMatrix[l][s] === 1 && (r++, a.add(l));
      this.inDegrees.set(s, r), this.outDegrees.set(s, i), this.nodeNeighbors.set(s, [...a]);
      const c = i + "|" + r + t(e, s);
      this.nodeKeys.set(s, c);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let t = null, o = null, n = null;
    return this.individualizeDFS(e, [], (s, a) => {
      const r = this.buildRepresentationGraph(s), i = this.buildGraphString(r);
      (n === null || i.localeCompare(n) < 0) && (t = r, o = new Array(s.length), s.forEach((c, l) => o[c - 1] = l), n = i);
    }), [t, n, o];
  }
  partitionByPropertyKeys(e) {
    const t = /* @__PURE__ */ new Map();
    for (let n = 0; n < this.nodeCount; n++) {
      const s = this.nodeKeys.get(n);
      t.has(s) ? t.get(s).push(n) : t.set(s, [n]);
    }
    let o = 1;
    Array.from(t.keys()).sort((n, s) => n.localeCompare(s)).forEach((n) => {
      const s = t.get(n);
      s.forEach((a) => e[a] = o), o += s.length;
    });
  }
  isCanon(e) {
    return new Set(e).size === this.nodeCount;
  }
  individualizeDFS(e, t, o) {
    if (this.isCanon(e)) {
      o(e, t);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      o(e, t);
      return;
    }
    const n = this.getCurrentCells(e), s = Array.from(n.entries()).sort(([a], [r]) => a - r).filter(([, a]) => a.length > 1)[0];
    for (const a of s[1]) {
      const r = [...e];
      s[1].forEach((i) => {
        i !== a && (r[i] = s[0] + 1);
      }), this.individualizeDFS(
        r,
        [...t, a],
        o
      );
    }
  }
  individualizationRefinement(e) {
    let t = !1;
    for (; !t; ) {
      t = !0;
      const o = e.map((a, r) => [this.nodeNeighbors.get(r).map((l) => {
        let p = e[l].toString();
        return this.hasEdgeLabels && (p += ";" + this.graph.edgeLabels[r][l] + ";" + this.graph.edgeLabels[l][r]), p;
      }).sort().join("|"), r]), n = /* @__PURE__ */ new Map();
      for (const [a, r] of o) {
        const i = e[r];
        n.has(i) || n.set(i, /* @__PURE__ */ new Map());
        const c = n.get(i);
        c.has(a) || c.set(a, []), c.get(a).push(r);
      }
      const s = Array.from(n.keys()).sort();
      for (const a of s) {
        const r = Array.from(n.get(a).entries());
        if (r.length > 1) {
          t = !1, r.sort(([c], [l]) => l.localeCompare(c));
          let i = a;
          r.forEach(([, c]) => {
            c.forEach((l) => e[l] = i), i += c.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const t = /* @__PURE__ */ new Map();
    return e.forEach((o, n) => {
      t.has(o) ? t.get(o).push(n) : t.set(o, [n]);
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
    const t = e.map((n) => n - 1), o = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    for (let n = 0; n < this.nodeCount; n++)
      for (let s = 0; s < this.nodeCount; s++)
        o.adjacencyMatrix[t[n]][t[s]] = this.graph.adjacencyMatrix[n][s];
    if (this.hasNodeLabels && (o.labels = new Array(this.nodeCount), t.forEach((n, s) => o.labels[n] = this.graph.labels[s])), this.hasNodeProperties && (o.nodeProperties = new Array(this.nodeCount), t.forEach(
      (n, s) => o.nodeProperties[n] = this.nodePropertiesMapper(
        this.graph,
        s,
        t
      )
    )), this.hasEdgeLabels) {
      o.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let n = 0; n < this.nodeCount; n++)
        for (let s = 0; s < this.nodeCount; s++)
          o.edgeLabels[t[n]][t[s]] = this.graph.edgeLabels[n][s];
    }
    return o;
  }
  buildGraphString(e) {
    const t = [];
    for (let n = 0; n < this.nodeCount; n++)
      for (let s = 0; s < this.nodeCount; s++)
        e.adjacencyMatrix[n][s] === 1 && (this.hasEdgeLabels ? t.push(n + "-" + e.edgeLabels[n][s] + "-" + s) : t.push(n + "-" + s));
    let o = t.join("|");
    return this.hasNodeLabels && this.hasNodeProperties ? t.join("|") + ";" + e.labels.map((n, s) => {
      const a = this.nodePropertiesCanonKeyMapper(
        e,
        s
      );
      return n + (a.length > 0 ? "{" + a + "}" : "");
    }).join("|") : (this.hasNodeLabels ? o += ";" + e.labels.join("|") : this.hasNodeProperties && (o += ";" + e.nodeProperties.map(
      (n, s) => this.nodePropertiesCanonKeyMapper(e, s)
    ).join("|")), o);
  }
};
u(g, "DefaultNodeKeySuffixGenerator", (e, t) => e.labels ? e.labels[t] : ""), u(g, "DefaultNodePropertiesMapper", (e, t, o) => e.nodeProperties && e.nodeProperties[t] ? new Map(e.nodeProperties[t]) : void 0), u(g, "DefaultNodePropertiesCanonKeyMapper", (e, t) => "");
let P = g;
const K = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: P
}, Symbol.toStringTag, { value: "Module" }));
class O {
  static find(e) {
    const t = [], o = /* @__PURE__ */ new Set(), n = (s, a) => {
      o.add(s), a.push(s);
      for (let r = 0; r < e.adjacencyMatrix.length; r++)
        (e.adjacencyMatrix[s][r] === 1 || e.adjacencyMatrix[r][s] === 1) && (o.has(r) || n(r, a));
    };
    for (let s = 0; s < e.adjacencyMatrix.length; s++)
      if (!o.has(s)) {
        const a = [];
        n(s, a), t.push(a);
      }
    return t;
  }
}
const v = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: O,
  canon: K,
  matching: I
}, Symbol.toStringTag, { value: "Module" }));
export {
  v as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
