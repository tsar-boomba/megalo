import { cors } from './Megalo/plugins/cors.ts';
import { Megalo, Controller } from './mod.ts';

const megalo = new Megalo({
	// optionally add a notFoundHandler
	notFoundHandler: (req) =>
		new Response(`<html><body>${req.pathname} not found :(</body></html>`, {
			status: 404,
			headers: { ['Content-Type']: 'text/html' },
		}),
	// optionally add an errorHandler
	errorHandler: (_err, _req, httpErr) => {
		// if NotFoundError, etc. was thrown
		if (httpErr) return httpErr.toResponse();
		return new Response('Internal Server Error', { status: 500 })
	},
	plugins: [cors({ origin: 'http://127.0.0.1:9000' })]
});

const headers = new Headers();

headers.append('Vary', 'Encoding');
headers.append('Vary', 'Origin');
console.log(headers);


megalo
	.get('/', { parseQuery: false }, () => {
		return new Response('<html><body>hello megalo!</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	})
	.post('/', () => {
		return new Response('Secret handler', { status: 200 });
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
	.post('/posted', () => {
		return new Response('you posted it :)', { status: 200 });
	})
	.controller(new Controller('/users').get('/', () => new Response('user', { status: 200 })));

console.log(`Startup time: ${performance.now()}ms`);
await megalo.listen({ port: 9000, hostname: '127.0.0.1' });
