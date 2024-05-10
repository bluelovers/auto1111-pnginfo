export declare function _normalizeInputRaw(raw_info: string): string;
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
export declare function handleInfoEntries(entries: readonly (readonly [
	string,
	string
])[], opts?: IOptionsInfoparser): (readonly [
	string,
	string | number
])[];
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
export interface IOptionsInfoparser {
	cast_to_snake?: boolean;
	/**
	 * If true, prompt and negative_prompt are included in the input
	 */
	isIncludePrompts?: boolean;
}
export interface IRecordInfo {
	prompt: string;
	negative_prompt: string;
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
