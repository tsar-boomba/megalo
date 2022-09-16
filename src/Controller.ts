import { MegaloResponse } from "./MegaloResponse.ts";
import { RouteOwner } from './RouteOwner.ts';
import { MegaloRequest, RouteOwnerConfig } from './types.ts';

/**
 * Group related handlers together with shared middleware
 */
export class Controller extends RouteOwner {
	path: string;

	/**
	 * @param path Base path for routes under this controller
	 */
	constructor(path: string, config: RouteOwnerConfig = {}) {
		super(config);
		path.endsWith('/') ? path : (path += '/');
		this.path = path;
	}

	handle(req: MegaloRequest, res: MegaloResponse, pathname: string = req.pathname) {
		const truncatedPathname = pathname.replace(this.path, '/');

		return super.handle(req, res, truncatedPathname);
	}
}
