//@noUnusedParameters:false
/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="expect" />

import { basename, extname, join } from 'path';
import { readFileSync } from 'fs';
import PNGINFO from '../src/index';

beforeAll(async () =>
{

});

describe(basename(__filename, extname(__filename)), () =>
{
	let buf: Buffer;
	beforeEach(() => {
		buf = readFileSync(join(__dirname, 'tmp46c8k1iv.png'))
		;
	});

	test.skip(`dummy`, () => {});

	test(`PNGINFO`, async () =>
	{
		expect(PNGINFO(buf)).toMatchSnapshot();

	});

	test(`PNGINFO:cast_to_snake`, async () =>
	{
		expect(PNGINFO(buf, true)).toMatchSnapshot();
	});

})
