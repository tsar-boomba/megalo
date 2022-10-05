import { TypeDefinition } from './Schema.ts';

type Expression = string;

/**
 * https://swagger.io/specification/#contact-object
 */
type ContactObject = {
	name?: string;
	url?: string;
	email?: string;
};

/**
 * https://swagger.io/specification/#license-object
 */
type LicenseObject = {
	name: string;
	url?: string;
};

/**
 * https://swagger.io/specification/#info-object
 */
export type InfoObject = {
	title: string;
	description?: string;
	termsOfService?: string;
	contact?: ContactObject;
	license?: LicenseObject;
	version: string;
};

/**
 * https://swagger.io/specification/#external-documentation-object
 */
export type ExternalDocsObject = {
	description?: string;
	url: string;
};

type BaseParameterObject = {
	name: string;
	description?: string;
	deprecated?: boolean;
	schema?: TypeDefinition;
};

/**
 * https://swagger.io/specification/#parameter-object
 */
type ParameterObject =
	| ({ in: 'query'; required?: boolean; allowEmptyValue?: boolean } & BaseParameterObject)
	| ({ in: 'path'; required: true } & BaseParameterObject)
	| { in: 'header' | 'cookie'; required?: boolean };

/**
 * https://swagger.io/specification/#example-object
 */
type ExampleObject =
	| ({
			summary?: string;
			description?: string;
	  } & { value?: any })
	| { externalValue?: string };

/**
 * https://swagger.io/specification/#header-object
 */
type HeaderObject = { in: 'header' } & Omit<BaseParameterObject, 'name'>;

/**
 * https://swagger.io/specification/#encoding-object
 */
type EncodingObject = {
	contentType: string;
	headers?: Record<string, HeaderObject>;
	style?: string;
	explode?: boolean;
	allowReserved?: boolean;
};

/**
 * https://swagger.io/specification/#media-type-object
 */
type MediaTypeObject = {
	schema?: TypeDefinition;
	example?: any;
	examples?: Record<string, ExampleObject>;
	encoding?: Record<string, EncodingObject>;
};

/**
 * https://swagger.io/specification/#request-body-object
 */
type RequestBodyObject = {
	description?: string;
	content: Record<string, MediaTypeObject>;
	required?: boolean;
};

/**
 * https://swagger.io/specification/#server-variable-object
 */
type ServerVariableObject = {
	enum?: string[];
	default: string;
	description?: string;
};

/**
 * https://swagger.io/specification/#server-object
 */
export type ServerObject = {
	url: string;
	description?: string;
	variables?: Record<string, ServerVariableObject>;
};

/**
 * https://swagger.io/specification/#link-object
 */
type LinkObject = {
	operationRef?: string;
	operationId?: string;
	parameters?: Record<string, Expression>;
	requestBody?: Expression;
	description?: string;
	server?: ServerObject;
};

/**
 * https://swagger.io/specification/#response-object
 */
type ResponseObject = {
	description: string;
	headers?: Record<string, HeaderObject>;
	content?: Record<string, MediaTypeObject>;
	links?: Record<string, LinkObject>;
};

/**
 * https://swagger.io/specification/#callback-object
 */
type CallbackObject = Record<Expression, PathItemObject>;

export type PathItemObject = {
	summary?: string;
	description?: string;
	get?: OperationObject;
	put?: OperationObject;
	post?: OperationObject;
	delete?: OperationObject;
	options?: OperationObject;
	head?: OperationObject;
	patch?: OperationObject;
	trace?: OperationObject;
	servers?: ServerObject[];
	parameters?: ParameterObject[];
};

/**
 * https://swagger.io/specification/#security-requirement-object
 */
type SecurityObject = { [name: string]: string[] };

/**
 * https://swagger.io/specification/#operation-object
 */
export type OperationObject = {
	summary?: string;
	tags?: string[];
	description?: string;
	externalDocs?: ExternalDocsObject;
	operationId?: string;
	parameters?: ParameterObject[];
	requestBody?: RequestBodyObject;
	responses: Record<string, ResponseObject>;
	callbacks?: Record<string, CallbackObject>;
	deprecated?: boolean;
	security?: SecurityObject[];
	servers?: ServerObject[];
};

type BaseSecuritySchemeObject = {
	description?: string;
};

/**
 * https://swagger.io/specification/#oauth-flow-object
 */
type BaseOAuthFlowObject = {
	refreshUrl?: string;
	scopes: Record<string, string>;
};

/**
 * https://swagger.io/specification/#oauth-flow-object
 */
type ImplicitOAuthFlowObject = {
	authorizationUrl: string;
} & BaseOAuthFlowObject;

/**
 * https://swagger.io/specification/#oauth-flow-object
 */
type AuthorizationCodeOAuthFlowObject = {
	authorizationUrl: string;
	tokenUrl: string;
} & BaseOAuthFlowObject;

/**
 * https://swagger.io/specification/#oauth-flow-object
 */
type ClientCredentialsPasswordOAuthFlowObject = {
	tokenUrl: string;
} & BaseOAuthFlowObject;

/**
 * https://swagger.io/specification/#oauth-flows-object
 */
type OAuthFlowsObject = {
	implicit?: ImplicitOAuthFlowObject;
	password?: ClientCredentialsPasswordOAuthFlowObject;
	clientCredentials?: ClientCredentialsPasswordOAuthFlowObject;
	authorizationCode?: AuthorizationCodeOAuthFlowObject;
};

/**
 * https://swagger.io/specification/#security-scheme-object
 */
export type SecuritySchemaObject =
	| ({
			type: 'apiKey';
			name: string;
			in: 'query' | 'header' | 'cookie';
	  } & BaseSecuritySchemeObject)
	| ({ type: 'http'; scheme: string } & BaseSecuritySchemeObject)
	| ({ type: 'oauth2'; flows: OAuthFlowsObject } & BaseSecuritySchemeObject)
	| ({ type: 'openIdConnect'; openIdConnectUrl: string } & BaseSecuritySchemeObject);

/**
 * https://swagger.io/specification/#paths-object
 */
type PathsObject = Record<string, PathItemObject>;

/**
 * https://swagger.io/specification/#security-requirement-object
 */
export type SecurityRequirementObject = Record<string, string[]>;

/**
 * https://swagger.io/specification/#tag-object
 */
export type TagObject = {
	name: string;
	description?: string;
	externalDocs?: ExternalDocsObject;
};

export type OpenAPIObject = {
	openapi: string;
	info: InfoObject;
	servers?: ServerObject[];
	paths: PathsObject;
	components?: any;
	security?: SecurityRequirementObject[];
	tags?: TagObject[];
	externalDocs?: ExternalDocsObject;
}
