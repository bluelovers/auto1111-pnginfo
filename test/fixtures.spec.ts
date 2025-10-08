//@noUnusedParameters:false
//@noImplicitAny:false
/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="expect" />

import { basename, dirname, extname, join } from 'path';
// @ts-ignore
import { globSync, readFileSync } from 'fs';
import { __FIXTURES, __SNAPSHOTS_FILE } from './__root';
import { parseFromRawInfo } from '../src/index';
import { validPngInfo } from './lib/valid';
import { toMatchFile } from 'jest-file-snapshot2';
import { ensureDirSync } from 'fs-extra';

expect.extend({ toMatchFile });

beforeAll(async () =>
{

});

describe(basename(__filename, extname(__filename)), () =>
{
	test.each(globSync([
		'isIncludePrompts/*.txt',
		'isIncludePrompts*/*.txt',
	], {
		cwd: __FIXTURES
		// @ts-ignore
	}).map(v => v.replace(/\\/g, '/')))('%s', (file) => {
		const buf = readFileSync(join(__FIXTURES, file))

		let actual = parseFromRawInfo(buf.toString(), {
			isIncludePrompts: true,
		});

		validPngInfo(actual);

		let _file = join(__SNAPSHOTS_FILE, file + '.json');

		ensureDirSync(dirname(_file));

		expect(JSON.stringify(actual, null, '\t')).toMatchFile(_file);

		if (file.startsWith('isIncludePromptsWithInfoLine'))
		{
			expect(actual).toHaveProperty('Steps');
		}
	})

})

