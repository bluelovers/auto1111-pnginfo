import { splitSmartly as t } from "split-smartly2";

function i32(t, e) {
  return new Uint32Array(new Uint8Array([ ...t.slice(e, e + 4) ].reverse()).buffer)[0];
}

const e = /\r?\n/, n = /\x00\x00\x00\r?\n/;

function _isRawVersionPlus(t) {
  return n.test(t);
}

function _parseLine(t) {
  const [, e, n] = t.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ e, n ];
}

function extractPromptAndInfoFromRaw(t) {
  const r = _isRawVersionPlus(t);
  let i = function _splitRawToLines(t) {
    return t.split(_isRawVersionPlus(t) ? n : e);
  }(t), o = "", s = "", a = "", p = [];
  const c = i.slice();
  if (r) {
    var f, l;
    if (i.length > 3) throw new TypeError;
    let t = i.pop();
    if (t.startsWith("Steps: ") && (a = t, t = void 0), null !== (f = t) && void 0 !== f || (t = i.pop()), 
    t.startsWith("Negative prompt: ") && (s = t.slice(17), t = void 0), null !== (l = t) && void 0 !== l || (t = i.pop()), 
    o = t, i.length) throw new TypeError;
  } else {
    let t = i.findIndex((t => t.match(/^Negative prompt:/)));
    o = i.splice(0, t).join("\n").trim();
    let e = i.findIndex((t => t.match(/^Steps:/)));
    s = i.splice(0, e).join("\n").slice(16).trim(), a = i.splice(0, 1)[0], p = i;
  }
  return o = o.replace(/\x00\x00\x00/g, ""), s = s.replace(/\x00\x00\x00/g, ""), {
    prompt: o,
    negative_prompt: s,
    infoline: a,
    infoline_extra: p,
    lines_raw: c
  };
}

const r = /*#__PURE__*/ Uint8Array.from("tEXt", (t => t.charCodeAt(0))).join(",");

function infoparser(e, n) {
  let r = [];
  if (null != n && n.isIncludePrompts) {
    const {prompt: t, negative_prompt: n, infoline: i} = extractPromptAndInfoFromRaw(e);
    r.push([ "prompt", t ]), r.push([ "negative_prompt", n ]), e = i;
  }
  return Object.fromEntries(r.concat(function handleInfoEntries(t, e) {
    const n = null == e ? void 0 : e.cast_to_snake, r = /^0\d/;
    return t.map((([t, e]) => {
      const i = parseFloat(e), o = r.test(e) || isNaN(i) || e - i != 0;
      return n && (t = function keyToSnakeStyle1(t) {
        return t.toLowerCase().replace(/ /g, "_");
      }(t)), [ t, o ? e : i ];
    }));
  }(function _parseInfoLine(e) {
    return t(e, [ "," ], {
      brackets: !0,
      trimSeparators: !0
    }).map(_parseLine);
  }(e), n)));
}

function PNGINFO(t, e = !1) {
  let n = function inputToBytes(t) {
    return "undefined" != typeof Buffer && Buffer.isBuffer(t) || t instanceof Uint8Array ? t : Uint8Array.from(atob(t.slice(0, 8192)), (t => t.charCodeAt(0)));
  }(t);
  const i = function extractRawFromBytes(t) {
    if ("137,80,78,71,13,10,26,10" !== t.slice(0, 8).join(",")) return;
    const [e, n, i] = [ i32(t, 8), i32(t, 16), i32(t, 20) ], o = 8 + e + 12;
    if (t.slice(o + 4, o + 8).join(",") !== r) return;
    const s = i32(t, o);
    return {
      width: n,
      height: i,
      raw_info: function uint8arrayToString(t) {
        return (new TextDecoder).decode(t);
      }(t.slice(o + 8 + 11, o + 8 + s))
    };
  }(n);
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
        cast_to_snake: e
      })
    }
  };
}

export { PNGINFO, PNGINFO as default, infoparser };
//# sourceMappingURL=index.esm.mjs.map
