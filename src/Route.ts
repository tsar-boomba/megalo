import { MegaloResponse } from "./MegaloResponse.ts";
import { PathnamePattern } from './PathnamePattern.ts';
import { Handler, MegaloRequest, Methods, RouteConfig } from './types.ts';
import { parseQuery } from './utils.ts';

export class Route {
	path: string | RegExp | PathnamePattern;
	handlers: Map<Methods, { handler: Handler; config: RouteConfig }> = new Map();
	metadata?: Record<string, any>;

	constructor(path: string | RegExp | PathnamePattern) {
		// always use trailing slash
		if (typeof path === 'string') path.endsWith('/') ? null : (path += '/');

		this.path = path;
	}

	handle(req: MegaloRequest, res: MegaloResponse): void | Promise<void> {
		const handler = (this.handlers.get(req.method.toUpperCase() as Methods) ??
			this.handlers.get('ANY')) as { handler: Handler; config: RouteConfig };
		if (req.rawQuery && handler.config.parseQuery) req.query = parseQuery(req.rawQuery);
		return handler.handler(req, res);
	}
}
