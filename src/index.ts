import { inputToBytes } from './utils';
import { _parseInfoLine, extractPromptAndInfoFromRaw } from './parser';
import { extractRawFromBytes } from './png';
import { handleInfoEntries } from './handler';

export interface IOptionsInfoparser
{
  cast_to_snake?: boolean;
  isIncludePrompts?: boolean;
}

export function infoparser(line: string, opts?: IOptionsInfoparser)
{
  let base = [] as ReturnType<typeof handleInfoEntries>
  if (opts?.isIncludePrompts)
  {
    const {
      prompt,
      negative_prompt,
      infoline,
    } = extractPromptAndInfoFromRaw(line);

    base.push(['prompt', prompt]);
    base.push(['negative_prompt', negative_prompt]);
    line = infoline;
  }

  return Object.fromEntries(base.concat(handleInfoEntries(_parseInfoLine(line), opts)))
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
export function PNGINFO(png: Uint8Array | string, cast_to_snake = false)
{
  let bytes = inputToBytes(png) as Uint8Array;

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
    infoline_extra,
    //lines_raw,
  } = extractPromptAndInfoFromRaw(raw_info as any)

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
      ...data,
    },
  }

  return output
}

// @ts-ignore
if (process.env.TSDX_FORMAT !== 'esm')
{
  Object.defineProperty(PNGINFO, "__esModule", { value: true });

  Object.defineProperty(PNGINFO, 'PNGINFO', { value: PNGINFO });
  Object.defineProperty(PNGINFO, 'default', { value: PNGINFO });

  Object.defineProperty(PNGINFO, 'infoparser', { value: infoparser });
}

export default PNGINFO
