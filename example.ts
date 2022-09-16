import { cors } from './plugins/cors.ts';
import { Megalo, Controller } from './mod.ts';
import { parse } from 'https://deno.land/std@0.155.0/flags/mod.ts';

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

const { serve } = parse(Deno.args, { alias: { s: 'serve' } });
serve
	? megalo.serve({ port: 9000, hostname: '127.0.0.1' })
	: megalo.listen({ port: 9000, hostname: '127.0.0.1' });
