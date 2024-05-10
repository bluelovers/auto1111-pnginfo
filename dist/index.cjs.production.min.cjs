"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("crlf-normalize"), r = require("split-smartly2");

function i32(e, r) {
  return new Uint32Array(new Uint8Array([ ...e.slice(r, r + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(r) {
  return e.crlf(r).replace(/[\s\r\n]+$/g, "");
}

const t = /\r?\n/, n = /\x00\x00\x00\r?\n/;

function _splitRawToLines(e) {
  return e.split(_isRawVersionPlus(e) ? n : t);
}

function _isRawVersionPlus(e) {
  return n.test(e);
}

function _parseLine(e) {
  const [, r, t] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ r, t ];
}

function _parseInfoLine(e) {
  return e = _normalizeInputRaw(e), r.splitSmartly(e, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  }).reduce(((e, r) => {
    if (null != r && r.length) {
      const t = _parseLine(r);
      e.push(t);
    }
    return e;
  }), []);
}

function extractPromptAndInfoFromRaw(e) {
  const r = _isRawVersionPlus(e = _normalizeInputRaw(e));
  let t = _splitRawToLines(e), n = "", o = "", i = "";
  const a = t.slice();
  if (t.length) {
    if (r) {
      var s, p;
      if (t.length > 3) throw new TypeError;
      let e = t.pop();
      if (e.startsWith("Steps: ") && (i = e, e = void 0), null !== (s = e) && void 0 !== s || (e = t.pop()), 
      e.startsWith("Negative prompt: ") && (o = e.slice(17), e = void 0), null !== (p = e) && void 0 !== p || (e = t.pop()), 
      n = e, t.length) throw new TypeError;
    } else {
      let e = t[t.length - 1];
      if (e.startsWith("Steps: ") && (i = t.pop(), e = void 0), t.length) {
        let r = -1;
        for (let n = t.length - 1; n >= 0; n--) if (e = t[n], e.startsWith("Negative prompt: ")) {
          r = n, t[n] = e.slice(17);
          break;
        }
        -1 !== r && (o = t.splice(r).join("\n")), n = t.join("\n");
      }
    }
    n = n.replace(/\x00\x00\x00/g, ""), o = o.replace(/\x00\x00\x00/g, "");
  }
  return {
    prompt: n,
    negative_prompt: o,
    infoline: i,
    infoline_extra: [],
    lines_raw: a
  };
}

const o = /*#__PURE__*/ Uint8Array.from("tEXt", (e => e.charCodeAt(0))).join(",");

function handleInfoEntries(e, r) {
  const t = null == r ? void 0 : r.cast_to_snake, n = /^0\d/;
  return e.map((([e, r]) => {
    const o = parseFloat(r), i = n.test(r) || isNaN(o) || r - o != 0;
    return t && (e = function keyToSnakeStyle1(e) {
      return e.toLowerCase().replace(/ /g, "_");
    }(e)), [ e, i ? r : o ];
  }));
}

function parseFromRawInfo(e, r) {
  let t = [];
  if (null != r && r.isIncludePrompts) {
    const {prompt: r, negative_prompt: n, infoline: o} = extractPromptAndInfoFromRaw(e);
    t.push([ "prompt", r ]), t.push([ "negative_prompt", n ]), e = o;
  }
  return Object.fromEntries(t.concat(handleInfoEntries(_parseInfoLine(e), r)));
}

function parseFromImageBuffer(e, r = !1) {
  let t = function inputToBytes(e) {
    return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
  }(e);
  const n = function extractRawFromBytes(e) {
    if ("137,80,78,71,13,10,26,10" !== e.slice(0, 8).join(",")) return;
    const [r, t, n] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], i = 8 + r + 12;
    if (e.slice(i + 4, i + 8).join(",") !== o) return;
    const a = i32(e, i);
    return {
      width: t,
      height: n,
      raw_info: function uint8arrayToString(e) {
        return (new TextDecoder).decode(e);
      }(e.slice(i + 8 + 11, i + 8 + a))
    };
  }(t);
  if (!n) return;
  const {raw_info: i, width: a, height: s} = n, {prompt: p, negative_prompt: f, infoline: l, infoline_extra: u} = extractPromptAndInfoFromRaw(i);
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
        cast_to_snake: r
      })
    }
  };
}

exports._parseInfoLine = _parseInfoLine, exports._parseLine = _parseLine, exports._splitRawToLines = _splitRawToLines, 
exports.default = parseFromImageBuffer, exports.extractPromptAndInfoFromRaw = extractPromptAndInfoFromRaw, 
exports.handleInfoEntries = handleInfoEntries, exports.parseFromImageBuffer = parseFromImageBuffer, 
exports.parseFromRawInfo = parseFromRawInfo;
//# sourceMappingURL=index.cjs.production.min.cjs.map
