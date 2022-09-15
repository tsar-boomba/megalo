import { PathnamePattern } from './PathnamePattern.ts';
import { assertEquals } from 'https://deno.land/std@0.154.0/testing/asserts.ts';

Deno.test('Single Parameter', () => {
	const pattern = new PathnamePattern('/users/:id');

	assertEquals(pattern.exec('/users/123')?.id, '123');
	assertEquals(pattern.exec('/users/123/')?.id, '123');
	assertEquals(pattern.exec('/users/'), undefined);
	assertEquals(pattern.exec('/users'), undefined);
});

Deno.test('Multi Parameter', () => {
	const pattern = new PathnamePattern('/users/:id/posts/:title');

	assertEquals(pattern.exec('/users/123/posts/deno'), { id: '123', title: 'deno' });
	assertEquals(pattern.exec('/users/123/posts/node-js'), { id: '123', title: 'node-js' });
	assertEquals(pattern.exec('/users/123/posts'), undefined);
	assertEquals(pattern.exec('/users'), undefined);
});
