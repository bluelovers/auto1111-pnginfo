export interface IOptionsInfoparser {
	cast_to_snake?: boolean;
	isIncludePrompts?: boolean;
}
export declare function infoparser(line: string, opts?: IOptionsInfoparser): {
	[k: string]: string | number;
};
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
export declare function PNGINFO(png: Uint8Array | string, cast_to_snake?: boolean): {
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
	PNGINFO as default,
};

export {};
