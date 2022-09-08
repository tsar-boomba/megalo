import { ErrorHandler, MegaloConfig, MegaloHandler, MegaloRequest } from './types.ts';
import { MegaloRoute } from './MegaloRoute.ts';
import { PathnamePattern } from "./PathnamePattern.ts";
import { parseUrl } from './utils.ts';

export class Megalo {
	config: MegaloConfig;
	private notFoundHandler?: MegaloHandler;
	private errorHandler?: ErrorHandler;
	private stringRoutes: Map<string, MegaloRoute> = new Map();
	private regExpRoutes: Set<MegaloRoute> = new Set();
	private patternRoutes: Set<MegaloRoute> = new Set();

	constructor(config?: MegaloConfig) {
		this.config = { ...config };
	}

	route(path: string | RegExp, handler: MegaloHandler): this {
		// convert paths with : in it to url patterns
		if (typeof path === 'string' && path.includes(':'))
			path = new PathnamePattern(path) as any;

		const route = new MegaloRoute(path, handler);

		if (route.path.constructor === RegExp) this.regExpRoutes.add(route);
		if (route.path.constructor === PathnamePattern) this.patternRoutes.add(route);
		this.stringRoutes.set(route.path as string, route);

		return this;
	}

	notFound(handler: MegaloHandler | undefined): this {
		this.notFoundHandler = handler;
		return this;
	}

	error(errorHandler: ErrorHandler): this {
		this.errorHandler = errorHandler;
		return this;
	}

	serve(opts: Deno.ServeOptions = {}): void {
		Deno.serve(opts, (req) => {
			const { pathname, rawQuery, query } = parseUrl(req.url);

			if (!pathname) return new Response('Malformed URL', { status: 400 });

			(req as MegaloRequest).pathname = pathname;
			(req as MegaloRequest).query = query;
			(req as MegaloRequest).rawQuery = rawQuery;
			(req as MegaloRequest).params = {};

			const handler = this.stringRoutes.get(pathname);

			if (handler) {
				return this.runHandler(req as MegaloRequest, handler);
			} else {
				// check urlpatterns
				for (const route of this.patternRoutes.values()) {
					const patternResult = (route.path as PathnamePattern).exec(pathname);
					if (patternResult) {
						(req as MegaloRequest).params = patternResult;
						return this.runHandler(req as MegaloRequest, route);
					}
				}

				// check regex routes now
				for (const route of this.regExpRoutes.values()) {
					if ((route.path as RegExp).test(pathname))
						return this.runHandler(req as MegaloRequest, route);
				}

				return (
					this.notFoundHandler?.(req as MegaloRequest) ??
					new Response(undefined, { status: 404 })
				);
			}
		});
	}

	/**
	 * Handles running handler and handling error
	 */
	private runHandler(req: MegaloRequest, route: MegaloRoute): Response | Promise<Response> {
		try {
			return route.handler(req);
		} catch (err: unknown) {
			return (
				this.errorHandler?.(err, req) ??
				new Response('Internal Server Error', {
					status: 500,
					statusText: 'Internal Server Error',
				})
			);
		}
	}
}
