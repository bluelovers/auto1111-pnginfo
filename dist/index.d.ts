export declare const enum EnumInfoKey {
	prompt = "prompt",
	negative_prompt = "negative_prompt"
}
export declare function keyToSnakeStyle1(key: string): string;
export declare function handleInfoEntries(entries: Iterable<readonly [
	string,
	string
]>, opts?: IOptionsInfoparser): (readonly [
	string,
	string | number
])[];
export declare function handleInfoEntriesGenerator(entries: Iterable<readonly [
	string,
	string
]>, opts?: IOptionsInfoparser): Generator<readonly [
	string,
	string | number
], void, unknown>;
export declare function handleInfoEntry(entry: readonly [
	string,
	string
], opts?: IOptionsInfoparser): readonly [
	string,
	string | number
];
/**
 * `${key}: ${value}`
 */
export declare function _parseLine(line: string): readonly [
	string,
	string
];
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
export declare function _parseInfoLine(infoline: string): (readonly [
	string,
	string
])[];
export declare function _parseInfoLineGenerator(infoline: string): Generator<readonly [
	string,
	string
], void, unknown>;
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
export declare function extractPromptAndInfoFromRaw(raw_info: string): {
	prompt: string;
	negative_prompt: string;
	infoline: string;
	infoline_extra: string[];
	lines_raw: string[];
};
export declare function uint8arrayToString(uint8array: Uint8Array): string;
/**
 * ```
 * new TextEncoder().encode(inputString)
 * String.fromCharCode(...raw_info)
 * ```
 */
export declare function stringToUint8Array(inputString: string): Uint8Array;
/**
 * Extracts raw data from a PNG byte array.
 *
 * @param bytes - The Uint8Array containing the PNG data.
 * @returns An object containing the width, height, and raw_info extracted from the PNG data,
 *          or `undefined` if the PNG data does not contain a valid tEXt chunk.
 */
export declare function extractRawFromBytes(bytes: Uint8Array): {
	width: number;
	height: number;
	raw_info: string;
};
/**
 * \n
 */
export declare const RE_LINE_SPLIT_BASE: RegExp;
/**
 * ```
 * \x00\x00\x00\n
 * \u200b\u200b\u200b\n zero-width space
 * ```
 */
export declare const RE_LINE_SPLIT_PLUS: RegExp;
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
export declare function _splitRawToLines(raw_info: string): string[];
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
export declare function _isRawVersionPlus(raw_info: string): boolean;
export declare function inputToBytes(png: Uint8Array | string): Uint8Array | Buffer;
/**
 * get int32 from png compensating for endianness
 */
export declare function i32(a: Uint8Array, i: number): number;
export declare function _normalizeInputRaw(raw_info: string): string;
export interface IOptionsInfoparser {
	cast_to_snake?: boolean;
	/**
	 * If true, prompt and negative_prompt are included in the input
	 */
	isIncludePrompts?: boolean;
}
export interface IRecordInfo {
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
export declare function parseFromRawInfo(line: string, opts?: IOptionsInfoparser): IRecordInfo;
export declare function parseFromRawInfoGenerator(line: string, opts?: IOptionsInfoparser): Generator<readonly [
	string,
	string | number
] | readonly [
	EnumInfoKey,
	string
], void, void>;
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
export declare function parseFromImageBuffer(png: Uint8Array | string, cast_to_snake?: boolean): {
	metadata: {
		width: number;
		height: number;
		extra: string[];
		raw_info: string;
	};
	pnginfo: {
		prompt: string;
		negative_prompt: string;
	};
};

export {
	parseFromImageBuffer as default,
};

export {};
