import { PathnamePattern } from './PathnamePattern.ts';
import { Handler, MegaloRequest, RouteConfig } from './types.ts';
import { parseQuery } from './utils.ts';

export class Route {
	path: string | RegExp | PathnamePattern;
	handler: Handler;
	config: RouteConfig;

	constructor(
		path: string | RegExp | PathnamePattern,
		handler: Handler,
		config: RouteConfig = {}
	) {
		// always use trailing slash
		if (typeof path === 'string') path.endsWith('/') ? null : (path += '/');

		this.path = path;
		this.handler = handler;
		this.config = config;
	}

	handle(req: MegaloRequest): Response | Promise<Response> {
		if (req.rawQuery && this.config.parseQuery) req.query = parseQuery(req.rawQuery);
		return this.handler(req);
	}
}
