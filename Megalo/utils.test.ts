import { assertEquals } from 'https://deno.land/std@0.154.0/testing/asserts.ts';
import { parseUrl } from './utils.ts';

Deno.test('Parse URL', () => {
	const path = '/path/paths';
	const qs = 'query=value&q=s+t';
	assertEquals(parseUrl(`http://www.example.com${path}?${qs}`), {
		pathname: path + '/',
		query: { query: 'value', q: 's t' },
		rawQuery: qs,
	});
});
