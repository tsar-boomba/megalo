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
	.addHook('preHandle', (req) => {
		console.log(req.pathname);
	})
	.route('/', { parseQuery: false }, () => {
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
	.controller(
		new Controller('/users')
			.addHook('preHandle', (req) => {
				console.log(req.method);
			})
			.route('/', () => new Response('user', { status: 200 }))
	);

console.log(`Startup time: ${performance.now()}ms`);
megalo.serve();
