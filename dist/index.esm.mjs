import { crlf as e } from "crlf-normalize";

import { splitSmartly as n } from "split-smartly2";

function i32(e, n) {
  return new Uint32Array(new Uint8Array([ ...e.slice(n, n + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(n) {
  return e(n).replace(/[ \t\xa0]+(?=\n)/g, "").replace(/\n{3,}/g, "\n\n").replace(/^[\r\n]+|[\s\r\n]+$/g, "");
}

const t = /\r?\n/, r = /(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;

function _splitRawToLines(e) {
  return e.split(_isRawVersionPlus(e) ? r : t);
}

function _isRawVersionPlus(e) {
  return r.test(e);
}

function _parseLine(e) {
  const [, n, t] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ n, t ];
}

function _parseInfoLine(e) {
  return e = _normalizeInputRaw(e), n(e, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  }).reduce(((e, n) => {
    if (null != n && n.length) {
      const t = _parseLine(n);
      e.push(t);
    }
    return e;
  }), []);
}

function extractPromptAndInfoFromRaw(e) {
  const n = _isRawVersionPlus(e = _normalizeInputRaw(e));
  let t = _splitRawToLines(e), r = "", o = "", i = "";
  const a = t.slice();
  if (t.length) {
    if (n) {
      var s, p;
      if (t.length > 3) throw new TypeError;
      let e = t.pop();
      if (e.startsWith("Steps: ") && (i = e, e = void 0), null !== (s = e) && void 0 !== s || (e = t.pop()), 
      e.startsWith("Negative prompt: ") && (o = e.slice(17), e = void 0), null !== (p = e) && void 0 !== p || (e = t.pop()), 
      r = e, t.length) throw new TypeError;
    } else {
      let e = t[t.length - 1];
      if (e.startsWith("Steps: ") && (i = t.pop(), e = void 0), t.length) {
        let n = -1;
        for (let r = t.length - 1; r >= 0; r--) if (e = t[r], e.startsWith("Negative prompt: ")) {
          n = r, t[r] = e.slice(17);
          break;
        }
        -1 !== n && (o = t.splice(n).join("\n")), r = t.join("\n");
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

function handleInfoEntries(e, n) {
  const t = null == n ? void 0 : n.cast_to_snake, r = /^0\d/;
  return e.map((([e, n]) => {
    const o = parseFloat(n), i = r.test(n) || isNaN(o) || n - o != 0;
    return t && (e = function keyToSnakeStyle1(e) {
      return e.toLowerCase().replace(/ /g, "_");
    }(e)), [ e, i ? n : o ];
  }));
}

function parseFromRawInfo(e, n) {
  let t = [];
  if (null != n && n.isIncludePrompts) {
    const {prompt: n, negative_prompt: r, infoline: o} = extractPromptAndInfoFromRaw(e);
    t.push([ "prompt", n ]), t.push([ "negative_prompt", r ]), e = o;
  }
  return Object.fromEntries(t.concat(handleInfoEntries(_parseInfoLine(e), n)));
}

function parseFromImageBuffer(e, n = !1) {
  let t = function inputToBytes(e) {
    return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
  }(e);
  const r = function extractRawFromBytes(e) {
    if ("137,80,78,71,13,10,26,10" !== e.slice(0, 8).join(",")) return;
    const [n, t, r] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], i = 8 + n + 12;
    if (e.slice(i + 4, i + 8).join(",") !== o) return;
    const a = i32(e, i);
    return {
      width: t,
      height: r,
      raw_info: function uint8arrayToString(e) {
        return (new TextDecoder).decode(e);
      }(e.slice(i + 8 + 11, i + 8 + a))
    };
  }(t);
  if (!r) return;
  const {raw_info: i, width: a, height: s} = r, {prompt: p, negative_prompt: f, infoline: l, infoline_extra: u} = extractPromptAndInfoFromRaw(i);
  return {
    metadata: {
      width: a,
      height: s,
      extra: u,
      raw_info: i
    },
    pnginfo: {
      prompt: p,
      negative_prompt: f,
      ...parseFromRawInfo(l, {
        cast_to_snake: n
      })
    }
  };
}

export { _normalizeInputRaw, _parseInfoLine, _parseLine, _splitRawToLines, parseFromImageBuffer as default, extractPromptAndInfoFromRaw, handleInfoEntries, parseFromImageBuffer, parseFromRawInfo };
//# sourceMappingURL=index.esm.mjs.map
