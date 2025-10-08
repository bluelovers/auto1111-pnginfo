"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("crlf-normalize"), n = require("split-smartly2");

function inputToBytes(e) {
  return "undefined" != typeof Buffer && Buffer.isBuffer(e) || e instanceof Uint8Array ? e : Uint8Array.from(atob(e.slice(0, 8192)), (e => e.charCodeAt(0)));
}

function i32(e, n) {
  return new Uint32Array(new Uint8Array([ ...e.slice(n, n + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(n) {
  return e.crlf(n).replace(/[ \t\xa0]+(?=\n)/g, "").replace(/\n{3,}/g, "\n\n").replace(/^[\r\n]+|[\s\r\n]+$/g, "");
}

function _isInfoLine(e) {
  return e.startsWith("Steps: ");
}

const r = /\r?\n/, t = /(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;

function _splitRawToLines(e) {
  return e.split(_isRawVersionPlus(e) ? t : r);
}

function _isRawVersionPlus(e) {
  return t.test(e);
}

function _parseLine(e) {
  const [, n, r] = e.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ n, r ];
}

function* _parseInfoLineGenerator(e) {
  e = _normalizeInputRaw(e);
  const r = n.splitSmartly(e, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  });
  for (let e of r) if (null != e && e.length) {
    const n = _parseLine(e);
    yield n;
  }
}

function extractPromptAndInfoFromRaw(e) {
  const n = _isRawVersionPlus(e = _normalizeInputRaw(e));
  let r = _splitRawToLines(e), t = "", o = "", i = "";
  const a = r.slice();
  if (r.length) {
    if (n) {
      var s, p;
      const e = r.length;
      if (e > 3) throw new TypeError;
      let n = r.pop();
      if (2 === e) {
        let e = n.split("\n");
        e.length > 1 && _isInfoLine(e[e.length - 1]) && (n = e.pop(), r.push(e.join("\n"))), 
        console.dir(n.split("\n"));
      }
      if (_isInfoLine(n) && (i = n, n = void 0), null !== (s = n) && void 0 !== s || (n = r.pop()), 
      n.startsWith("Negative prompt: ") && (o = n.slice(17), n = void 0), null !== (p = n) && void 0 !== p || (n = r.pop()), 
      t = n, r.length) throw new TypeError;
    } else {
      let e = r[r.length - 1];
      if (e.startsWith("Steps: ") && (i = r.pop(), e = void 0), r.length) {
        let n = -1;
        for (let t = r.length - 1; t >= 0; t--) if (e = r[t], e.startsWith("Negative prompt: ")) {
          n = t, r[t] = e.slice(17);
          break;
        }
        -1 !== n && (o = r.splice(n).join("\n")), t = r.join("\n");
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
  const [n, r, t] = [ i32(e, 8), i32(e, 16), i32(e, 20) ], s = 8 + n + 12;
  if (e.slice(s + 4, s + 8).join(",") !== i) return;
  const p = i32(e, s);
  return {
    width: r,
    height: t,
    raw_info: uint8arrayToString(e.slice(s + 8 + a, s + 8 + p))
  };
}

function keyToSnakeStyle1(e) {
  return e.toLowerCase().replace(/ /g, "_");
}

function* handleInfoEntriesGenerator(e, n) {
  for (const r of e) yield handleInfoEntry(r, n);
}

function handleInfoEntry(e, n) {
  const r = null == n ? void 0 : n.cast_to_snake;
  let [t, o] = e;
  const i = parseFloat(o), a = /^0\d/.test(o) || isNaN(i) || o - i != 0;
  return r && (t = keyToSnakeStyle1(t)), [ t, a ? o : i ];
}

var s;

function parseFromRawInfo(e, n) {
  return Object.fromEntries([ ...parseFromRawInfoGenerator(e, n) ]);
}

function* parseFromRawInfoGenerator(e, n) {
  if (null != n && n.isIncludePrompts) {
    const {prompt: n, negative_prompt: r, infoline: t} = extractPromptAndInfoFromRaw(e);
    yield [ "prompt", n ], yield [ "negative_prompt", r ], e = t;
  }
  yield* handleInfoEntriesGenerator(_parseInfoLineGenerator(e), n);
}

function parseFromImageBuffer(e, n = !1) {
  const r = extractRawFromBytes(inputToBytes(e));
  if (!r) return;
  const {raw_info: t, width: o, height: i} = r, {prompt: a, negative_prompt: s, infoline: p, infoline_extra: f} = extractPromptAndInfoFromRaw(t);
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
        cast_to_snake: n
      })
    }
  };
}

exports.EnumInfoKey = void 0, (s = exports.EnumInfoKey || (exports.EnumInfoKey = {})).prompt = "prompt", 
s.negative_prompt = "negative_prompt", exports.RE_LINE_SPLIT_BASE = r, exports.RE_LINE_SPLIT_PLUS = t, 
exports._isInfoLine = _isInfoLine, exports._isRawVersionPlus = _isRawVersionPlus, 
exports._normalizeInputRaw = _normalizeInputRaw, exports._parseInfoLine = function _parseInfoLine(e) {
  return [ ..._parseInfoLineGenerator(e) ];
}, exports._parseInfoLineGenerator = _parseInfoLineGenerator, exports._parseLine = _parseLine, 
exports._splitRawToLines = _splitRawToLines, exports.default = parseFromImageBuffer, 
exports.extractPromptAndInfoFromRaw = extractPromptAndInfoFromRaw, exports.extractRawFromBytes = extractRawFromBytes, 
exports.handleInfoEntries = function handleInfoEntries(e, n) {
  return [ ...handleInfoEntriesGenerator(e, n) ];
}, exports.handleInfoEntriesGenerator = handleInfoEntriesGenerator, exports.handleInfoEntry = handleInfoEntry, 
exports.i32 = i32, exports.inputToBytes = inputToBytes, exports.keyToSnakeStyle1 = keyToSnakeStyle1, 
exports.parseFromImageBuffer = parseFromImageBuffer, exports.parseFromRawInfo = parseFromRawInfo, 
exports.parseFromRawInfoGenerator = parseFromRawInfoGenerator, exports.stringToUint8Array = function stringToUint8Array(e) {
  return (new TextEncoder).encode(e);
}, exports.uint8arrayToString = uint8arrayToString;
//# sourceMappingURL=index.cjs.production.min.cjs.map
