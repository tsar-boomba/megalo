import { MegaloHooks } from '../types.ts';
import { Plugin } from './types.ts';

export type CorsPluginOptions = {
	/**
	 * Access-Control-Allow-Origin
	 *
	 * You can set this to '*', a specific origin, an array of origins, or regex or an array of regex
	 */
	origin: string | RegExp | (string | RegExp)[];
	/**
	 * Access-Control-Allow-Headers
	 *
	 * Defaults to ['Content-Type']
	 */
	headers?: string[];
	/**
	 * Access-Control-Expose-Headers
	 *
	 * Defaults to undefined
	 */
	exposeHeaders?: string[];
	/**
	 * Access-Control-Allow-Methods
	 *
	 * Defaults to ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
	 */
	methods?: string[];
	/**
	 * Access-Control-Max-Age
	 *
	 * Defaults to undefined
	 */
	maxAge?: number;
	/**
	 * Access-Control-Allow-Credentials
	 *
	 * Defaults to false
	 */
	credentials?: boolean;
	/**
	 * Provides a status code to use for successful OPTIONS requests,
	 * since some legacy browsers (IE11) can't use 204.
	 *
	 * Defaults to 204
	 */
	optionsSuccessStatus?: number;
};

/**
 * Add a route to handle OPTIONS requests and headers
 * and a postHandle hook to add headers to non-options requests
 *
 * Please check out the docs for more info on CORS https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * @param opts Config object
 * @returns Plugin which will handle OPTIONS requests and respond to all requests with configured headers
 */
export const cors = ({
	origin: allowedOrigin,
	headers = ['Content-Type'],
	credentials = false,
	exposeHeaders,
	maxAge,
	methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
	optionsSuccessStatus = 204,
}: CorsPluginOptions): Plugin<MegaloHooks> => {
	methods = methods.map((m) => m.toUpperCase());
	const allowedIsString = typeof allowedOrigin === 'string';

	const headersString = headers.join(',');
	const methodsString = methods.join(',');
	const resHeaders: Record<string, string> = {
		['Access-Control-Allow-Methods']: methodsString,
		['Access-Control-Allow-Headers']: headersString,
		['Access-Control-Allow-Credentials']: credentials.toString(),
	};

	exposeHeaders && (resHeaders['Access-Control-Expose-Headers'] = exposeHeaders?.join(','));
	maxAge !== undefined && (resHeaders['Access-Control-Max-Age'] = maxAge.toFixed(0));
	allowedIsString && (resHeaders['Access-Control-Allow-Origin'] = allowedOrigin);
	!allowedIsString && (resHeaders['Vary'] = 'Origin');

	const originMatches = (origin: string): boolean => {
		if (Array.isArray(allowedOrigin)) {
			return allowedOrigin.some((match) =>
				match.constructor === RegExp ? match.test(origin) : match === origin
			);
		} else {
			return (allowedOrigin as RegExp).test(origin);
		}
	};
	console.log(allowedOrigin);

	return (owner) => {
		owner.options('*', (req) => {
			const origin = req.headers.get('Origin') ?? '';
			// set only if allowed is dynamic
			!allowedIsString &&
				(resHeaders['Access-Control-Allow-Origin'] = originMatches(origin)
					? origin
					: 'false');
			return new Response(undefined, {
				status: optionsSuccessStatus,
				headers: resHeaders,
			});
		});
		owner.addHook('postHandle', (req, res) => {
			const origin = req.headers.get('Origin') ?? '';
			credentials !== undefined &&
				res.headers.append('Access-Control-Allow-Credentials', credentials.toString());
			!allowedIsString &&
				res.headers.append(
					'Access-Control-Allow-Origin',
					originMatches(origin) ? origin : 'false'
				);
			!allowedIsString && res.headers.append('Vary', 'Origin');
		});
	};
};
