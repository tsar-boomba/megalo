# Megalo
Deno HTTP server framework aiming for maximum speed

## Example
```ts
import { Megalo, Controller } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo({
	notFoundHandler: (req) =>
		new Response(`<html><body>${req.pathname} not found :(</body></html>`, {
			status: 404,
			headers: { ['Content-Type']: 'text/html' },
		}),
});

megalo
	// route all requests to '/'
	.addHook('preRoute', (req) => (req.pathname = '/'))
	.get('/', { parseQuery: false }, () => {
		return new Response('<html><body>hello megalo!</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.get('/sus', () => {
		return new Response('<html><body>sus page</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.get(/^\/regex(\/.*)?$/, () => new Response(undefined, { status: 200 }))
	.get('/pattern/:id', ({ params }) => {
		return new Response(`<html><body>id: ${params.id}</body></html>`, {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.post('/posted', async (req) => {
		await req.text();
		return new Response('you posted it :)', { status: 200 });
	})
	.controller(new Controller('/users').get('/', () => new Response('user', { status: 200 })));

// fast startup
console.log(`Startup time: ${performance.now()}ms`);
megalo.serve();
```

## Route resolution

Routes are resolved in this order
- string literal ex. `"/sus"`
- controllers ex. `new Controller("/users")`
- patterns ex. `"/users/:id"`
- regex ex. `/^.*\/regex\/.*\/?$/`
- notFoundHandler

## Notes

Until https://github.com/denoland/deno/issues/15813 is resolved, in all POST, PUT, and PATCH routes you MUST await the body or else deno will panic. Also, do not use this in production as any POST, PUT, or PATCH request will crash the server, until this bug is fixed.
