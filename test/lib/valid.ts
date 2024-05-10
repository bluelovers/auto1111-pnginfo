/**
 * Created by user on 2024/5/10.
 */

export function validPngInfo(pnginfo: Record<string, string | number>)
{
	if ('prompt' in pnginfo)
	{
		expect(pnginfo['prompt']).not.toMatch(/\x00\x00\x00/)
	}

	if ('negative_prompt' in pnginfo)
	{
		expect(pnginfo['negative_prompt']).not.toMatch(/\x00\x00\x00/)
	}

	if ('Cutoff targets' in pnginfo)
	{
		expect(pnginfo['Cutoff targets']).toMatch(/^\[.*\]$/)
	}
}
