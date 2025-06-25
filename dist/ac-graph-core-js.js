class m {
}
class L extends m {
  /**
   * Subgraph isomorphism check
   * @param pattern Pattern graph adjacency matrix
   * @param target Target graph adjacency matrix
   */
  isSubgraphIsomorphic(a, r) {
    const l = a.adjacencyMatrix.length, o = r.adjacencyMatrix.length;
    if (l > o)
      return !1;
    const t = a.labels && r.labels, n = Array(o).fill(!1), u = Array(l).fill(-1), d = [], b = [], y = [], M = [];
    for (let i = 0; i < l; i++) {
      const e = a.adjacencyMatrix[i];
      d.push(e.reduce((c, s) => c + s, 0)), b.push(
        e.map((c, s) => a.adjacencyMatrix[s][i]).reduce((c, s) => c + s, 0)
      );
    }
    for (let i = 0; i < o; i++) {
      const e = r.adjacencyMatrix[i];
      y.push(e.reduce((c, s) => c + s, 0)), M.push(
        e.map((c, s) => r.adjacencyMatrix[s][i]).reduce((c, s) => c + s, 0)
      );
    }
    const x = d.map(
      (i, e) => y.map((c, s) => c >= i && M[s] >= b[e] && (!t || a.labels[e] === r.labels[s]) ? s : -1).filter((c) => c !== -1)
    ), j = (i) => {
      if (i === l)
        return this.checkCompatibility(a, r, u);
      for (const e of x[i])
        if (!n[e]) {
          if (u[i] = e, n[e] = !0, this.isFeasible(a, r, u, i) && j(i + 1))
            return !0;
          n[e] = !1, u[i] = -1;
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
  findAllSubgraphMonomorphisms(a, r) {
    const l = a.adjacencyMatrix.length, o = r.adjacencyMatrix.length, t = [];
    if (l > o)
      return t;
    const n = a.labels && r.labels, u = Array(o).fill(!1), d = Array(l).fill(-1), b = [], y = [], M = [], x = [];
    for (let e = 0; e < l; e++) {
      const c = a.adjacencyMatrix[e];
      b.push(c.reduce((s, f) => s + f, 0)), y.push(
        c.map((s, f) => a.adjacencyMatrix[f][e]).reduce((s, f) => s + f, 0)
      );
    }
    for (let e = 0; e < o; e++) {
      const c = r.adjacencyMatrix[e];
      M.push(c.reduce((s, f) => s + f, 0)), x.push(
        c.map((s, f) => r.adjacencyMatrix[f][e]).reduce((s, f) => s + f, 0)
      );
    }
    const j = b.map(
      (e, c) => M.map((s, f) => s >= e && x[f] >= y[c] && (!n || a.labels[c] === r.labels[f]) ? f : -1).filter((s) => s !== -1)
    ), i = (e) => {
      if (e === l) {
        this.checkCompatibility(a, r, d) && t.push([...d]);
        return;
      }
      for (const c of j[e])
        u[c] || (d[e] = c, u[c] = !0, this.isFeasible(a, r, d, e) && i(e + 1), u[c] = !1, d[e] = -1);
    };
    return i(0), t;
  }
  /**
   * Feasibility check for current depth: preserve pattern edges
   * and edge labels if present
   */
  isFeasible(a, r, l, o) {
    const t = a.edgeLabels && r.edgeLabels;
    for (let n = 0; n < o; n++)
      if (a.adjacencyMatrix[o][n] && (!r.adjacencyMatrix[l[o]][l[n]] || t && a.edgeLabels[o][n] !== r.edgeLabels[l[o]][l[n]]) || a.adjacencyMatrix[n][o] && (!r.adjacencyMatrix[l[n]][l[o]] || t && a.edgeLabels[n][o] !== r.edgeLabels[l[n]][l[o]]))
        return !1;
    return !0;
  }
  /**
   * Verifies full structural consistency of the mapping
   */
  checkCompatibility(a, r, l) {
    const o = a.edgeLabels && r.edgeLabels, t = a.adjacencyMatrix.length;
    for (let n = 0; n < t; n++)
      for (let u = 0; u < t; u++)
        if (a.adjacencyMatrix[n][u] && (!r.adjacencyMatrix[l[n]][l[u]] || o && a.edgeLabels[n][u] !== r.edgeLabels[l[n]][l[u]]))
          return !1;
    return !0;
  }
}
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GraphMatcher: m,
  UllmannGraphMatcher: L
}, Symbol.toStringTag, { value: "Module" })), g = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  matching: _
}, Symbol.toStringTag, { value: "Module" }));
export {
  g as graph
};
//# sourceMappingURL=ac-graph-core-js.js.map
