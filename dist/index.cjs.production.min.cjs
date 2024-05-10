"use strict";

var e = require("split-smartly2");

function i32(e, t) {
  return new Uint32Array(new Uint8Array([ ...e.slice(t, t + 4) ].reverse()).buffer)[0];
}

const t = /\r?\n/, r = /\x00\x00\x00\r?\n/;

function _isRawVersionPlus(e) {
  return r.test(e);
}

function _parseLine(e) {
  const [, t, r] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ t, r ];
}

function extractPromptAndInfoFromRaw(e) {
  const n = _isRawVersionPlus(e);
  let i = function _splitRawToLines(e) {
    return e.split(_isRawVersionPlus(e) ? r : t);
  }(e), o = "", s = "", a = "", p = [];
  const c = i.slice();
  if (n) {
    var f, l;
    if (i.length > 3) throw new TypeError;
    let e = i.pop();
    if (e.startsWith("Steps: ") && (a = e, e = void 0), null !== (f = e) && void 0 !== f || (e = i.pop()), 
    e.startsWith("Negative prompt: ") && (s = e.slice(17), e = void 0), null !== (l = e) && void 0 !== l || (e = i.pop()), 
    o = e, i.length) throw new TypeError;
  } else {
    let e = i.findIndex((e => e.match(/^Negative prompt:/)));
    o = i.splice(0, e).join("\n").trim();
    let t = i.findIndex((e => e.match(/^Steps:/)));
    s = i.splice(0, t).join("\n").slice(16).trim(), a = i.splice(0, 1)[0], p = i;
  }
  return o = o.replace(/\x00\x00\x00/g, ""), s = s.replace(/\x00\x00\x00/g, ""), {
    prompt: o,
    negative_prompt: s,
    infoline: a,
    infoline_extra: p,
    lines_raw: c
  };
}

const n = /*#__PURE__*/ Uint8Array.from("tEXt", (e => e.charCodeAt(0))).join(",");

function infoparser(t, r) {
  let n = [];
  if (null != r && r.isIncludePrompts) {
    const {prompt: e, negative_prompt: r, infoline: i} = extractPromptAndInfoFromRaw(t);
    n.push([ "prompt", e ]), n.push([ "negative_prompt", r ]), t = i;
  }
  return Object.fromEntries(n.concat(function handleInfoEntries(e, t) {
    const r = null == t ? void 0 : t.cast_to_snake, n = /^0\d/;
    return e.map((([e, t]) => {
      const i = parseFloat(t), o = n.test(t) || isNaN(i) || t - i != 0;
      return r && (e = function keyToSnakeStyle1(e) {
        return e.toLowerCase().replace(/ /g, "_");
      }(e)), [ e, o ? t : i ];
    }));
  }(function _parseInfoLine(t) {
    return e.splitSmartly(t, [ "," ], {
      brackets: !0,
      trimSeparators: !0
    }).map(_parseLine);
  }(t), r)));
}

function PNGINFO(e, t = !1) {
  let r = function inputToBytes(e) {
    return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
  }(e);
  const i = function extractRawFromBytes(e) {
    if ("137,80,78,71,13,10,26,10" !== e.slice(0, 8).join(",")) return;
    const [t, r, i] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], o = 8 + t + 12;
    if (e.slice(o + 4, o + 8).join(",") !== n) return;
    const s = i32(e, o);
    return {
      width: r,
      height: i,
      raw_info: function uint8arrayToString(e) {
        return (new TextDecoder).decode(e);
      }(e.slice(o + 8 + 11, o + 8 + s))
    };
  }(r);
  if (!i) return;
  const {raw_info: o, width: s, height: a} = i, {prompt: p, negative_prompt: c, infoline: f, infoline_extra: l} = extractPromptAndInfoFromRaw(o);
  return {
    metadata: {
      width: s,
      height: a,
      extra: l,
      raw_info: o
    },
    pnginfo: {
      prompt: p,
      negative_prompt: c,
      ...infoparser(f, {
        cast_to_snake: t
      })
    }
  };
}

Object.defineProperty(PNGINFO, "__esModule", {
  value: !0
}), Object.defineProperty(PNGINFO, "PNGINFO", {
  value: PNGINFO
}), Object.defineProperty(PNGINFO, "default", {
  value: PNGINFO
}), Object.defineProperty(PNGINFO, "infoparser", {
  value: infoparser
}), module.exports = PNGINFO;
//# sourceMappingURL=index.cjs.production.min.cjs.map
