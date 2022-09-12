import { RouteOwner } from "./RouteOwner.ts";
import { MegaloRequest, RouteOwnerConfig } from "./types.ts";

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
		path.endsWith('/') ? path : path += '/';
		this.path = path;
	}

	handle(req: MegaloRequest): Response | Promise<Response> {
		let truncatedPathname = req.pathname.replace(this.path, '');
		if (truncatedPathname.length <= 0) truncatedPathname = '/';

		return super.handle(req, truncatedPathname);
	}
}