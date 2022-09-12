import { PathnamePattern } from './PathnamePattern.ts';
import { Handler, MegaloRequest, Methods, RouteConfig } from './types.ts';
import { parseQuery } from './utils.ts';

export class Route {
	path: string | RegExp | PathnamePattern;
	handlers: Map<Methods, Handler> = new Map();
	config: RouteConfig;
	metadata?: Record<string, any>;

	constructor(
		path: string | RegExp | PathnamePattern,
		config: RouteConfig = { method: 'ANY' }
	) {
		// always use trailing slash
		if (typeof path === 'string') path.endsWith('/') ? null : (path += '/');

		this.path = path;
		this.metadata = config.metadata;
		this.config = config;
	}

	handle(req: MegaloRequest): Response | Promise<Response> {
		if (req.rawQuery && this.config.parseQuery) req.query = parseQuery(req.rawQuery);
		const handler = this.handlers.get(req.method.toUpperCase() as Methods) ?? this.handlers.get('ANY');
		return handler!(req);
	}
}
