const urlSafeClass = '[0-9a-zA-Z_~.!()\'!:,@;-]';

/**
 * Represents a path pattern ex. "/users/:id"
 */
export class PathnamePattern {
	private re: RegExp;

	/**
	 * Provide a pathname pattern such as "/users/:id"
	 * @param pattern A pathname pattern
	 */
	constructor(public pattern: string) {
		const pathPortions = pattern.split('/');

		this.re = new RegExp(
			`^${
				pathPortions
					.map((portion) => {
						if (!portion.startsWith(':')) {
							return portion + '/';
						} else {
							return `(?<${portion.slice(1)}>${urlSafeClass}+)/`;
						}
					})
					.join('')
			}?$`,
		);
	}

	/**
	 * Checks if pathname matches pattern and parses params
	 *
	 * ```
	 * const pattern = new PathnamePattern('/users/:id/:name');
	 * const params = patten.exec('/users/23/isaiah');
	 * console.log(params) // { id: "23", name: "isaiah" }
	 * ```
	 * @param pathname
	 * @returns parsed params
	 */
	exec(pathname: string): Record<string, string> | undefined {
		return this.re.exec(pathname)?.groups;
	}

	/**
	 * Checks if pathname matches pattern, does not parse params
	 *
	 * ```
	 * const pattern = new PathnamePattern('/users/:id/:name');
	 * const params = patten.exec('/users/23/isaiah');
	 * console.log(params) // { id: "23", name: "isaiah" }
	 * ```
	 * @param pathname
	 * @returns parsed params
	 */
	test(pathname: string): boolean {
		return this.re.test(pathname);
	}
}
