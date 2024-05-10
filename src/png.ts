import { i32 } from './utils';

const BYTES_pngmagic = '137,80,78,71,13,10,26,10';
const BYTES_tEXt = Uint8Array.from('tEXt', c => c.charCodeAt(0)).join(',');

const OFFSET_parameters = "parameters\u0000".length

export function uint8arrayToString(uint8array: Uint8Array)
{
	return new TextDecoder().decode(uint8array)
}

/**
 * ```
 * new TextEncoder().encode(inputString)
 * String.fromCharCode(...raw_info)
 * ```
 */
export function stringToUint8Array(inputString: string)
{
	return new TextEncoder().encode(inputString);
}

/**
 * Extracts raw data from a PNG byte array.
 *
 * @param bytes - The Uint8Array containing the PNG data.
 * @returns An object containing the width, height, and raw_info extracted from the PNG data,
 *          or `undefined` if the PNG data does not contain a valid tEXt chunk.
 */
export function extractRawFromBytes(bytes: Uint8Array)
{
	// Check if the bytes represent a valid PNG file by comparing the magic number
	const pngmagic = bytes.slice(0, 8).join(',') === BYTES_pngmagic
	if (!pngmagic) return undefined

	// Extract the width, height, and IHDR size from the PNG data
	const [ihdrSize, width, height] = [i32(bytes, 8), i32(bytes, 16), i32(bytes, 20)];

	// Calculate the offset of the tEXt chunk in the PNG data
	const txtOffset = 8 + ihdrSize + 12;

	// Check if the tEXt chunk is present by comparing the chunk type
	if (bytes.slice(txtOffset + 4, txtOffset + 8).join(',') !== BYTES_tEXt) return undefined

	// Extract the size of the tEXt chunk data
	const txtSize = i32(bytes, txtOffset);

	// Extract the raw_info data from the tEXt chunk
	const raw_info = bytes.slice(txtOffset + 8 + OFFSET_parameters, txtOffset + 8 + txtSize);

	// Convert the raw_info data to a string
	const raw_info_str = uint8arrayToString(raw_info);

	// Return the extracted data
	return {
		width,
		height,
		raw_info: raw_info_str,
	}
}
