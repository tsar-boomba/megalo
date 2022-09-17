import { assertEquals } from 'https://deno.land/std@0.154.0/testing/asserts.ts';
import { parseQuery, parseUrl } from './utils.ts';

Deno.test('Parse URL', () => {
	const path = '/path/paths/';
	const qs = 'query=value&q=s+t';
	assertEquals(parseUrl(`http://www.example.com${path}?${qs}`), {
		// should remove trailing slash
		pathname: path.slice(0, -1),
		rawQuery: qs,
	});
});

Deno.test('Parse Querystring', () => {
	const qs = 'query=string&spaces=encoded+okay';
	assertEquals(parseQuery(qs), { query: 'string', spaces: 'encoded okay' });
});
