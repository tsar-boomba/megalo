import { MegaloResponse } from './MegaloResponse.ts';
import { RouteOwner } from './RouteOwner.ts';
import { DefaultHooks, MegaloRequest, RouteOwnerConfig } from './types.ts';

/**
 * Group related handlers together with shared middleware
 */
export class Controller extends RouteOwner {
	path: string;

	/**
	 * @param path Base path for routes under this controller
	 */
	constructor(path: string, config: RouteOwnerConfig<DefaultHooks> = {}) {
		super(config);
		path.endsWith('/') && path.length > 1 ? (path = path.slice(0, -1)) : path;
		this.path = path;
	}

	handle(
		req: MegaloRequest,
		res: MegaloResponse,
		pathname: string = req.pathname,
	) {
		let truncatedPathname = pathname.replace(this.path, '');
		if (truncatedPathname.length === 0) truncatedPathname += '/';

		return super.handle(req, res, truncatedPathname);
	}
}
