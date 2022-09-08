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

export const parseUrl = (
	url: string
): { pathname?: string; rawQuery?: string; query: Record<string, string> } => {
	const result = uriRe.exec(url);

	let pathname = result?.[5];
	// add trailing slash if needed then return
	pathname = pathname ? (pathname.endsWith('/') ? pathname : (pathname + '/')) : undefined;

	const rawQuery = result?.[7];
	const query = parseQuery(rawQuery ?? '');

	return { pathname, rawQuery, query };
};

function parseQuery(raw: string): Record<string, string> {
	const query = Object.create(null);

	raw = raw.trim();
	if (!raw) return query;

	raw.split('&').forEach((pair) => {
		const [key, value] = pair.replace(/\+/g, ' ').split('=').map((str) => decodeURIComponent(str));
		query[key] = value;
	})

	return query;
}
