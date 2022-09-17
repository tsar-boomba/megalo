import { HttpError } from './HttpError.ts';
import { Plugin } from '../plugins/types.ts';
import { MegaloResponse } from './MegaloResponse.ts';

export type RouteOwnerConfig<Hooks extends DefaultHooks> = {
	errorHandler?: ErrorHandler;
	notFoundHandler?: Handler;
	plugins?: Plugin<Hooks>[];
	/** Whether or not to parse query string into object, defaults to true */
	parseQuery?: boolean;
};

export type MegaloConfig = {} & RouteOwnerConfig<MegaloHooks>;

export type RouteConfig =
	& {
		metadata?: Record<string, any>;
		/** What HTTP method this route will handle */
		method: Methods;
	}
	& Omit<
		RouteOwnerConfig<never>,
		'errorHandler' | 'notFoundHandler' | 'plugins'
	>;

export interface MegaloRequest extends Request {
	pathname: string;
	query: Record<string, string>;
	rawQuery?: string;
	params: Record<string, string>;
}

type HookReturn = MegaloResponse | void | Promise<MegaloResponse | void>;

export type DefaultHooks = {
	preHandle: (
		req: MegaloRequest,
		res: MegaloResponse,
		metadata?: Record<string, string>,
	) => HookReturn;
	postHandle: (
		req: MegaloRequest,
		res: MegaloResponse,
		metadata?: Record<string, string>,
	) => HookReturn;
	preRoute: (req: MegaloRequest, res: MegaloResponse) => HookReturn;
};

export type MegaloHooks = {
	preParse: (req: Request, res: MegaloResponse) => HookReturn;
	preSend: (req: MegaloRequest, res: MegaloResponse) => HookReturn;
} & DefaultHooks;

export type Methods =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'
	| 'ANY';

export type Handler = (
	req: MegaloRequest,
	res: MegaloResponse,
) => Promise<void> | void;

export type ErrorHandler = (
	err: unknown,
	req: MegaloRequest,
	res: MegaloResponse,
	httpErr?: HttpError,
) => Promise<void> | void;
