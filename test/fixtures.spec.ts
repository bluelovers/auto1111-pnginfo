//@noUnusedParameters:false
//@noImplicitAny:false
/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="expect" />

import { basename, extname, join } from 'path';
// @ts-ignore
import { globSync, readFileSync } from 'fs';
import { __FIXTURES } from './__root';
import { infoparser } from '../src/index';
import { validPngInfo } from './lib/valid';

beforeAll(async () =>
{

});

describe(basename(__filename, extname(__filename)), () =>
{
	test.each(globSync([
		'isIncludePrompts/*.txt',
		'isIncludePromptsBase/*.txt',
	], {
		cwd: __FIXTURES
		// @ts-ignore
	}).map(v => v.replace(/\\/g, '/')))('%s', (file) => {
		const buf = readFileSync(join(__FIXTURES, file))

		let actual = infoparser(buf.toString(), {
			isIncludePrompts: true,
		});

		expect(actual).toMatchSnapshot();
		validPngInfo(actual);
	})

})

