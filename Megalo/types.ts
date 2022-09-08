export type MegaloConfig = {};

export type MegaloRequest = Request & {
	pathname: string;
	query: Record<string, string>;
	rawQuery?: string;
	params: Record<string, string>;
};

export type MegaloHandler = (req: MegaloRequest) => Promise<Response> | Response;

export type ErrorHandler = (err: unknown, req: MegaloRequest) => Promise<Response> | Response;
