import { Controller } from './Controller.ts';
import { Route } from './Route.ts';
import { PathnamePattern } from './PathnamePattern.ts';
import {
	DefaultHooks,
	ErrorHandler,
	Handler,
	MegaloRequest,
	Methods,
	RouteConfig,
	RouteOwnerConfig,
} from './types.ts';
import { HttpError } from './HttpError.ts';
import { MegaloResponse } from './MegaloResponse.ts';

export class RouteOwner<Hooks extends DefaultHooks = DefaultHooks> {
	protected parseQuery: boolean;
	protected notFoundHandler?: Handler;
	protected errorHandler?: ErrorHandler;
	protected stringRoutes: Map<string, Route> = new Map();
	protected controllers: Set<Controller> = new Set();
	protected regExpRoutes: Map<string, Route> = new Map();
	protected patternRoutes: Map<string, Route> = new Map();
	protected hooks: Map<keyof Hooks, Hooks[keyof Hooks][]> = new Map();

	constructor(config: RouteOwnerConfig<Hooks>) {
		this.notFoundHandler = config.notFoundHandler;
		this.errorHandler = config.errorHandler;
		// default to true
		this.parseQuery = config.parseQuery ?? true;

		config.plugins?.forEach((plugin) => plugin(this));
	}

	/**
	 * Add a hook for a certain lifecycle event, you can add multiple fr each event,
	 * they are executed in insertion order. You can return a response from any hook to
	 * respond early/overwrite response.
	 *
	 * preParse (root only): Runs right when request is received, before anything is done to it.
	 * preSend (root only): Runs right before response is sent.
	 *
	 * preRoute: Runs after request is parsed for pathname and rawQuery and
	 * before routes are searched for matching handler. Useful
	 * for when you want to change the pathname before searching for handlers occurs.
	 *
	 * preHandle: Runs immediately before handler, changing pathname will have no effect on
	 * what handler is run. If you want similar functionality for controllers, use preRoute hook,
	 * which runs whenever the controller receives a request to handle.
	 *
	 * postHandle: Runs immediately after handler or controller, has access to both request and response.
	 * Useful for logging.
	 *
	 * ```ts
	 * const megalo = new Megalo();
	 *
	 * // make all requests go to '/'
	 * megalo.addHook('preHandle', (req) => (req.user = { name: 'isaiah' }))
	 * // Hooks are scoped to route owner, this will only run for routes under this controller
	 * megalo.controller(
	 * 	new Controller('/users')
	 * 		.addHook('preRoute', (req) => (req.pathname = '/'))
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

	private route(
		path: string | RegExp | PathnamePattern,
		options: RouteConfig,
		handler: Handler
	): this {
		// convert paths with : in it to url patterns
		const isPattern = typeof path === 'string' && path.includes(':');
		if (isPattern) path = new PathnamePattern(path as string) as any;

		// by default uses owner's parseQuery, etc...
		const baseOptions: RouteConfig = {
			parseQuery: this.parseQuery,
			method: 'ANY',
		};
		const finalOptions = {
			...baseOptions,
			...options,
		};

		if (path.constructor === RegExp) {
			const strPath = path.toString();
			const existingRoute = this.regExpRoutes.get(strPath);
			if (!existingRoute) {
				const route = new Route(path);
				this.regExpRoutes.set(strPath, route);
				route.handlers.set(finalOptions.method, { handler, config: finalOptions });
			} else {
				existingRoute.handlers.set(finalOptions.method, { handler, config: finalOptions });
			}
		} else if (isPattern) {
			const existingRoute = this.patternRoutes.get((path as PathnamePattern).pattern);
			if (!existingRoute) {
				const route = new Route(path);
				this.patternRoutes.set((path as PathnamePattern).pattern, route);
				route.handlers.set(finalOptions.method, { handler, config: finalOptions });
			} else {
				existingRoute.handlers.set(finalOptions.method, { handler, config: finalOptions });
			}
		} else {
			(path as string).endsWith('/') ? path : (path += '/');
			const existingRoute = this.stringRoutes.get(path as string);
			if (!existingRoute) {
				const route = new Route(path);
				this.stringRoutes.set(path as string, route);
				route.handlers.set(finalOptions.method, { handler, config: finalOptions });
			} else {
				existingRoute.handlers.set(finalOptions.method, { handler, config: finalOptions });
			}
		}

		return this;
	}

	get(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	get(path: string | RegExp, handler: Handler): this;
	get(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'GET' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'GET' }, handler!);
	}

	post(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	post(path: string | RegExp, handler: Handler): this;
	/**
	 * Must await request body until https://github.com/denoland/deno/issues/15813 is resolved
	 */
	post(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'POST' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'POST' }, handler!);
	}

	put(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	put(path: string | RegExp, handler: Handler): this;
	/**
	 * Must await request body until https://github.com/denoland/deno/issues/15813 is resolved
	 */
	put(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'PUT' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'PUT' }, handler!);
	}

	patch(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	patch(path: string | RegExp, handler: Handler): this;
	/**
	 * Must await request body until https://github.com/denoland/deno/issues/15813 is resolved
	 */
	patch(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'PATCH' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'PATCH' }, handler!);
	}

	delete(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	delete(path: string | RegExp, handler: Handler): this;
	delete(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'DELETE' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'DELETE' }, handler!);
	}

	options(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	options(path: string | RegExp, handler: Handler): this;
	options(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'OPTIONS' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'OPTIONS' }, handler!);
	}

	any(path: string | RegExp, options: Omit<RouteConfig, 'method'>, handler: Handler): this;
	any(path: string | RegExp, handler: Handler): this;
	any(
		path: string | RegExp,
		optionsOrHandler: Handler | Omit<RouteConfig, 'method'>,
		handler?: Handler
	): this {
		return typeof optionsOrHandler === 'function'
			? this.route(path, { method: 'ANY' }, optionsOrHandler)
			: this.route(path, { ...optionsOrHandler, method: 'ANY' }, handler!);
	}

	/**
	 * Add a controller
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

	private controllerArr!: Controller[];
	private patternArr!: Route[];
	private regExpArr!: Route[];
	private preHandleHandlers!: DefaultHooks['preHandle'][];
	private postHandleHandlers!: DefaultHooks['postHandle'][];
	private preRouteHandlers!: DefaultHooks['preRoute'][];

	private firstReq = true;
	private initHandling() {
		// convert routes into arrays
		this.controllerArr = this.controllerArr
			? this.controllerArr
			: Array.from(this.controllers.values());
		this.patternArr = this.patternArr
			? this.patternArr
			: Array.from(this.patternRoutes.values());
		this.regExpArr = this.regExpArr ? this.regExpArr : Array.from(this.regExpRoutes.values());

		// init hooks
		this.preHandleHandlers = (this.hooks.get('preHandle') ?? []) as Hooks['preHandle'][];
		this.postHandleHandlers = (this.hooks.get('postHandle') ?? []) as Hooks['postHandle'][];
		this.preRouteHandlers = (this.hooks.get('preRoute') ?? []) as Hooks['preRoute'][];

		this.firstReq = false;
	}

	async handle(
		req: MegaloRequest,
		res: MegaloResponse,
		pathname = req.pathname
	): Promise<void> {
		const method = req.method.toUpperCase() as Methods;

		// changes pattern & regex route map to array and get hooks
		if (this.firstReq) this.initHandling();

		// run preRoute hooks
		for (let i = 0; i < this.preRouteHandlers.length; i += 1) {
			const handler = this.preRouteHandlers[i];
			const result = handler(req, res);
			if (result?.constructor === Promise) {
				const awaitedResult = await result;
				if (awaitedResult) return;
			} else {
				if (result) return;
			}
		}

		// check for string literal routes
		const route = this.stringRoutes.get(pathname);
		// route must have handler that matches req method or an ANY handler to match
		if (route && (route.handlers.get(method) || route.handlers.get('ANY'))) {
			return this.runHandler(req, res, route);
		}

		// check controllers
		for (let i = 0; i < this.controllerArr.length; i += 1) {
			const controller = this.controllerArr[i];
			if (pathname.startsWith(controller.path)) {
				await controller.handle(req, res, pathname);

				// run postHandle hooks
				for (let i = 0; i < this.postHandleHandlers.length; i += 1) {
					const handler = this.postHandleHandlers[i];
					const result = handler(req, res);
					if (result?.constructor === Promise) {
						const awaitedResult = await result;
						if (awaitedResult) return;
					} else {
						if (result) return;
					}
				}

				return;
			}
		}

		// check urlpatterns
		for (let i = 0; i < this.patternArr.length; i += 1) {
			const route = this.patternArr[i];
			const patternResult = (route.path as PathnamePattern).exec(pathname);
			if (patternResult && (route.handlers.get(method) || route.handlers.get('ANY'))) {
				req.params = patternResult;
				return this.runHandler(req, res, route);
			}
		}

		// check regex routes now
		for (let i = 0; i < this.regExpArr.length; i += 1) {
			const route = this.regExpArr[i];
			if (
				(route.path as RegExp).test(pathname) &&
				(route.handlers.get(method) || route.handlers.get('ANY'))
			)
				return this.runHandler(req, res, route);
		}

		const wildCard = this.stringRoutes.get('*');
		if (wildCard && (wildCard.handlers.get(method) || wildCard.handlers.get('ANY'))) {
			return this.runHandler(req, res, wildCard);
		}

		this.notFoundHandler?.(req, res) ?? res.status(404).body(undefined);
	}

	/**
	 * Handles running hooks & handler and handling error
	 */
	protected async runHandler(
		req: MegaloRequest,
		res: MegaloResponse,
		route: Route
	): Promise<void> {
		try {
			// run preHandleHooks
			for (let i = 0; i < this.preHandleHandlers.length; i += 1) {
				const handler = this.preHandleHandlers[i];
				const result = handler(req, res, route.metadata);
				if (result?.constructor === Promise) {
					const awaitedResult = await result;
					if (awaitedResult) return;
				} else {
					if (result) return;
				}
			}

			await route.handle(req, res);

			// run postHandle hooks
			for (let i = 0; i < this.postHandleHandlers.length; i += 1) {
				const handler = this.postHandleHandlers[i];
				const result = handler(req, res, route.metadata);
				if (result?.constructor === Promise) {
					const awaitedResult = await result;
					if (awaitedResult) return;
				} else {
					if (result) return;
				}
			}

			return;
		} catch (err: unknown) {
			return this.handleErr(err, req, res);
		}
	}

	protected handleErr(err: unknown, req: MegaloRequest, res: MegaloResponse): void | Promise<void> {
		let httpErr: HttpError | undefined;
		if (err instanceof HttpError) httpErr = err;
		if (this.errorHandler) return this.errorHandler(err, req, res, httpErr);
		console.error(err);

		if (httpErr) {
			res.status(httpErr.status).body(httpErr.message);
		} else {
			res.status(500).body('An internal server error ocurred.');
		}
	}
}
