import { MegaloConfig, MegaloHooks } from './types.ts';
import { RouteOwner } from './RouteOwner.ts';
import { createMegaloRequest } from './utils.ts';
import { MegaloResponse } from './MegaloResponse.ts';

export class Megalo extends RouteOwner<MegaloHooks> {
	private config: MegaloConfig;

	constructor(config: MegaloConfig = {}) {
		super(config);
		this.config = { ...config };
	}

	preParseHandlers!: MegaloHooks['preParse'][];
	preSendHandlers!: MegaloHooks['preSend'][];
	async listen(opts: Deno.ListenOptions) {
		this.preParseHandlers ??=
			(this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		this.preSendHandlers ??=
			(this.hooks.get('preSend') ?? []) as MegaloHooks['preSend'][];

		const server = Deno.listen(opts);

		console.log(
			`Server started on http://${opts.hostname || '0.0.0.0'}:${opts.port}/`,
		);
		for await (const conn of server) {
			this.serveHttp(conn).catch((err) => console.error(err));
		}
	}

	async listenTls(opts: Deno.ListenTlsOptions) {
		this.preParseHandlers ??=
			(this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		this.preSendHandlers ??=
			(this.hooks.get('preSend') ?? []) as MegaloHooks['preSend'][];

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
		if (!Deno.serve) {
			throw new Error(
				'Run with --unstable to use `Deno.serve` or use Megalo.listen instead.',
			);
		}

		this.preParseHandlers ??=
			(this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		this.preSendHandlers ??=
			(this.hooks.get('preSend') ?? []) as MegaloHooks['preSend'][];
		return Deno.serve(opts, async (req) => {
			const res = new MegaloResponse();
			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = handler(req, res);
					if (result?.constructor === MegaloResponse) {
						return result.toResponse();
					}
				}

				const megaloReq = createMegaloRequest(req);
				await super.handle(megaloReq, res);

				for (let i = 0; i < this.preSendHandlers.length; i += 1) {
					const handler = this.preSendHandlers[i];
					const result = handler(megaloReq, res);
					if (result?.constructor === Promise) {
						const awaitedResult = await result;
						if (awaitedResult) return res.toResponse();
					} else {
						if (result) return res.toResponse();
					}
				}

				return res.toResponse();
			} catch (err) {
				this.handleErr(err, createMegaloRequest(req), res);
				return res.toResponse();
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
		if (!Deno.serve) {
			throw new Error(
				'Run with --unstable to use `Deno.serve` or use Megalo.listen instead.',
			);
		}

		this.preParseHandlers ??=
			(this.hooks.get('preParse') ?? []) as MegaloHooks['preParse'][];
		this.preSendHandlers ??=
			(this.hooks.get('preSend') ?? []) as MegaloHooks['preSend'][];
		return Deno.serve(opts, async (req) => {
			const res = new MegaloResponse();
			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = handler(req, res);
					if (result?.constructor === MegaloResponse) {
						return result.toResponse();
					}
				}

				const megaloReq = createMegaloRequest(req);
				await super.handle(megaloReq, res);

				for (let i = 0; i < this.preSendHandlers.length; i += 1) {
					const handler = this.preSendHandlers[i];
					const result = handler(megaloReq, res);
					if (result?.constructor === Promise) {
						const awaitedResult = await result;
						if (awaitedResult) return res.toResponse();
					} else {
						if (result) return res.toResponse();
					}
				}

				return res.toResponse();
			} catch (err) {
				this.handleErr(err, createMegaloRequest(req), res);
				return res.toResponse();
			}
		});
	}

	async serveHttp(conn: Deno.Conn): Promise<void> {
		const httpConn = Deno.serveHttp(conn);

		requests:
		for await (const requestEvent of httpConn) {
			const res = new MegaloResponse();
			const respond = () => {
				requestEvent.respondWith(res.toResponse()).catch(() => {
					try {
						conn.close();
					} catch {
						// no op
					}
				});
			};

			try {
				for (let i = 0; i < this.preParseHandlers.length; i += 1) {
					const handler = this.preParseHandlers[i];
					const result = await handler(requestEvent.request, res);
					if (result?.constructor === MegaloResponse) {
						respond();
						continue requests;
					}
				}

				const megaloReq = createMegaloRequest(requestEvent.request);
				await super.handle(megaloReq, res);

				for (let i = 0; i < this.preSendHandlers.length; i += 1) {
					const handler = this.preSendHandlers[i];
					const result = handler(megaloReq, res);
					if (result?.constructor === Promise) {
						const awaitedResult = await result;
						if (awaitedResult) {
							respond();
							continue requests;
						}
					} else {
						if (result) {
							respond();
							continue requests;
						}
					}
				}

				respond();
			} catch (err) {
				await this.handleErr(
					err,
					createMegaloRequest(requestEvent.request),
					res,
				);
				respond();
			}
		}
	}
}
