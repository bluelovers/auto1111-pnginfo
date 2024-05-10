'use strict';

var splitSmartly2 = require('split-smartly2');

function inputToBytes(png) {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(png) || png instanceof Uint8Array) {
    return png;
  }
  return Uint8Array.from(atob(png.slice(0, 8192)), c => c.charCodeAt(0));
}
function i32(a, i) {
  return new Uint32Array(new Uint8Array([...a.slice(i, i + 4)].reverse()).buffer)[0];
}

const RE_LINE_SPLIT_BASE = /\r?\n/;
const RE_LINE_SPLIT_PLUS = /\x00\x00\x00\r?\n/;
/**
 * Splits a raw string into an array of lines.
 *
 * @param raw_info - The raw string to split into lines.
 * @returns An array of lines extracted from the raw string.
 *
 * @example
 * ```typescript
 * const rawInfo = "line1\nline2\r\nline3";
 * const lines = _splitRawToLines(rawInfo);
 * console.log(lines); // Output: ["line1", "line2", "line3"]
 * ```
 */
function _splitRawToLines(raw_info) {
  return raw_info.split(_isRawVersionPlus(raw_info) ? RE_LINE_SPLIT_PLUS : RE_LINE_SPLIT_BASE);
}
/**
 * Checks if the given raw string is in "\x00\x00\x00\n" format.
 *
 * @see https://github.com/AUTOMATIC1111/stable-diffusion-webui/pull/15713
 *
 * @param raw_info - The raw string to check.
 * @returns A boolean indicating whether the raw string is in "\x00\x00\x00\n" format.
 *
 * @example
 * ```typescript
 * const rawInfo = "line1\nline2\x00\x00\x00\r\nline3";
 * const isPlusFormat = _isRawVersionPlus(rawInfo);
 * console.log(isPlusFormat); // Output: true
 * ```
 */
function _isRawVersionPlus(raw_info) {
  return RE_LINE_SPLIT_PLUS.test(raw_info);
}

function _parseLine(line) {
  const [, key, value] = line.match(/^([^:]+)\s*:\s*(.*)$/);
  return [key, value];
}
/**
 * Parses an info line into key-value pairs.
 *
 * @param infoline - The info line to parse.
 * @returns An array of tuples, where each tuple contains a key-value pair.
 *
 * @remarks
 * This function uses the `splitSmartly` function from the 'split-smartly2' package to split the info line into key-value pairs.
 * The info line is expected to be in the format `${key}: ${value}`, separated by commas.
 * The `splitSmartly` function is configured to handle nested brackets and trim separators.
 *
 * @example
 * ```typescript
 * const infoLine = 'key1: value1, key2: value2, key3: value3';
 * const result = _parseInfoLine(infoLine);
 * // result: [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']]
 * ```
 */
function _parseInfoLine(infoline) {
  const entries = splitSmartly2.splitSmartly(infoline, [','], {
    brackets: true,
    trimSeparators: true
  });
  return entries.map(_parseLine);
}
/**
 * Extracts prompt, negative prompt, info line, and extra info from a raw info string.
 *
 * @param raw_info - The raw info string to extract data from.
 * @returns An object containing the extracted prompt, negative prompt, info line, extra info, and the original lines.
 *
 * @throws Will throw a TypeError if the raw info string is in Plus version and contains more than 3 lines.
 *
 * @remarks
 * This function first checks if the raw info string is in Plus version using the `_isRawVersionPlus` function.
 * It then splits the raw info string into lines using the `_splitRawToLines` function.
 * Depending on the version, it extracts the prompt, negative prompt, info line, and extra info.
 * If the raw info string is in Plus version, it follows a specific order to extract the data.
 * If the raw info string is not in Plus version, it uses the `findIndex` method to find the indices of the negative prompt and steps,
 * and then extracts the data accordingly.
 * Finally, it returns an object containing the extracted data and the original lines.
 *
 * @example
 * ```typescript
 * const rawInfo = 'Prompt:...\nNegative prompt:...\nSteps:...';
 * const result = extractPromptAndInfoFromRaw(rawInfo);
 * // result: {
 * //   prompt: '...',
 * //   negative_prompt: '...',
 * //   infoline: 'Steps:...',
 * //   infoline_extra: [],
 * //   lines_raw: ['Prompt:...', 'Negative prompt:...', 'Steps:...'],
 * // }
 * ```
 */
function extractPromptAndInfoFromRaw(raw_info) {
  const isPlus = _isRawVersionPlus(raw_info);
  let lines = _splitRawToLines(raw_info);
  let prompt = '';
  let negative_prompt = '';
  let infoline = '';
  let infoline_extra = [];
  const lines_raw = lines.slice();
  if (isPlus) {
    var _line, _line2;
    if (lines.length > 3) {
      throw new TypeError();
    }
    let line = lines.pop();
    if (line.startsWith('Steps: ')) {
      infoline = line;
      line = void 0;
    }
    (_line = line) !== null && _line !== void 0 ? _line : line = lines.pop();
    if (line.startsWith('Negative prompt: ')) {
      negative_prompt = line.slice('Negative prompt: '.length);
      line = void 0;
    }
    (_line2 = line) !== null && _line2 !== void 0 ? _line2 : line = lines.pop();
    prompt = line;
    if (lines.length) {
      throw new TypeError();
    }
  } else {
    let negative_prompt_index = lines.findIndex(a => a.match(/^Negative prompt:/));
    prompt = lines.splice(0, negative_prompt_index).join('\n').trim();
    let steps_index = lines.findIndex(a => a.match(/^Steps:/));
    negative_prompt = lines.splice(0, steps_index).join('\n').slice('Negative prompt:'.length).trim();
    infoline = lines.splice(0, 1)[0];
    infoline_extra = lines;
  }
  prompt = prompt.replace(/\x00\x00\x00/g, '');
  negative_prompt = negative_prompt.replace(/\x00\x00\x00/g, '');
  return {
    prompt,
    negative_prompt,
    infoline,
    infoline_extra,
    lines_raw
  };
}

const BYTES_pngmagic = '137,80,78,71,13,10,26,10';
const BYTES_tEXt = /*#__PURE__*/Uint8Array.from('tEXt', c => c.charCodeAt(0)).join(',');
const OFFSET_parameters = "parameters\u0000".length;
function uint8arrayToString(uint8array) {
  return new TextDecoder().decode(uint8array);
}
/**
 * Extracts raw data from a PNG byte array.
 *
 * @param bytes - The Uint8Array containing the PNG data.
 * @returns An object containing the width, height, and raw_info extracted from the PNG data,
 *          or `undefined` if the PNG data does not contain a valid tEXt chunk.
 */
function extractRawFromBytes(bytes) {
  const pngmagic = bytes.slice(0, 8).join(',') === BYTES_pngmagic;
  if (!pngmagic) return undefined;
  const [ihdrSize, width, height] = [i32(bytes, 8), i32(bytes, 16), i32(bytes, 20)];
  const txtOffset = 8 + ihdrSize + 12;
  if (bytes.slice(txtOffset + 4, txtOffset + 8).join(',') !== BYTES_tEXt) return undefined;
  const txtSize = i32(bytes, txtOffset);
  const raw_info = bytes.slice(txtOffset + 8 + OFFSET_parameters, txtOffset + 8 + txtSize);
  const raw_info_str = uint8arrayToString(raw_info);
  return {
    width,
    height,
    raw_info: raw_info_str
  };
}

function keyToSnakeStyle1(key) {
  return key.toLowerCase().replace(/ /g, '_');
}
function handleInfoEntries(entries, opts) {
  const cast_to_snake = opts === null || opts === void 0 ? void 0 : opts.cast_to_snake;
  const re = /^0\d/;
  return entries.map(([key, value]) => {
    const asNum = parseFloat(value);
    const isNotNum = re.test(value) || isNaN(asNum) || value - asNum !== 0;
    if (cast_to_snake) key = keyToSnakeStyle1(key);
    const out = [key, isNotNum ? value : asNum];
    return out;
  });
}

function infoparser(line, opts) {
  let base = [];
  if (opts !== null && opts !== void 0 && opts.isIncludePrompts) {
    const {
      prompt,
      negative_prompt,
      infoline
    } = extractPromptAndInfoFromRaw(line);
    base.push(['prompt', prompt]);
    base.push(['negative_prompt', negative_prompt]);
    line = infoline;
  }
  return Object.fromEntries(base.concat(handleInfoEntries(_parseInfoLine(line), opts)));
}
/**
 * @example
 * import fs from 'fs/promises'
 * import PNGINFO from 'auto1111-pnginfo'
 *
 * const file = await fs.readFile('generate_waifu.png')
 * const info = PNGINFO(file)
 *
 * console.log(info)
 */
function PNGINFO(png, cast_to_snake = false) {
  let bytes = inputToBytes(png);
  const raw = extractRawFromBytes(bytes);
  if (!raw) return;
  const {
    raw_info,
    width,
    height
  } = raw;
  const {
    prompt,
    negative_prompt,
    infoline,
    infoline_extra
  } = extractPromptAndInfoFromRaw(raw_info);
  let data = infoparser(infoline, {
    cast_to_snake
  });
  let output = {
    metadata: {
      width,
      height,
      extra: infoline_extra,
      raw_info
    },
    pnginfo: {
      prompt,
      negative_prompt,
      ...data
    }
  };
  return output;
}
// @ts-ignore
{
  Object.defineProperty(PNGINFO, "__esModule", {
    value: true
  });
  Object.defineProperty(PNGINFO, 'PNGINFO', {
    value: PNGINFO
  });
  Object.defineProperty(PNGINFO, 'default', {
    value: PNGINFO
  });
  Object.defineProperty(PNGINFO, 'infoparser', {
    value: infoparser
  });
}

// @ts-ignore
module.exports = PNGINFO;
//# sourceMappingURL=index.cjs.development.cjs.map
