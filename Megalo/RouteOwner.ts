import { Controller } from './Controller.ts';
import { Route } from './Route.ts';
import { PathnamePattern } from './PathnamePattern.ts';
import { ErrorHandler, Handler, MegaloRequest, RouteConfig, RouteOwnerConfig } from './types.ts';

export class RouteOwner {
	protected parseQuery: boolean;
	protected notFoundHandler?: Handler;
	protected errorHandler?: ErrorHandler;
	protected stringRoutes: Map<string, Route> = new Map();
	protected controllers: Set<Controller> = new Set();
	protected regExpRoutes: Set<Route> = new Set();
	protected patternRoutes: Set<Route> = new Set();

	constructor(config: RouteOwnerConfig) {
		this.notFoundHandler = config.notFoundHandler;
		this.errorHandler = config.errorHandler;
		// default to true
		this.parseQuery = config.parseQuery ?? true;
	}

	route(path: string | RegExp, options: RouteConfig, handler: Handler): this;
	route(path: string | RegExp, handler: Handler): this;
	route(path: string | RegExp, optionsOrHandler: Handler | RouteConfig, handler?: Handler): this {
		// convert paths with : in it to url patterns
		if (typeof path === 'string' && path.includes(':')) path = new PathnamePattern(path) as any;

		// by default uses owner's parseQuery, etc...
		const baseOptions = {
			parseQuery: this.parseQuery,
		};

		const route =
			typeof optionsOrHandler === 'function'
				? new Route(path, optionsOrHandler, baseOptions)
				: new Route(path, handler!, { ...baseOptions, ...(optionsOrHandler ?? {}) });

		if (route.path.constructor === RegExp) this.regExpRoutes.add(route);
		else if (route.path.constructor === PathnamePattern) this.patternRoutes.add(route);
		else this.stringRoutes.set(route.path as string, route);

		return this;
	}

	/**
	 * Add controller to app
	 * @param controller
	 * @returns this
	 */
	controller(controller: Controller): this {
		// controller uses this instance's handler if it doesn't have any
		controller.errorHandler ??= this.errorHandler;
		controller.notFoundHandler ??= this.notFoundHandler;

		this.controllers.add(controller);
		return this;
	}

	handle(req: MegaloRequest, pathname = req.pathname): Response | Promise<Response> {
		// check for string literal routes
		const handler = this.stringRoutes.get(pathname);
		if (handler) {
			return this.runHandler(req, handler);
		}

		// check controllers
		for (const controller of this.controllers.values()) {
			if (controller.path.startsWith(pathname)) {
				return controller.handle(req);
			}
		}

		// check urlpatterns
		for (const route of this.patternRoutes.values()) {
			const patternResult = (route.path as PathnamePattern).exec(req.pathname);
			if (patternResult) {
				req.params = patternResult;
				return this.runHandler(req, route);
			}
		}

		// check regex routes now
		for (const route of this.regExpRoutes.values()) {
			if ((route.path as RegExp).test(req.pathname)) return this.runHandler(req, route);
		}

		return this.notFoundHandler?.(req) ?? new Response(undefined, { status: 404 });
	}

	/**
	 * Handles running middleware & handler and handling error
	 */
	protected runHandler(req: MegaloRequest, route: Route): Response | Promise<Response> {
		try {
			return route.handle(req);
		} catch (err: unknown) {
			console.error(err);
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
