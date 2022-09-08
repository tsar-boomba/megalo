import { PathnamePattern } from "./PathnamePattern.ts";
import { MegaloHandler, MegaloRequest } from "./types.ts";

export class MegaloRoute {
	path: string | RegExp | PathnamePattern;
	handler: MegaloHandler;

	constructor(path: string | RegExp | PathnamePattern, handler: MegaloHandler) {
		// always use trailing slash
		if (typeof path === 'string') path.endsWith('/') ? null : (path += '/');

		this.path = path;
		this.handler = handler;
	}

	handle(req: MegaloRequest): Response | Promise<Response> {
		return this.handler(req);
	}
}
