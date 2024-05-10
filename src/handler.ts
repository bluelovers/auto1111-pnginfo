import { IOptionsInfoparser } from './index';

export function keyToSnakeStyle1(key: string)
{
	return key.toLowerCase().replace(/ /g, '_')
}

export function handleInfoEntries(entries: readonly (readonly [string, string])[], opts?: IOptionsInfoparser)
{
	const cast_to_snake = opts?.cast_to_snake;
	const re = /^0\d/;

	return entries.map(([key, value]) =>
	{
		const asNum = parseFloat(value);
		const isNotNum = (re.test(value)) || isNaN(asNum) || ((value as any as number) - asNum) !== 0;

		if (cast_to_snake) key = keyToSnakeStyle1(key)

		const out = [key, isNotNum ? value : asNum] as const;
		return out
	})
}
