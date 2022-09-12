import { Controller } from './Controller.ts';
import { Route } from './Route.ts';
import { PathnamePattern } from './PathnamePattern.ts';
import {
	DefaultHooks,
	ErrorHandler,
	Handler,
	MegaloRequest,
	RouteConfig,
	RouteOwnerConfig,
} from './types.ts';

export class RouteOwner<Hooks extends DefaultHooks = DefaultHooks> {
	protected parseQuery: boolean;
	protected notFoundHandler?: Handler;
	protected errorHandler?: ErrorHandler;
	protected stringRoutes: Map<string, Route> = new Map();
	protected controllers: Set<Controller> = new Set();
	protected regExpRoutes: Set<Route> = new Set();
	protected patternRoutes: Set<Route> = new Set();
	protected hooks: Map<keyof Hooks, Hooks[keyof Hooks][]> = new Map();

	constructor(config: RouteOwnerConfig) {
		this.notFoundHandler = config.notFoundHandler;
		this.errorHandler = config.errorHandler;
		// default to true
		this.parseQuery = config.parseQuery ?? true;
	}

	/**
	 * Add a hook for a certain lifecycle event, you can add multiple fr each event,
	 * they are executed in insertion order. You can return a response from any hook to
	 * respond early/overwrite response.
	 * 
	 * preParse: Runs right when request is received, before anything is done to it.
	 * Useful if you want to rewrite the url, for example
	 * 
	 * preHandle: Runs immediately before handler, changing pathname will have no effect on
	 * what handler is run.
	 * 
	 * postHandle: Runs immediately after handler, has access to both request and response.
	 * Useful for logging.
	 *
	 * ```ts
	 * const megalo = new Megalo();
	 *
	 * // make all requests go to '/'
	 * megalo.addHook('preParse', (req) => (req.url = 'http://mydomain.com/'))
	 * // Hooks are scoped to route owner, this will only run for routes under this controller
	 * megalo.controller(
	 * 	new Controller('/users')
	 * 		.addHook('preHandle', (req) => (req.user = { name: 'isaiah' }))
	 * )
	 * ```
	 * @param name Name of hook to add handler for
	 * @param handler Handler to be run on this event
	 * @returns this
	 */
	addHook<K extends keyof Hooks>(name: K, handler: Hooks[K]): this {
		let handlers = this.hooks.get(name);

		if (!handlers) {
			handlers = [];
			this.hooks.set(name, handlers);
		}
		handlers.push(handler);

		return this;
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

	private preHandleHandlers!: DefaultHooks['preHandle'][];
	private postHandleHandlers!: DefaultHooks['postHandle'][];
	async handle(req: MegaloRequest, pathname = req.pathname): Promise<Response> {
		this.preHandleHandlers ??= (this.hooks.get('preHandle') ?? []) as Hooks['preHandle'][];
		this.postHandleHandlers ??= (this.hooks.get('postHandle') ?? []) as Hooks['postHandle'][];

		// check for string literal routes
		const handler = this.stringRoutes.get(pathname);
		if (handler) {
			return this.runHandler(req, handler);
		}

		// check controllers
		for (const controller of this.controllers.values()) {
			if (controller.path.startsWith(pathname)) {
				// run preHandleHooks
				for (let i = 0; i < this.preHandleHandlers.length; i += 1) {
					const handler = this.preHandleHandlers[i];
					const result = await handler(req);
					if (result?.constructor === Response) return result;
				}

				const controllerRes = controller.handle(req);

				// run postHandle hooks
				for (let i = 0; i < this.postHandleHandlers.length; i += 1) {
					const handler = this.preHandleHandlers[i];
					const result = await handler(req);
					if (result?.constructor === Response) return result;
				}

				return controllerRes;
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
	protected async runHandler(req: MegaloRequest, route: Route): Promise<Response> {
		try {
			// run preHandleHooks
			for (let i = 0; i < this.preHandleHandlers.length; i += 1) {
				const handler = this.preHandleHandlers[i];
				const result = await handler(req);
				if (result?.constructor === Response) return result;
			}

			const handlerRes = route.handle(req);

			// run postHandle hooks
			for (let i = 0; i < this.postHandleHandlers.length; i += 1) {
				const handler = this.preHandleHandlers[i];
				const result = await handler(req);
				if (result?.constructor === Response) return result;
			}

			return handlerRes;
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
