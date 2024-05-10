import { splitSmartly } from 'split-smartly2';
import { _isRawVersionPlus, _splitRawToLines } from './split';

/**
 * `${key}: ${value}`
 */
export function _parseLine(line: string)
{
	const [, key, value] = line.match(/^([^:]+)\s*:\s*(.*)$/);
	return [key, value] as const
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
export function _parseInfoLine(infoline: string)
{
	const entries = splitSmartly(infoline, [','], {
		brackets: true,
		trimSeparators: true,
	}) as string[];

	return entries.map(_parseLine)
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
export function extractPromptAndInfoFromRaw(raw_info: string)
{
	const isPlus = _isRawVersionPlus(raw_info);
	let lines = _splitRawToLines(raw_info);

	let prompt: string = '';
	let negative_prompt: string = '';
	let infoline: string = '';
	let infoline_extra: string[] = [];

	const lines_raw = lines.slice();

	if (isPlus)
	{
		if (lines.length > 3)
		{
			throw new TypeError()
		}

		let line = lines.pop();

		if (line.startsWith('Steps: '))
		{
			infoline = line;
			line = void 0
		}

		line ??= lines.pop();

		if (line.startsWith('Negative prompt: '))
		{
			negative_prompt = line.slice('Negative prompt: '.length);
			line = void 0
		}

		line ??= lines.pop();

		prompt = line;

		if (lines.length)
		{
			throw new TypeError()
		}
	}
	else
	{
		let negative_prompt_index = lines.findIndex(a => a.match(/^Negative prompt:/))
		prompt = lines.splice(0, negative_prompt_index).join('\n').trim()
		let steps_index = lines.findIndex(a => a.match(/^Steps:/))
		negative_prompt = lines.splice(0, steps_index).join('\n').slice('Negative prompt:'.length).trim()

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
		lines_raw,
	}
}
