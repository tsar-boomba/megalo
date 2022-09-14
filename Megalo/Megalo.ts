import { MegaloConfig, MegaloHooks } from './types.ts';
import { RouteOwner } from './RouteOwner.ts';
import { createMegaloRequest } from './utils.ts';

export class Megalo extends RouteOwner<MegaloHooks> {
	private config: MegaloConfig;

	constructor(config: MegaloConfig = {}) {
		super(config);
		this.config = { ...config };
	}

	preParseHandlers!: MegaloHooks['preParse'][];
	async listen(opts: Deno.ListenOptions) {
		this.preParseHandlers ??= (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		const server = Deno.listen(opts);

		console.log(`Server started on http://${opts.hostname || '0.0.0.0'}:${opts.port}/`);
		for await (const conn of server) {
			this.serve(conn).catch((err) => console.error(err));
		}
	}

	async listenTls(opts: Deno.ListenTlsOptions) {
		this.preParseHandlers ??= (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		const server = Deno.listenTls(opts);

		for await (const conn of server) {
			this.serve(conn).catch((err) => console.error(err));
		}
	}

	async serve(conn: Deno.Conn): Promise<void> {
		const httpConn = Deno.serveHttp(conn);

		requests: for await (const requestEvent of httpConn) {
			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = await handler(requestEvent.request);
					if (result?.constructor === Response) {
						await requestEvent.respondWith(result);
						break requests;
					}
				}

				await requestEvent.respondWith(
					super.handle(createMegaloRequest(requestEvent.request))
				);
			} catch (err) {
				await requestEvent.respondWith(
					this.handleErr(err, createMegaloRequest(requestEvent.request))
				);
			}
		}
	}
}
