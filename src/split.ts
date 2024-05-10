/**
 * \n
 */
export const RE_LINE_SPLIT_BASE = /\r?\n/;
/**
 * \x00\x00\x00\n
 */
export const RE_LINE_SPLIT_PLUS = /\x00\x00\x00\r?\n/;

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
export function _splitRawToLines(raw_info: string)
{
	return raw_info.split(_isRawVersionPlus(raw_info) ? RE_LINE_SPLIT_PLUS : RE_LINE_SPLIT_BASE)
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
export function _isRawVersionPlus(raw_info: string)
{
	return RE_LINE_SPLIT_PLUS.test(raw_info)
}
