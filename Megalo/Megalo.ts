import { MegaloConfig } from './types.ts';
import { MegaloRoute } from './MegaloRoute.ts';

export class Megalo {
	config: MegaloConfig;
	private routes: Map<string | RegExp, MegaloRoute>;

	constructor(config?: MegaloConfig) {
		this.config = { ...config };
		this.routes = new Map();
	}

	route(route: MegaloRoute): this {
		this.routes.set(route.path, route);
		return this;
	}
}
