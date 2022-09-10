export type RouteOwnerConfig = {
	errorHandler?: ErrorHandler;
	notFoundHandler?: Handler;
	/** Whether or not to parse query string into object, defaults to true */
	parseQuery?: boolean;
};

export type MegaloConfig = {} & RouteOwnerConfig;

export type RouteConfig = {} & Omit<RouteOwnerConfig, 'errorHandler' | 'notFoundHandler'>;

export type MegaloRequest = Request & {
	pathname: string;
	query: Record<string, string>;
	rawQuery?: string;
	params: Record<string, string>;
};

export type Handler = (req: MegaloRequest) => Promise<Response> | Response;

export type ErrorHandler = (err: unknown, req: MegaloRequest) => Promise<Response> | Response;
