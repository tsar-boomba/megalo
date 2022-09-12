import { Controller } from './Megalo/Controller.ts';
import { Megalo } from './mod.ts';

const megalo = new Megalo({
	notFoundHandler: (req) =>
		new Response(`<html><body>${req.pathname} not found :(</body></html>`, {
			status: 404,
			headers: { ['Content-Type']: 'text/html' },
		}),
});

megalo
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

console.log(`Startup time: ${performance.now()}ms`);
megalo.serve();
