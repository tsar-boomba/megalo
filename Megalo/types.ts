import { HttpError } from './HttpError.ts';
import { Plugin } from "./plugins/types.ts";

export type RouteOwnerConfig<Hooks extends DefaultHooks = DefaultHooks> = {
	errorHandler?: ErrorHandler;
	notFoundHandler?: Handler;
	plugins?: Plugin<Hooks>[];
	/** Whether or not to parse query string into object, defaults to true */
	parseQuery?: boolean;
};

export type MegaloConfig = {} & RouteOwnerConfig<MegaloHooks>;

export type RouteConfig = {
	metadata?: Record<string, any>;
	/** What HTTP method this route will handle */
	method: Methods;
} & Omit<RouteOwnerConfig, 'errorHandler' | 'notFoundHandler'>;

export interface MegaloRequest extends Request {
	pathname: string;
	query: Record<string, string>;
	rawQuery?: string;
	params: Record<string, string>;
}

type HookReturn = Response | void | Promise<Response | void>;

export type DefaultHooks = {
	preHandle: (req: MegaloRequest, metadata?: Record<string, string>) => HookReturn;
	postHandle: (
		req: MegaloRequest,
		res: Response,
		metadata?: Record<string, string>
	) => HookReturn;
	preRoute: (req: MegaloRequest) => HookReturn;
};

export type MegaloHooks = {
	preParse: (req: Request) => HookReturn;
} & DefaultHooks;

export type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'ANY';

export type Handler = (req: MegaloRequest) => Promise<Response> | Response;

export type ErrorHandler = (
	err: unknown,
	req: MegaloRequest,
	httpErr?: HttpError
) => Promise<Response> | Response;
