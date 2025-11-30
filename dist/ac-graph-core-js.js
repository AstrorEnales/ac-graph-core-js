var A = Object.defineProperty;
var E = (M, e, n) => e in M ? A(M, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : M[e] = n;
var f = (M, e, n) => E(M, typeof e != "symbol" ? e + "" : e, n);
class P {
}
class I extends P {
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
    const a = e.labels && n.labels, c = Array(r).fill(!1), l = Array(i).fill(-1), u = new Set(o), y = new Set(t), [
      b,
      S,
      L,
      C
    ] = this.getInOutDegrees(e, n), w = b.map(
      (g, d) => L.map((h, p) => h >= g && C[p] >= S[d] && (s[d] === -1 || s[d] === p) && (!a || u.has(d) || e.labels[d] === n.labels[p]) ? p : -1).filter((h) => h !== -1)
    ), j = (g) => {
      if (g === i)
        return this.checkCompatibility(
          e,
          n,
          l,
          y
        );
      for (const d of w[g])
        if (!c[d]) {
          if (l[g] = d, c[d] = !0, this.isFeasible(
            e,
            n,
            l,
            g,
            y
          ) && j(g + 1))
            return !0;
          c[d] = !1, l[g] = -1;
        }
      return !1;
    };
    return j(0);
  }
  getInOutDegrees(e, n) {
    const o = e.adjacencyMatrix.map(
      (r) => r.reduce((a, c) => a + c, 0)
    ), t = [], s = n.adjacencyMatrix.map(
      (r) => r.reduce((a, c) => a + c, 0)
    ), i = [];
    return e.adjacencyMatrix.forEach((r, a) => {
      t.push(
        r.map((c, l) => e.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
      );
    }), n.adjacencyMatrix.forEach((r, a) => {
      i.push(
        r.map((c, l) => n.adjacencyMatrix[l][a]).reduce((c, l) => c + l, 0)
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
    const i = e.adjacencyMatrix.length, r = n.adjacencyMatrix.length, a = [], c = new Set(o), l = new Set(t);
    if (i > r)
      return a;
    s === null && (s = new Array(i).fill(-1));
    const u = e.labels && n.labels, y = Array(r).fill(!1), b = Array(i).fill(-1), [
      S,
      L,
      C,
      w
    ] = this.getInOutDegrees(e, n), j = S.map(
      (d, h) => C.map((p, m) => p >= d && w[m] >= L[h] && (s[h] === -1 || s[h] === m) && (!u || c.has(h) || e.labels[h] === n.labels[m]) ? m : -1).filter((p) => p !== -1)
    ), g = (d) => {
      if (d === i) {
        this.checkCompatibility(
          e,
          n,
          b,
          l
        ) && a.push([...b]);
        return;
      }
      for (const h of j[d])
        y[h] || (b[d] = h, y[h] = !0, this.isFeasible(
          e,
          n,
          b,
          d,
          l
        ) && g(d + 1), y[h] = !1, b[d] = -1);
    };
    return g(0), a;
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
const N = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: P,
  UllmannGraphMatcher: I
}, Symbol.toStringTag, { value: "Module" })), x = class x {
  constructor(e, n = x.DefaultNodeKeySuffixGenerator, o = x.DefaultNodePropertiesMapper, t = x.DefaultNodePropertiesCanonKeyMapper) {
    f(this, "nodeCount");
    f(this, "hasNodeLabels");
    f(this, "hasNodeProperties");
    f(this, "hasEdgeLabels");
    f(this, "graph");
    f(this, "nodeNeighbors", /* @__PURE__ */ new Map());
    f(this, "nodeKeys", /* @__PURE__ */ new Map());
    f(this, "inDegrees", /* @__PURE__ */ new Map());
    f(this, "outDegrees", /* @__PURE__ */ new Map());
    f(this, "nodePropertiesMapper");
    f(this, "nodePropertiesCanonKeyMapper");
    this.graph = e, this.nodeCount = e.adjacencyMatrix.length, this.hasNodeLabels = e.labels !== void 0, this.hasNodeProperties = e.nodeProperties !== void 0, this.hasEdgeLabels = e.edgeLabels !== void 0, this.nodePropertiesMapper = o, this.nodePropertiesCanonKeyMapper = t;
    for (let s = 0; s < this.nodeCount; s++) {
      const i = /* @__PURE__ */ new Set();
      let r = 0, a = 0;
      for (let l = 0; l < this.nodeCount; l++)
        e.adjacencyMatrix[s][l] === 1 && (a++, i.add(l)), e.adjacencyMatrix[l][s] === 1 && (r++, i.add(l));
      this.inDegrees.set(s, r), this.outDegrees.set(s, a), this.nodeNeighbors.set(s, [...i]);
      const c = a + "|" + r + "|" + n(e, s);
      this.nodeKeys.set(s, c);
    }
  }
  canonicalize() {
    const e = new Array(this.nodeCount).fill(1);
    this.partitionByPropertyKeys(e);
    let n = null, o = null, t = null;
    const s = Array.from(
      { length: this.nodeCount },
      (r) => /* @__PURE__ */ new Set()
    ), i = /* @__PURE__ */ new Set();
    return this.individualizeDFS(
      e,
      [],
      i,
      (r, a) => {
        for (let u = 0; u < r.length; u++)
          s[r[u] - 1].add(u);
        for (let u = 0; u < s.length; u++)
          if (s[u].size > 1) {
            const y = [...s[u]].sort();
            for (let b = 1; b < y.length; b++)
              i.add(y[b]);
          }
        const c = this.buildRepresentationGraph(r), l = this.buildGraphString(c);
        (t === null || l.localeCompare(t) < 0) && (n = c, o = new Array(r.length), r.forEach(
          (u, y) => o[u - 1] = y
        ), t = l);
      }
    ), [n, t, o];
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
  individualizeDFS(e, n, o, t) {
    if (this.isCanon(e)) {
      t(e, n);
      return;
    }
    if (this.individualizationRefinement(e), this.isCanon(e)) {
      t(e, n);
      return;
    }
    const s = this.getCurrentCells(e), i = Array.from(s.entries()).sort(([r], [a]) => r - a).filter(([, r]) => r.length > 1)[0];
    for (const r of i[1]) {
      if (o.has(r))
        continue;
      const a = [...e];
      i[1].forEach((l) => {
        l !== r && (a[l] = i[0] + 1);
      });
      const c = [...n, r];
      this.individualizeDFS(
        a,
        c,
        o,
        t
      );
    }
  }
  individualizationRefinement(e) {
    let n = !1;
    for (; !n; ) {
      n = !0;
      const o = e.map((i, r) => [this.nodeNeighbors.get(r).map((l) => {
        let u = e[l].toString();
        return this.hasEdgeLabels && (u += ";" + this.graph.edgeLabels[r][l] + ";" + this.graph.edgeLabels[l][r]), u;
      }).sort().join("|"), r]), t = /* @__PURE__ */ new Map();
      for (const [i, r] of o) {
        const a = e[r];
        t.has(a) || t.set(a, /* @__PURE__ */ new Map());
        const c = t.get(a);
        c.has(i) || c.set(i, []), c.get(i).push(r);
      }
      const s = Array.from(t.keys()).sort();
      for (const i of s) {
        const r = Array.from(t.get(i).entries());
        if (r.length > 1) {
          n = !1, r.sort(([c], [l]) => l.localeCompare(c));
          let a = i;
          r.forEach(([, c]) => {
            c.forEach((l) => e[l] = a), a += c.length;
          });
          break;
        }
      }
    }
  }
  getCurrentCells(e) {
    const n = /* @__PURE__ */ new Map();
    return e.forEach((o, t) => {
      n.has(o) ? n.get(o).push(t) : n.set(o, [t]);
    }), n;
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
    const n = e.map((t) => t - 1), o = {
      adjacencyMatrix: Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      )
    };
    for (let t = 0; t < this.nodeCount; t++)
      for (let s = 0; s < this.nodeCount; s++)
        o.adjacencyMatrix[n[t]][n[s]] = this.graph.adjacencyMatrix[t][s];
    if (this.hasNodeLabels && (o.labels = new Array(this.nodeCount), n.forEach((t, s) => o.labels[t] = this.graph.labels[s])), this.hasNodeProperties && (o.nodeProperties = new Array(this.nodeCount), n.forEach(
      (t, s) => o.nodeProperties[t] = this.nodePropertiesMapper(
        this.graph,
        s,
        n
      )
    )), this.hasEdgeLabels) {
      o.edgeLabels = Array.from(
        { length: this.nodeCount },
        () => new Array(this.nodeCount)
      );
      for (let t = 0; t < this.nodeCount; t++)
        for (let s = 0; s < this.nodeCount; s++)
          o.edgeLabels[n[t]][n[s]] = this.graph.edgeLabels[t][s];
    }
    return o;
  }
  buildGraphString(e) {
    const n = [];
    for (let t = 0; t < this.nodeCount; t++)
      for (let s = 0; s < this.nodeCount; s++)
        e.adjacencyMatrix[t][s] === 1 && (this.hasEdgeLabels ? n.push(t + "-" + e.edgeLabels[t][s] + "-" + s) : n.push(t + "-" + s));
    let o = n.join("|");
    return this.hasNodeLabels && this.hasNodeProperties ? n.join("|") + ";" + e.labels.map((t, s) => {
      const i = this.nodePropertiesCanonKeyMapper(
        e,
        s
      );
      return t + (i.length > 0 ? "{" + i + "}" : "");
    }).join("|") : (this.hasNodeLabels ? o += ";" + e.labels.join("|") : this.hasNodeProperties && (o += ";" + e.nodeProperties.map(
      (t, s) => this.nodePropertiesCanonKeyMapper(e, s)
    ).join("|")), o);
  }
};
f(x, "DefaultNodeKeySuffixGenerator", (e, n) => e.labels ? e.labels[n] : ""), f(x, "DefaultNodePropertiesMapper", (e, n, o) => e.nodeProperties && e.nodeProperties[n] ? new Map(e.nodeProperties[n]) : void 0), f(x, "DefaultNodePropertiesCanonKeyMapper", (e, n) => "");
let D = x;
const K = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphCanon: D
}, Symbol.toStringTag, { value: "Module" }));
class O {
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
const v = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectedComponents: O,
  canon: K,
  matching: N
}, Symbol.toStringTag, { value: "Module" }));
export {
  v as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
