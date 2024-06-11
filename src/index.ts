import { inputToBytes } from './utils';
import { _parseInfoLineGenerator, extractPromptAndInfoFromRaw } from './parser';
import { extractRawFromBytes } from './png';
import { handleInfoEntriesGenerator } from './handler';
import { EnumInfoKey } from './types';

export * from './handler';
export * from './parser';
export * from './png';
export * from './split';
export * from './types';
export * from './utils';

export interface IOptionsInfoparser
{
	cast_to_snake?: boolean;
	/**
	 * If true, prompt and negative_prompt are included in the input
	 */
	isIncludePrompts?: boolean;
}

export interface IRecordInfo
{
	[EnumInfoKey.prompt]: string;
	[EnumInfoKey.negative_prompt]: string;

	[k: string]: string | number;
}

/**
 * Parses raw info line and returns an object with the extracted data.
 *
 * @param line - The raw info line to parse.
 * @param opts - Optional parameters.
 * @param opts.cast_to_snake - If true, keys will be converted to snake_case. Default is false.
 * @param opts.isIncludePrompts - If true, prompt and negative_prompt will be included in the result. Default is false.
 *
 * @returns An object containing the extracted data.
 *
 * @example
 * ```typescript
 * const rawInfo = "my prompt, Negative prompt: my negative prompt, width: 512, height: 512";
 * const parsedData = parseFromRawInfo(rawInfo, { isIncludePrompts: true });
 * console.log(parsedData);
 * // Output: { prompt: 'my prompt', Negative prompt: 'my negative prompt', width: 512, height: 512 }
 * ```
 */
export function parseFromRawInfo(line: string, opts?: IOptionsInfoparser)
{
	return Object.fromEntries([...parseFromRawInfoGenerator(line, opts)]) as IRecordInfo
}

export function* parseFromRawInfoGenerator(line: string, opts?: IOptionsInfoparser): Generator<readonly [string, string | number] | readonly [EnumInfoKey, string], void, void>
{
	if (opts?.isIncludePrompts)
	{
		const {
			prompt,
			negative_prompt,
			infoline,
		} = extractPromptAndInfoFromRaw(line);

		yield [EnumInfoKey.prompt as const, prompt] as const
		yield [EnumInfoKey.negative_prompt as const, negative_prompt] as const;
		line = infoline;
	}

	yield* handleInfoEntriesGenerator(_parseInfoLineGenerator(line), opts)
}

/**
 * @example
 * import fs from 'fs/promises'
 * import parseFromImageBuffer from '@bluelovers/auto1111-pnginfo'
 *
 * const file = await fs.readFile('generate_waifu.png')
 * const info = parseFromImageBuffer(file)
 *
 * console.log(info)
 */
export function parseFromImageBuffer(png: Uint8Array | string, cast_to_snake = false)
{
	let bytes = inputToBytes(png) as Uint8Array;

	const raw = extractRawFromBytes(bytes);
	if (!raw) return;

	const {
		raw_info,
		width,
		height,
	} = raw;

	const {
		prompt,
		negative_prompt,
		infoline,
		infoline_extra,
		//lines_raw,
	} = extractPromptAndInfoFromRaw(raw_info as any)

	let data = parseFromRawInfo(infoline, {
		cast_to_snake,
	});

	let output = {
		metadata: {
			width,
			height,
			extra: infoline_extra,
			raw_info,
		},
		pnginfo: {
			prompt,
			negative_prompt,
			...data,
		},
	}

	return output
}

export default parseFromImageBuffer
