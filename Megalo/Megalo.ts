import { MegaloConfig } from './types.ts';
import { RouteOwner } from './RouteOwner.ts';
import { createMegaloRequest } from './utils.ts';

export class Megalo extends RouteOwner {
	private config: MegaloConfig;

	constructor(config: MegaloConfig = {}) {
		super(config);
		this.config = { ...config };
	}

	serve(opts: Deno.ServeOptions = {}): void {
		Deno.serve(opts, (req) => {
			return super.handle(createMegaloRequest(req));
		});
	}
}
