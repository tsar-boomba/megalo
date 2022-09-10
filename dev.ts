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
	.route('/', () => {
		return new Response('<html><body>hello megalo!</body></html>', {
			status: 200,
			headers: { ['Content-Type']: 'text/html' },
		});
	}, { parseQuery: false })
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
	.controller(new Controller('/users').route('/', () => new Response('user', { status: 200 })))
	.serve();
