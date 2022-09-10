import { MegaloConfig, MegaloRequest } from './types.ts';
import { parseUrl } from './utils.ts';
import { RouteOwner } from './RouteOwner.ts';

export class Megalo extends RouteOwner {
	private config: MegaloConfig;

	constructor(config: MegaloConfig = {}) {
		super(config);
		this.config = { ...config };
	}

	serve(opts: Deno.ServeOptions = {}): void {
		Deno.serve(opts, (req) => {
			const { pathname, rawQuery } = parseUrl(req.url);

			if (!pathname) return new Response('Malformed URL', { status: 400 });

			(req as MegaloRequest).pathname = pathname;
			(req as MegaloRequest).query = {};
			(req as MegaloRequest).rawQuery = rawQuery;
			(req as MegaloRequest).params = {};

			return super.handle(req as MegaloRequest);
		});
	}
}
