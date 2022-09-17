import { MegaloRequest } from './types.ts';

/**
 * 0: full string
 * 1: protocol
 * 2: protocol:
 * 3: //host
 * 4: host
 * 5: path
 * 6: ?query
 * 7: query
 * 8: #hashtag string
 * 9: hashtag string
 */
const uriRe = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

export const parseUrl = (url: string): { pathname?: string; rawQuery?: string } => {
	const result = uriRe.exec(url);

	let pathname = result?.[5];
	// add trailing slash if needed then return
	pathname = pathname
		? pathname.endsWith('/') && pathname.length > 1
			? pathname.slice(0, -1)
			: pathname
		: undefined;

	const rawQuery = result?.[7];

	return { pathname, rawQuery };
};

export const parseQuery = (raw: string): Record<string, string> => {
	const query = Object.create(null);

	raw = raw.trim();
	if (!raw) return query;

	raw.split('&').forEach((pair) => {
		const [key, value] = pair
			.replace(/\+/g, ' ')
			.split('=')
			.map((str) => decodeURIComponent(str));
		query[key] = value;
	});

	return query;
};

export const createMegaloRequest = (req: Request): MegaloRequest => {
	const { pathname, rawQuery } = parseUrl(req.url);

	// TODO use like nest style error ex. throw new BadRequestError()
	if (!pathname) throw new Error('Malformed URL');

	(req as MegaloRequest).pathname = pathname;
	(req as MegaloRequest).query = {};
	(req as MegaloRequest).rawQuery = rawQuery;
	(req as MegaloRequest).params = {};

	// scuffed way to get my custom properties to also be cloned
	req.clone = () => {
		const cloned = Request.prototype.clone.apply(req) as MegaloRequest;
		cloned.pathname = (req as MegaloRequest).pathname;
		cloned.query = { ...(req as MegaloRequest).query };
		cloned.rawQuery = (req as MegaloRequest).rawQuery;
		cloned.params = { ...(req as MegaloRequest).params };
		return cloned;
	};

	return req as MegaloRequest;
};
