import { MegaloHooks } from '../src/types.ts';
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
	const allowedIsArray = Array.isArray(allowedOrigin);

	const headersString = headers.join(',');
	const methodsString = methods.join(',');
	const optionsHeaders: Record<string, string> = {
		['Access-Control-Allow-Methods']: methodsString,
		['Access-Control-Allow-Headers']: headersString,
		['Access-Control-Allow-Credentials']: credentials.toString(),
	};

	exposeHeaders && (optionsHeaders['Access-Control-Expose-Headers'] = exposeHeaders?.join(','));
	maxAge !== undefined && (optionsHeaders['Access-Control-Max-Age'] = maxAge.toFixed(0));
	allowedIsString && (optionsHeaders['Access-Control-Allow-Origin'] = allowedOrigin);
	!allowedIsString && (optionsHeaders['Vary'] = 'Origin');

	const originMatches = (origin: string): boolean => {
		if (allowedIsArray) {
			return allowedOrigin.some((match) =>
				match.constructor === RegExp ? match.test(origin) : match === origin
			);
		} else {
			return (allowedOrigin as RegExp).test(origin);
		}
	};

	return (owner) => {
		owner.options('*', (req, res) => {
			// set only if allowed is dynamic
			if (!allowedIsString) {
				const origin = req.headers.get('Origin') ?? '';
				optionsHeaders['Access-Control-Allow-Origin'] = originMatches(origin)
					? origin
					: 'false';
			}

			res.status(optionsSuccessStatus).body(undefined, { headers: optionsHeaders });
		});
		const credentialsString = credentials.toString();
		owner.addHook('preSend', (req, res) => {
			//const start = performance.now();
			res.headers.set('Access-Control-Allow-Credentials', credentialsString);
			if (!allowedIsString) {
				const origin = req.headers.get('Origin') ?? '';
				res.headers.set(
					'Access-Control-Allow-Origin',
					originMatches(origin) ? origin : 'false'
				);
				res.headers.append('Vary', 'Origin');
			}
			//console.log(performance.now() - start);
		});
	};
};
