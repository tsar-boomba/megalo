# Megalo
Deno HTTP server framework aiming for maximum speed

## Example
```ts
import { Megalo } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo();

megalo
	.route('/', () => {
		return new Response('<html><body>hello megalo!</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.route('/sus', () => {
		return new Response('<html><body>sus page</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.route(/^\/regex(\/.*)?$/, () => new Response(undefined, { status: 200 }))
	.route('/pattern/:id', ({ params }) => {
		return new Response(`<html><body>id: ${params.id}</body></html>`, {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.notFound(
		(req) =>
			new Response(`<html><body>${req.pathname} not found :(</body></html>`, {
				status: 404,
				headers: { ['Content-Type']: 'text/html' },
			})
	)
	.serve();

```
