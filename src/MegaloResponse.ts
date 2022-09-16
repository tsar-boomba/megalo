import { MegaloHeaders } from './MegaloHeaders.ts';

export class MegaloResponse {
	#body: BodyInit | undefined | null;
	resStatus: ResponseInit['status'];
	statusText: ResponseInit['statusText'];
	headers: MegaloHeaders;

	constructor() {
		this.headers = new MegaloHeaders();
	}

	/**
	 * Set response body to `body` and optionally set status, headers, and status text
	 * @param body Body to be set
	 */
	body(body?: BodyInit, init?: ResponseInit) {
		this.#body = body;
		if (init?.status !== undefined) this.resStatus = init.status;
		if (init?.statusText !== undefined) this.statusText = init?.statusText;
		if (init?.headers !== undefined) this.headers = new MegaloHeaders(init.headers);
	}

	/**
	 * Set response body to stringified `json` and optionally set status, headers, and status text
	 * @param json Body to be set
	 */
	json(json: any, init?: ResponseInit) {
		this.body(JSON.stringify(json), init);
	}

	status(status: number): this {
		this.resStatus = status;
		return this;
	}

	toResponse() {
		return new Response(this.#body, {
			headers: this.headers,
			status: this.resStatus,
			statusText: this.statusText,
		});
	}
}
