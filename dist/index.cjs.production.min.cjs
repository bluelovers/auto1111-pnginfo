"use strict";

function i32(e, t) {
  return new Uint32Array(new Uint8Array([ ...e.slice(t, t + 4) ].reverse()).buffer)[0];
}

function infoparser(e) {
  let t, r, i = {}, n = "", f = !1;
  ":" === e.at(-1) && (e = e.slice(0, -1));
  for (let o = 0; o < e.length; o++) {
    let a = e[o], l = !0;
    '"' === a && (f = !f), f || (":" === a ? (t = n.trim(), n = "", l = !1) : "," === a && ("Cutoff targets" === t && "]" !== r || (i[t] = n.slice(1), 
    n = "", l = !1))), l && (n += a), r = a;
  }
  return t && (i[t] = n.slice(1)), i;
}

function PNGINFO(e, t = !1) {
  let r, i;
  if ("undefined" != typeof Buffer && Buffer.isBuffer(e) ? (i = Uint8Array.from(e), 
  r = e.toString()) : e instanceof Uint8Array ? (i = e, r = e.toString()) : (r = atob(e.slice(0, 8192)), 
  i = Uint8Array.from(r, (e => e.charCodeAt(0)))), "137,80,78,71,13,10,26,10" != i.slice(0, 8)) return;
  let [n, f, o] = [ i32(i, 8), i32(i, 16), i32(i, 20) ], a = 8 + n + 12;
  if ("tEXt" != r.slice(a + 4, a + 8)) return;
  let l = i32(i, a), s = r.slice(a + 8 + 11, a + 8 + l), c = s.split("\n"), p = c.findIndex((e => e.match(/^Negative prompt:/))), u = c.splice(0, p).join("\n").trim(), N = c.findIndex((e => e.match(/^Steps:/))), O = c.splice(0, N).join("\n").slice(16).trim(), d = infoparser(c.splice(0, 1)[0]);
  return d = Object.fromEntries(Object.entries(d).map((([e, r]) => {
    let i = parseFloat(r), n = r - i;
    return t && (e = e.toLowerCase().replaceAll(" ", "_")), [ e, n || isNaN(n) ? r : i ];
  }))), Object.assign({
    width: f,
    height: o,
    prompt: u,
    negative_prompt: O,
    extra: c,
    raw_info: s
  }, d);
}

Object.defineProperty(PNGINFO, "__esModule", {
  value: !0
}), Object.defineProperty(PNGINFO, "PNGINFO", {
  value: PNGINFO
}), Object.defineProperty(PNGINFO, "default", {
  value: PNGINFO
}), Object.defineProperty(PNGINFO, "infoparser", {
  value: infoparser
}), Object.defineProperty(PNGINFO, "i32", {
  value: i32
}), module.exports = PNGINFO;
//# sourceMappingURL=index.cjs.production.min.cjs.map
