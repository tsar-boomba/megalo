import { Megalo } from './mod.ts';
import { parse } from 'https://deno.land/std@0.155.0/flags/mod.ts';

const megalo = new Megalo().get('/', () => new Response('hello benchmark!', { status: 200 }));

const { serve } = parse(Deno.args, { alias: { s: 'serve' } });
serve
	? megalo.serve({ port: 9000, hostname: '127.0.0.1' })
	: megalo.listen({ port: 9000, hostname: '127.0.0.1' });
