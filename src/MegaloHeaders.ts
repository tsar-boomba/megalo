export class MegaloHeaders implements Headers {
	#headers: Map<string, string>;

	constructor(baseOrHeaders?: HeadersInit | MegaloHeaders) {
		if (!baseOrHeaders) {
			this.#headers = new Map();
		} else if (baseOrHeaders.constructor === MegaloHeaders) {
			this.#headers = new Map(baseOrHeaders.#headers);
		} else if (baseOrHeaders.constructor === Headers) {
			const headersList: [string, string][] =
				(baseOrHeaders as any)[Object.getOwnPropertySymbols(baseOrHeaders)[1]] ?? [];
			this.#headers = new Map(headersList);
		} else if (Array.isArray(baseOrHeaders)) {
			this.#headers = new Map(baseOrHeaders as [string, string][]);
		} else {
			this.#headers = new Map(Object.entries(baseOrHeaders as Record<string, string>));
		}
	}

	get(key: string): string | null {
		key = key.toLowerCase();
		return this.#headers.get(key) ?? null;
	}

	set(key: string, value: string) {
		key = key.toLowerCase();
		return this.#headers.set(key, value.trim());
	}

	has(key: string): boolean {
		key = key.toLowerCase();
		return this.#headers.has(key);
	}

	delete(key: string): boolean {
		key = key.toLowerCase();
		return this.#headers.delete(key);
	}

	append(key: string, value: string) {
		key = key.toLowerCase();
		const curr = this.#headers.get(key);
		curr ? this.#headers.set(key, curr.concat(`,${value.trim()}`)) : this.#headers.set(key, value.trim());
	}

	entries(): IterableIterator<[string, string]> {
		return this.#headers.entries();
	}

	keys(): IterableIterator<string> {
		return this.#headers.keys();
	}

	values(): IterableIterator<string> {
		return this.#headers.values();
	}

	forEach(
		callbackfn: (key: string, value: string, parent: this) => void,
		thisArg?: unknown
	): void {
		this.#headers.forEach((key, value) => callbackfn(key, value, this), thisArg);
	}

	/**
	 * Add many keys to the headers using set method
	 * @param iter
	 */
	setMany(iter: IterableIterator<[string, string]> | [string, string][]) {
		for (const [key, value] of iter) {
			this.#headers.set(key, value);
		}
	}

	/**
	 * Add many keys to the headers using append method
	 * @param iter
	 */
	appendMany(iter: IterableIterator<[string, string]> | [string, string][]) {
		for (const [key, value] of iter) {
			this.append(key, value);
		}
	}

	
	clone(): MegaloHeaders {
		return new MegaloHeaders(this);
	}
	
	[Symbol.iterator]() {
		return this.#headers.entries();
	}

	get [Symbol.toStringTag](): string {
		return 'MegaloHeaders' + this.#headers.toString().replace('[object Map]', '');
	}
}
