/** @internal */
export class HttpError {
	message: string;
	statusText?: string;
	status: number;

	/**
	 * Throw this to automatically have status code and body set by error handler
	 * @param message String or object to be sent as response body
	 */
	constructor(message?: string | object) {
		if (message === undefined) this.message = 'An error ocurred.';
		else if (typeof message === 'string') this.message = message;
		else {
			try {
				this.message = JSON.stringify(message);
			} catch (e) {
				console.error('Error serializing message into json:', e);
				this.message = 'An error ocurred.';
			}
		}
		this.status = 500;
	}

	toResponse(): Response {
		return new Response(this.message, this);
	}
}

const createError = (status: number, statusText?: string): typeof HttpError =>
	class extends HttpError {
		status = status;
		statusText = statusText;
	};

export const BadRequestError = createError(400);
export const UnauthorizedError = createError(401);
export const PaymentRequired = createError(402);
export const ForbiddenError = createError(403);
export const NotFoundError = createError(404);
export const MethodNotAllowedError = createError(405);
export const NotAcceptableError = createError(406);
export const ProxyAuthenticationError = createError(407);
export const RequestTimeoutError = createError(408);
export const ConflictError = createError(409);
export const GoneError = createError(410);
export const LengthRequiredError = createError(411);
export const PreconditionFailedError = createError(412);
export const PayloadTooLargeError = createError(413);
export const URITooLongError = createError(414);
export const UnsupportedMediaTypeError = createError(415);
export const RangeError = createError(416);
export const Teapot = createError(418);
export const UnprocessableError = createError(422);
export const UpgradeRequiredError = createError(426);
export const PreconditionRequiredError = createError(428);
export const TooManyRequestsError = createError(429);
export const HeaderFieldsTooLargeError = createError(431);
export const LegalReasonsError = createError(451);
export const InternalServerError = createError(500);
export const NotImplementedError = createError(501);
export const BadGatewayError = createError(502);
export const ServiceUnavailableError = createError(503);
export const GatewayTimeoutError = createError(504);
export const HTTPVersionNotSupportedError = createError(505);
export const VariantAlsoNegotiatesError = createError(506);
export const InsufficientStorageError = createError(507);
export const LoopDetectedError = createError(508);
export const NotExtendedError = createError(510);
export const NetworkAuthenticationError = createError(511);
