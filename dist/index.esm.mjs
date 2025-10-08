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

function _isInfoLine(n) {
  return n.startsWith("Steps: ");
}

const t = /\r?\n/, r = /(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;

function _splitRawToLines(n) {
  return n.split(_isRawVersionPlus(n) ? r : t);
}

function _isRawVersionPlus(n) {
  return r.test(n);
}

function _parseLine(n) {
  const [, e, t] = n.match(/^([^:]+)\s*:\s*(.*)$/);
  return [ e, t ];
}

function _parseInfoLine(n) {
  return [ ..._parseInfoLineGenerator(n) ];
}

function* _parseInfoLineGenerator(n) {
  n = _normalizeInputRaw(n);
  const t = e(n, [ "," ], {
    brackets: !0,
    trimSeparators: !0
  });
  for (let n of t) if (null != n && n.length) {
    const e = _parseLine(n);
    yield e;
  }
}

function extractPromptAndInfoFromRaw(n) {
  const e = _isRawVersionPlus(n = _normalizeInputRaw(n));
  let t = _splitRawToLines(n), r = "", o = "", i = "";
  const a = t.slice();
  if (t.length) {
    if (e) {
      var s, f;
      const n = t.length;
      if (n > 3) throw new TypeError;
      let e = t.pop();
      if (2 === n) {
        let n = e.split("\n");
        n.length > 1 && _isInfoLine(n[n.length - 1]) && (e = n.pop(), t.push(n.join("\n"))), 
        console.dir(e.split("\n"));
      }
      if (_isInfoLine(e) && (i = e, e = void 0), null !== (s = e) && void 0 !== s || (e = t.pop()), 
      e.startsWith("Negative prompt: ") && (o = e.slice(17), e = void 0), null !== (f = e) && void 0 !== f || (e = t.pop()), 
      r = e, t.length) throw new TypeError;
    } else {
      let n = t[t.length - 1];
      if (n.startsWith("Steps: ") && (i = t.pop(), n = void 0), t.length) {
        let e = -1;
        for (let r = t.length - 1; r >= 0; r--) if (n = t[r], n.startsWith("Negative prompt: ")) {
          e = r, t[r] = n.slice(17);
          break;
        }
        -1 !== e && (o = t.splice(e).join("\n")), r = t.join("\n");
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

const o = "137,80,78,71,13,10,26,10", i = /*#__PURE__*/ Uint8Array.from("tEXt", (n => n.charCodeAt(0))).join(","), a = 11;

function uint8arrayToString(n) {
  return (new TextDecoder).decode(n);
}

function stringToUint8Array(n) {
  return (new TextEncoder).encode(n);
}

function extractRawFromBytes(n) {
  if (n.slice(0, 8).join(",") !== o) return;
  const [e, t, r] = [ i32(n, 8), i32(n, 16), i32(n, 20) ], s = 8 + e + 12;
  if (n.slice(s + 4, s + 8).join(",") !== i) return;
  const f = i32(n, s);
  return {
    width: t,
    height: r,
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
  for (const t of n) yield handleInfoEntry(t, e);
}

function handleInfoEntry(n, e) {
  const t = null == e ? void 0 : e.cast_to_snake;
  let [r, o] = n;
  const i = parseFloat(o), a = /^0\d/.test(o) || isNaN(i) || o - i != 0;
  return t && (r = keyToSnakeStyle1(r)), [ r, a ? o : i ];
}

var s;

function parseFromRawInfo(n, e) {
  return Object.fromEntries([ ...parseFromRawInfoGenerator(n, e) ]);
}

function* parseFromRawInfoGenerator(n, e) {
  if (null != e && e.isIncludePrompts) {
    const {prompt: e, negative_prompt: t, infoline: r} = extractPromptAndInfoFromRaw(n);
    yield [ "prompt", e ], yield [ "negative_prompt", t ], n = r;
  }
  yield* handleInfoEntriesGenerator(_parseInfoLineGenerator(n), e);
}

function parseFromImageBuffer(n, e = !1) {
  const t = extractRawFromBytes(inputToBytes(n));
  if (!t) return;
  const {raw_info: r, width: o, height: i} = t, {prompt: a, negative_prompt: s, infoline: f, infoline_extra: p} = extractPromptAndInfoFromRaw(r);
  return {
    metadata: {
      width: o,
      height: i,
      extra: p,
      raw_info: r
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

export { s as EnumInfoKey, t as RE_LINE_SPLIT_BASE, r as RE_LINE_SPLIT_PLUS, _isInfoLine, _isRawVersionPlus, _normalizeInputRaw, _parseInfoLine, _parseInfoLineGenerator, _parseLine, _splitRawToLines, parseFromImageBuffer as default, extractPromptAndInfoFromRaw, extractRawFromBytes, handleInfoEntries, handleInfoEntriesGenerator, handleInfoEntry, i32, inputToBytes, keyToSnakeStyle1, parseFromImageBuffer, parseFromRawInfo, parseFromRawInfoGenerator, stringToUint8Array, uint8arrayToString };
//# sourceMappingURL=index.esm.mjs.map
