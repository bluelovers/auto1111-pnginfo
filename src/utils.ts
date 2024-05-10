import { crlf } from 'crlf-normalize';

export function inputToBytes(png: Uint8Array | string)
{
	/**
	 * if (typeof Buffer !== 'undefined' && Buffer.isBuffer(png))
	 *   {
	 *     bytes = Uint8Array.from(png)
	 *     bin_str = png.toString()
	 *   }
	 *   else if (png instanceof Uint8Array)
	 *   {
	 *     bytes = png
	 *     bin_str = png.toString()
	 *   }
	 */
	if (typeof Buffer !== 'undefined' && Buffer.isBuffer(png) || png instanceof Uint8Array)
	{
		return png
	}

	/**
	 * bin_str = atob(png.slice(0, 8192))
	 * bytes = Uint8Array.from(bin_str, c => c.charCodeAt(0))
	 */
	return Uint8Array.from(atob(png.slice(0, 8192)), c => c.charCodeAt(0))
}

/**
 * get int32 from png compensating for endianness
 */
export function i32(a: Uint8Array, i: number)
{
	return new Uint32Array(new Uint8Array([...a.slice(i, i + 4)].reverse()).buffer)[0];
}

export function _normalizeInputRaw(raw_info: string)
{
	raw_info = crlf(raw_info).replace(/[\s\r\n]+$/g, '');

	return raw_info
}
