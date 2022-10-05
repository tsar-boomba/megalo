import { HttpError } from './HttpError.ts';
import { Plugin } from '../plugins/types.ts';
import { MegaloResponse } from './MegaloResponse.ts';
import { ExternalDocsObject, InfoObject, OperationObject, SecurityRequirementObject, ServerObject, TagObject } from '../openapi/types.ts';

export type RouteOwnerConfig = {
	errorHandler?: ErrorHandler;
	notFoundHandler?: Handler;
	/** Whether or not to parse query string into object, defaults to true */
	parseQuery?: boolean;
};

export type MegaloConfigProperties = {
	openapi?: {
		info: InfoObject;
		servers?: ServerObject[];
		security?: SecurityRequirementObject[];
		tags?: TagObject[];
		externalDocs?: ExternalDocsObject;
	};
	plugins?: Plugin[];
};

export type MegaloConfig =  RouteOwnerConfig;

export type RouteConfig =
	& {
		openapi?: OperationObject;
		metadata?: Record<string, any>;
		/** What HTTP method this route will handle */
		method: Methods;
	}
	& Omit<
		RouteOwnerConfig,
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
) => Promise<any> | any;

export type ErrorHandler = (
	err: unknown,
	req: MegaloRequest,
	res: MegaloResponse,
	httpErr?: HttpError,
) => Promise<void> | void;
