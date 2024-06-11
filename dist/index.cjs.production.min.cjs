"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("crlf-normalize"), r = require("split-smartly2");

function inputToBytes(e) {
  return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
}

function i32(e, r) {
  return new Uint32Array(new Uint8Array([ ...e.slice(r, r + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(r) {
  return e.crlf(r).replace(/[ \t\xa0]+(?=\n)/g, "").replace(/\n{3,}/g, "\n\n").replace(/^[\r\n]+|[\s\r\n]+$/g, "");
}

const n = /\r?\n/, t = /(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;

function _splitRawToLines(e) {
  return e.split(_isRawVersionPlus(e) ? t : n);
}

function _isRawVersionPlus(e) {
  return t.test(e);
}

function _parseLine(e) {
  const [, r, n] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ r, n ];
}

function* _parseInfoLineGenerator(e) {
  e = _normalizeInputRaw(e);
  const n = r.splitSmartly(e, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  });
  for (let e of n) if (null != e && e.length) {
    const r = _parseLine(e);
    yield r;
  }
}

function extractPromptAndInfoFromRaw(e) {
  const r = _isRawVersionPlus(e = _normalizeInputRaw(e));
  let n = _splitRawToLines(e), t = "", o = "", i = "";
  const a = n.slice();
  if (n.length) {
    if (r) {
      var s, p;
      if (n.length > 3) throw new TypeError;
      let e = n.pop();
      if (e.startsWith("Steps: ") && (i = e, e = void 0), null !== (s = e) && void 0 !== s || (e = n.pop()), 
      e.startsWith("Negative prompt: ") && (o = e.slice(17), e = void 0), null !== (p = e) && void 0 !== p || (e = n.pop()), 
      t = e, n.length) throw new TypeError;
    } else {
      let e = n[n.length - 1];
      if (e.startsWith("Steps: ") && (i = n.pop(), e = void 0), n.length) {
        let r = -1;
        for (let t = n.length - 1; t >= 0; t--) if (e = n[t], e.startsWith("Negative prompt: ")) {
          r = t, n[t] = e.slice(17);
          break;
        }
        -1 !== r && (o = n.splice(r).join("\n")), t = n.join("\n");
      }
    }
    t = t.replace(/\x00\x00\x00/g, ""), o = o.replace(/\x00\x00\x00/g, "");
  }
  return {
    prompt: t,
    negative_prompt: o,
    infoline: i,
    infoline_extra: [],
    lines_raw: a
  };
}

const o = "137,80,78,71,13,10,26,10", i = /*#__PURE__*/ Uint8Array.from("tEXt", (e => e.charCodeAt(0))).join(","), a = 11;

function uint8arrayToString(e) {
  return (new TextDecoder).decode(e);
}

function extractRawFromBytes(e) {
  if (e.slice(0, 8).join(",") !== o) return;
  const [r, n, t] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], s = 8 + r + 12;
  if (e.slice(s + 4, s + 8).join(",") !== i) return;
  const p = i32(e, s);
  return {
    width: n,
    height: t,
    raw_info: uint8arrayToString(e.slice(s + 8 + a, s + 8 + p))
  };
}

function keyToSnakeStyle1(e) {
  return e.toLowerCase().replace(/ /g, "_");
}

function* handleInfoEntriesGenerator(e, r) {
  for (const n of e) yield handleInfoEntry(n, r);
}

function handleInfoEntry(e, r) {
  const n = null == r ? void 0 : r.cast_to_snake;
  let [t, o] = e;
  const i = parseFloat(o), a = /^0\d/.test(o) || isNaN(i) || o - i != 0;
  return n && (t = keyToSnakeStyle1(t)), [ t, a ? o : i ];
}

var s;

function parseFromRawInfo(e, r) {
  return Object.fromEntries([ ...parseFromRawInfoGenerator(e, r) ]);
}

function* parseFromRawInfoGenerator(e, r) {
  if (null != r && r.isIncludePrompts) {
    const {prompt: r, negative_prompt: n, infoline: t} = extractPromptAndInfoFromRaw(e);
    yield [ "prompt", r ], yield [ "negative_prompt", n ], e = t;
  }
  yield* handleInfoEntriesGenerator(_parseInfoLineGenerator(e), r);
}

function parseFromImageBuffer(e, r = !1) {
  const n = extractRawFromBytes(inputToBytes(e));
  if (!n) return;
  const {raw_info: t, width: o, height: i} = n, {prompt: a, negative_prompt: s, infoline: p, infoline_extra: f} = extractPromptAndInfoFromRaw(t);
  return {
    metadata: {
      width: o,
      height: i,
      extra: f,
      raw_info: t
    },
    pnginfo: {
      prompt: a,
      negative_prompt: s,
      ...parseFromRawInfo(p, {
        cast_to_snake: r
      })
    }
  };
}

exports.EnumInfoKey = void 0, (s = exports.EnumInfoKey || (exports.EnumInfoKey = {})).prompt = "prompt", 
s.negative_prompt = "negative_prompt", exports.RE_LINE_SPLIT_BASE = n, exports.RE_LINE_SPLIT_PLUS = t, 
exports._isRawVersionPlus = _isRawVersionPlus, exports._normalizeInputRaw = _normalizeInputRaw, 
exports._parseInfoLine = function _parseInfoLine(e) {
  return [ ..._parseInfoLineGenerator(e) ];
}, exports._parseInfoLineGenerator = _parseInfoLineGenerator, exports._parseLine = _parseLine, 
exports._splitRawToLines = _splitRawToLines, exports.default = parseFromImageBuffer, 
exports.extractPromptAndInfoFromRaw = extractPromptAndInfoFromRaw, exports.extractRawFromBytes = extractRawFromBytes, 
exports.handleInfoEntries = function handleInfoEntries(e, r) {
  return [ ...handleInfoEntriesGenerator(e, r) ];
}, exports.handleInfoEntriesGenerator = handleInfoEntriesGenerator, exports.handleInfoEntry = handleInfoEntry, 
exports.i32 = i32, exports.inputToBytes = inputToBytes, exports.keyToSnakeStyle1 = keyToSnakeStyle1, 
exports.parseFromImageBuffer = parseFromImageBuffer, exports.parseFromRawInfo = parseFromRawInfo, 
exports.parseFromRawInfoGenerator = parseFromRawInfoGenerator, exports.stringToUint8Array = function stringToUint8Array(e) {
  return (new TextEncoder).encode(e);
}, exports.uint8arrayToString = uint8arrayToString;
//# sourceMappingURL=index.cjs.production.min.cjs.map
