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
			this.serveHttp(conn).catch((err) => console.error(err));
		}
	}

	async listenTls(opts: Deno.ListenTlsOptions) {
		this.preParseHandlers ??= (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		const server = Deno.listenTls(opts);

		for await (const conn of server) {
			this.serveHttp(conn).catch((err) => console.error(err));
		}
	}

	/**
	 * Run server using Deno.serve / flash.
	 *
	 * Relevant Issues:
	 * https://github.com/denoland/deno/issues/15813
	 * https://github.com/denoland/deno/issues/15858
	 * @param opts Deno.serve options
	 */
	serve(opts: Deno.ServeOptions) {
		if (!Deno.serve)
			throw new Error(
				'Run with --unstable to use `Deno.serve` or use Megalo.listen instead.'
			);

		this.preParseHandlers ??= (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		return Deno.serve(opts, async (req) => {
			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = await handler(req);
					if (result?.constructor === Response) {
						return result;
					}
				}

				return super.handle(createMegaloRequest(req));
			} catch (err) {
				return this.handleErr(err, createMegaloRequest(req));
			}
		});
	}

	/**
	 * Run server using Deno.serve / flash.
	 *
	 * Relevant Issues:
	 * https://github.com/denoland/deno/issues/15813
	 * https://github.com/denoland/deno/issues/15858
	 * @param opts Deno.serve options
	 */
	serveTls(opts: Deno.ServeTlsOptions) {
		if (!Deno.serve)
			throw new Error(
				'Run with --unstable to use `Deno.serve` or use Megalo.listen instead.'
			);

		this.preParseHandlers ??= (this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		return Deno.serve(opts, async (req) => {
			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = await handler(req);
					if (result?.constructor === Response) {
						return result;
					}
				}

				return super.handle(createMegaloRequest(req));
			} catch (err) {
				return this.handleErr(err, createMegaloRequest(req));
			}
		});
	}

	async serveHttp(conn: Deno.Conn): Promise<void> {
		const httpConn = Deno.serveHttp(conn);

		requests: for await (const requestEvent of httpConn) {
			const respondWith = (res: Response | Promise<Response>) => {
				requestEvent.respondWith(res).catch(() => {
					try {
						conn.close();
					} catch {
						// no op
					}
				});
			};

			for (let i = 0; i < this.preParseHandlers.length; i += 1) {
				const handler = this.preParseHandlers[i];
				try {
					const result = await handler(requestEvent.request);
					if (result?.constructor === Response) {
						respondWith(result);
						break requests;
					}
				} catch (err) {
					await requestEvent.respondWith(
						this.handleErr(err, createMegaloRequest(requestEvent.request))
					);
				}
			}

			const res = super.handle(createMegaloRequest(requestEvent.request));

			respondWith(res);
		}
	}
}
