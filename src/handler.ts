import { IOptionsInfoparser } from './index';

export function keyToSnakeStyle1(key: string)
{
	return key.toLowerCase().replace(/ /g, '_')
}

export function handleInfoEntries(entries: Iterable<readonly [string, string]>, opts?: IOptionsInfoparser)
{
	return [...handleInfoEntriesGenerator(entries, opts)]
}

export function* handleInfoEntriesGenerator(entries: Iterable<readonly [string, string]>, opts?: IOptionsInfoparser)
{
	for (const entry of entries)
	{
		yield handleInfoEntry(entry, opts)
	}
}

export function handleInfoEntry(entry: readonly [string, string], opts?: IOptionsInfoparser)
{
	const cast_to_snake = opts?.cast_to_snake;
	const re = /^0\d/;

	let [key, value] = entry;

	const asNum = parseFloat(value);
	const isNotNum = (re.test(value)) || isNaN(asNum) || ((value as any as number) - asNum) !== 0;

	if (cast_to_snake) key = keyToSnakeStyle1(key)

	const out = [key, isNotNum ? value : asNum] as const;
	return out
}
