import { crlf as n } from "crlf-normalize";

import { splitSmartly as e } from "split-smartly2";

function inputToBytes(n) {
  return "undefined" != typeof Buffer && Buffer.isBuffer(n) || n instanceof Uint8Array ? n : Uint8Array.from(atob(n.slice(0, 8192)), (n => n.charCodeAt(0)));
}

function i32(n, e) {
  return new Uint32Array(new Uint8Array([ ...n.slice(e, e + 4) ].reverse()).buffer)[0];
}

function _normalizeInputRaw(e) {
  return n(e).replace(/[ \t\xa0]+(?=\n)/g, "").replace(/\n{3,}/g, "\n\n").replace(/^[\r\n]+|[\s\r\n]+$/g, "");
}

const r = /\r?\n/, t = /(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;

function _splitRawToLines(n) {
  return n.split(_isRawVersionPlus(n) ? t : r);
}

function _isRawVersionPlus(n) {
  return t.test(n);
}

function _parseLine(n) {
  const [, e, r] = n.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ e, r ];
}

function _parseInfoLine(n) {
  return [ ..._parseInfoLineGenerator(n) ];
}

function* _parseInfoLineGenerator(n) {
  n = _normalizeInputRaw(n);
  const r = e(n, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  });
  for (let n of r) if (null != n && n.length) {
    const e = _parseLine(n);
    yield e;
  }
}

function extractPromptAndInfoFromRaw(n) {
  const e = _isRawVersionPlus(n = _normalizeInputRaw(n));
  let r = _splitRawToLines(n), t = "", o = "", i = "";
  const a = r.slice();
  if (r.length) {
    if (e) {
      var s, f;
      if (r.length > 3) throw new TypeError;
      let n = r.pop();
      if (n.startsWith("Steps: ") && (i = n, n = void 0), null !== (s = n) && void 0 !== s || (n = r.pop()), 
      n.startsWith("Negative prompt: ") && (o = n.slice(17), n = void 0), null !== (f = n) && void 0 !== f || (n = r.pop()), 
      t = n, r.length) throw new TypeError;
    } else {
      let n = r[r.length - 1];
      if (n.startsWith("Steps: ") && (i = r.pop(), n = void 0), r.length) {
        let e = -1;
        for (let t = r.length - 1; t >= 0; t--) if (n = r[t], n.startsWith("Negative prompt: ")) {
          e = t, r[t] = n.slice(17);
          break;
        }
        -1 !== e && (o = r.splice(e).join("\n")), t = r.join("\n");
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

const o = "137,80,78,71,13,10,26,10", i = /*#__PURE__*/ Uint8Array.from("tEXt", (n => n.charCodeAt(0))).join(","), a = 11;

function uint8arrayToString(n) {
  return (new TextDecoder).decode(n);
}

function stringToUint8Array(n) {
  return (new TextEncoder).encode(n);
}

function extractRawFromBytes(n) {
  if (n.slice(0, 8).join(",") !== o) return;
  const [e, r, t] = [ i32(n, 8), i32(n, 16), i32(n, 20) ], s = 8 + e + 12;
  if (n.slice(s + 4, s + 8).join(",") !== i) return;
  const f = i32(n, s);
  return {
    width: r,
    height: t,
    raw_info: uint8arrayToString(n.slice(s + 8 + a, s + 8 + f))
  };
}

function keyToSnakeStyle1(n) {
  return n.toLowerCase().replace(/ /g, "_");
}

function handleInfoEntries(n, e) {
  return [ ...handleInfoEntriesGenerator(n, e) ];
}

function* handleInfoEntriesGenerator(n, e) {
  for (const r of n) yield handleInfoEntry(r, e);
}

function handleInfoEntry(n, e) {
  const r = null == e ? void 0 : e.cast_to_snake;
  let [t, o] = n;
  const i = parseFloat(o), a = /^0\d/.test(o) || isNaN(i) || o - i != 0;
  return r && (t = keyToSnakeStyle1(t)), [ t, a ? o : i ];
}

var s;

function parseFromRawInfo(n, e) {
  return Object.fromEntries([ ...parseFromRawInfoGenerator(n, e) ]);
}

function* parseFromRawInfoGenerator(n, e) {
  if (null != e && e.isIncludePrompts) {
    const {prompt: e, negative_prompt: r, infoline: t} = extractPromptAndInfoFromRaw(n);
    yield [ "prompt", e ], yield [ "negative_prompt", r ], n = t;
  }
  yield* handleInfoEntriesGenerator(_parseInfoLineGenerator(n), e);
}

function parseFromImageBuffer(n, e = !1) {
  const r = extractRawFromBytes(inputToBytes(n));
  if (!r) return;
  const {raw_info: t, width: o, height: i} = r, {prompt: a, negative_prompt: s, infoline: f, infoline_extra: p} = extractPromptAndInfoFromRaw(t);
  return {
    metadata: {
      width: o,
      height: i,
      extra: p,
      raw_info: t
    },
    pnginfo: {
      prompt: a,
      negative_prompt: s,
      ...parseFromRawInfo(f, {
        cast_to_snake: e
      })
    }
  };
}

!function(n) {
  n.prompt = "prompt", n.negative_prompt = "negative_prompt";
}(s || (s = {}));

export { s as EnumInfoKey, r as RE_LINE_SPLIT_BASE, t as RE_LINE_SPLIT_PLUS, _isRawVersionPlus, _normalizeInputRaw, _parseInfoLine, _parseInfoLineGenerator, _parseLine, _splitRawToLines, parseFromImageBuffer as default, extractPromptAndInfoFromRaw, extractRawFromBytes, handleInfoEntries, handleInfoEntriesGenerator, handleInfoEntry, i32, inputToBytes, keyToSnakeStyle1, parseFromImageBuffer, parseFromRawInfo, parseFromRawInfoGenerator, stringToUint8Array, uint8arrayToString };
//# sourceMappingURL=index.esm.mjs.map
