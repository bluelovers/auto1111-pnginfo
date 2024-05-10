import { crlf as e } from "crlf-normalize";

import { splitSmartly as t } from "split-smartly2";

function i32(e, t) {
  return new Uint32Array(new Uint8Array([ ...e.slice(t, t + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(t) {
  return e(t).replace(/[\s\r\n]+$/g, "");
}

const n = /\r?\n/, r = /\x00\x00\x00\r?\n/;

function _splitRawToLines(e) {
  return e.split(_isRawVersionPlus(e) ? r : n);
}

function _isRawVersionPlus(e) {
  return r.test(e);
}

function _parseLine(e) {
  const [, t, n] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ t, n ];
}

function _parseInfoLine(e) {
  return e = _normalizeInputRaw(e), t(e, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  }).reduce(((e, t) => {
    if (null != t && t.length) {
      const n = _parseLine(t);
      e.push(n);
    }
    return e;
  }), []);
}

function extractPromptAndInfoFromRaw(e) {
  const t = _isRawVersionPlus(e = _normalizeInputRaw(e));
  let n = _splitRawToLines(e), r = "", o = "", i = "";
  const a = n.slice();
  if (n.length) {
    if (t) {
      var s, p;
      if (n.length > 3) throw new TypeError;
      let e = n.pop();
      if (e.startsWith("Steps: ") && (i = e, e = void 0), null !== (s = e) && void 0 !== s || (e = n.pop()), 
      e.startsWith("Negative prompt: ") && (o = e.slice(17), e = void 0), null !== (p = e) && void 0 !== p || (e = n.pop()), 
      r = e, n.length) throw new TypeError;
    } else {
      let e = n[n.length - 1];
      if (e.startsWith("Steps: ") && (i = n.pop(), e = void 0), n.length) {
        let t = -1;
        for (let r = n.length - 1; r >= 0; r--) if (e = n[r], e.startsWith("Negative prompt: ")) {
          t = r, n[r] = e.slice(17);
          break;
        }
        -1 !== t && (o = n.splice(t).join("\n")), r = n.join("\n");
      }
    }
    r = r.replace(/\x00\x00\x00/g, ""), o = o.replace(/\x00\x00\x00/g, "");
  }
  return {
    prompt: r,
    negative_prompt: o,
    infoline: i,
    infoline_extra: [],
    lines_raw: a
  };
}

const o = /*#__PURE__*/ Uint8Array.from("tEXt", (e => e.charCodeAt(0))).join(",");

function handleInfoEntries(e, t) {
  const n = null == t ? void 0 : t.cast_to_snake, r = /^0\d/;
  return e.map((([e, t]) => {
    const o = parseFloat(t), i = r.test(t) || isNaN(o) || t - o != 0;
    return n && (e = function keyToSnakeStyle1(e) {
      return e.toLowerCase().replace(/ /g, "_");
    }(e)), [ e, i ? t : o ];
  }));
}

function parseFromRawInfo(e, t) {
  let n = [];
  if (null != t && t.isIncludePrompts) {
    const {prompt: t, negative_prompt: r, infoline: o} = extractPromptAndInfoFromRaw(e);
    n.push([ "prompt", t ]), n.push([ "negative_prompt", r ]), e = o;
  }
  return Object.fromEntries(n.concat(handleInfoEntries(_parseInfoLine(e), t)));
}

function parseFromImageBuffer(e, t = !1) {
  let n = function inputToBytes(e) {
    return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
  }(e);
  const r = function extractRawFromBytes(e) {
    if ("137,80,78,71,13,10,26,10" !== e.slice(0, 8).join(",")) return;
    const [t, n, r] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], i = 8 + t + 12;
    if (e.slice(i + 4, i + 8).join(",") !== o) return;
    const a = i32(e, i);
    return {
      width: n,
      height: r,
      raw_info: function uint8arrayToString(e) {
        return (new TextDecoder).decode(e);
      }(e.slice(i + 8 + 11, i + 8 + a))
    };
  }(n);
  if (!r) return;
  const {raw_info: i, width: a, height: s} = r, {prompt: p, negative_prompt: f, infoline: l, infoline_extra: c} = extractPromptAndInfoFromRaw(i);
  return {
    metadata: {
      width: a,
      height: s,
      extra: c,
      raw_info: i
    },
    pnginfo: {
      prompt: p,
      negative_prompt: f,
      ...parseFromRawInfo(l, {
        cast_to_snake: t
      })
    }
  };
}

export { _parseInfoLine, _parseLine, _splitRawToLines, parseFromImageBuffer as default, extractPromptAndInfoFromRaw, handleInfoEntries, parseFromImageBuffer, parseFromRawInfo };
//# sourceMappingURL=index.esm.mjs.map
