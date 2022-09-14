import { assertEquals } from 'https://deno.land/std@0.155.0/testing/asserts.ts';

Deno.test('end-2-end', async () => {
	const serverProc = Deno.run({
		cmd: ['deno', 'run', '-A', 'example.ts'],
	});
	// wait for server to start
	await new Promise((resolve) => setTimeout(resolve, 100));
	const serverUrl = 'http://127.0.0.1:9000';

	try {
		let res = await fetch(serverUrl + '/');
		let result = await res.text();
		assertEquals(result, 'hello megalo!');
		assertEquals(res.headers.get('Content-Type'), 'text/html');

		res = await fetch(serverUrl + '/', { method: 'POST', mode: 'cors' });
		result = await res.text();
		assertEquals(result, 'Secret handler');

		res = await fetch(serverUrl + '/sus');
		result = await res.text();
		assertEquals(result, 'sus page');
		assertEquals(res.headers.get('Content-Type'), 'text/html');

		res = await fetch(serverUrl + '/regex/path/path2/path3/peth/paths');
		result = await res.text();
		assertEquals(result, '');

		res = await fetch(serverUrl + '/pattern/1234');
		result = await res.text();
		assertEquals(result, 'id: 1234');

		res = await fetch(serverUrl + '/users');
		result = await res.text();
		assertEquals(result, 'user');
	} catch (err) {
		serverProc.close();
		throw err;
	}

	serverProc.close();
});
