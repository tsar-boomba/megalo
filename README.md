# Megalo

Deno HTTP server framework aiming for maximum speed

## Example

```ts
// server.ts
import { Controller, Megalo } from 'https://deno.land/x/megalo/mod.ts';
import { cors } from 'https://deno.land/x/megalo/plugins/cors.ts';

const megalo = new Megalo({
	// optionally add a notFoundHandler
	notFoundHandler: (req, res) => res.status(404).body(`${req.pathname} not found :(`),
	// optionally add an errorHandler
	errorHandler: (_err, _req, res, httpErr) => {
		// if NotFoundError, etc. was thrown
		if (httpErr) return res.status(httpErr.status).body(httpErr.message);
		res.status(500).body('Internal Server Error');
	},
	plugins: [cors({ origin: 'http://127.0.0.1:9000' })],
});

megalo
	.get('/', { parseQuery: false }, (_req, res) => {
		res.body('hello megalo!', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.post('/', (_req, res) => {
		res.body('Secret handler', { status: 200 });
	})
	.get('/sus', (_req, res) => {
		res.body('sus page', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.get(/^\/regex(\/.*)?$/, (_req, res) => res.body(undefined, { status: 200 }))
	.get('/pattern/:id', ({ params }, res) => {
		res.body(`id: ${params.id}`, {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.post('/posted', (_req, res) => {
		res.body('you posted it :)', { status: 200 });
	})
	.controller(
		new Controller('/users')
			.get('/', (_req, res) => res.body('user', { status: 200 }))
			.get('/:id', (req, res) => res.body(`user id: ${req.params.id}`, { status: 200 }))
	);

console.log(`Startup time: ${performance.now()}ms`);
megalo.listen({ port: 9000, hostname: '127.0.0.1' });
```

### Start Server

Use `--allow-hrtime` for more precise `performance.now()`

```bash
deno run --allow-net --allow-hrtime --unstable server.ts
```

## Benchmarks

[HTTP server benchmarks](https://github.com/denosaurs/bench#readme)

## Route resolution

Routes are resolved in this order

-   string literal ex. `"/sus"`
-   controllers ex. `new Controller("/users")`
-   patterns ex. `"/users/:id"`
-   regex ex. `/^.*\/regex\/.*\/?$/`
-   wildcard (You can only have one of these per method) `"*"`
-   notFoundHandler

## Hooks

You can use hooks to run functions when certain lifecycle events occur. Hooks
can be used on the Megalo instance or Controller instance.

-   preRoute: runs before pathname is evaluated and handler is chosen
-   preHandle: runs directly before handler
-   postHandle: runs directly after handler (may change in the future)

The megalo instance has some exclusive hooks

-   preParse: runs before anything is done, right when request is received
-   preSend: run directly before response is sent to client, last chance to add
    headers or whatever

This is an example on how to use hooks. If you return the res from the hook it
will be sent early.

```ts
import { ForbiddenError, Megalo } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo();

megalo
	.addHook('preRoute', (req, res) => {
		// note that all pathname will never have trailing slash, even if url does
		if (req.pathname === '/return-early') return res;
		if (req.pathname === '/forbidden') throw new ForbiddenError('not okay >:(');
	})
	.get((req, res) => {
		res.status(200);
	});

megalo.listen({ port: 9000, hostname: '127.0.0.1' });
```

## Error Throwing

You can throw special exported errors to have the response status and body
automatically set.

```ts
import { InternalServerError, Megalo } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo();

megalo.get((req) => {
	throw new InternalServerError({ message: 'uh oh' });
	res.status(200);
});

megalo.listen({ port: 9000, hostname: '127.0.0.1' });
```

## OpenAPI Support

Megalo now has support for defining OpenAPI Documentation in your code. check out `openApiExample.ts` for a small example of using it. You can check out the [example deployment](https://tsar-boomba-megalo.deno.dev/swagger).

## Notes

If using serve / flash instead of listen, until
https://github.com/denoland/deno/issues/15813 is resolved, in all POST, PUT, and
PATCH routes you MUST await the body or else deno will panic.
