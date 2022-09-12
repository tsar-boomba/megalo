import { MegaloConfig, MegaloHooks } from './types.ts';
import { RouteOwner } from './RouteOwner.ts';
import { createMegaloRequest } from './utils.ts';

export class Megalo extends RouteOwner<
	MegaloHooks
> {
	private config: MegaloConfig;

	constructor(config: MegaloConfig = {}) {
		super(config);
		this.config = { ...config };
	}

	serve(opts: Deno.ServeOptions = {}): void {
		const preParseHandlers = (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		Deno.serve(opts, async (req) => {
			for (let i = 0; i < preParseHandlers.length; i += 1) {
				const handler = preParseHandlers[i];
				const result = await handler(req);
				if (result?.constructor === Response) return result;
			}

			return super.handle(createMegaloRequest(req));
		});
	}
}
