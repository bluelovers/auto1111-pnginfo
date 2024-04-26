/**
 * get int32 from png compensating for endianness
 */
export declare function i32(a: Uint8Array, i: number): number;
export declare function infoparser(line: string): Record<string, string>;
export declare function PNGINFO(png: Uint8Array | string, cast_to_snake?: boolean): {
	width: number;
	height: number;
	prompt: string;
	negative_prompt: string;
	extra: string[];
	raw_info: string;
} & Record<string, string>;

export {
	PNGINFO as default,
};

export {};
