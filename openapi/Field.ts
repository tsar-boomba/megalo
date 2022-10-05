import { Reflection } from './deps.ts';
import { ExternalDocsObject } from "./types.ts";

type CommonOpenAPIOptions = {
	/**
	 * Whether or not the value of this property can be `null`. Defaults to: `false`
	 */
	nullable?: boolean;
	readOnly?: boolean;
	writeOnly?: boolean;
	/**
	 * Whether or not this property must be specified. Defaults to: `true`
	 */
	required?: boolean;
	deprecated?: boolean;
	description?: string;
	example?: any;
	externalDocs?: ExternalDocsObject;
};

export type OpenAPIString = {
	type: 'string';
	minLength?: number;
	maxLength?: number;
	format?: string;
	/**
	 * Regular Expression ex. `'^\d{3}-\d{2}-\d{4}$'`
	 */
	pattern?: string;
	enum?: string[];
} & CommonOpenAPIOptions;

export type OpenAPIInteger = {
	type: 'integer';
	format?: 'int32' | 'int64';
	minimum?: number;
	maximum?: number;
	exclusiveMinimum?: boolean;
	exclusiveMaximum?: boolean;
	multipleOf?: number;
} & CommonOpenAPIOptions;

export type OpenAPINumber = {
	type: 'number';
	format?: 'float' | 'double';
	minimum?: number;
	maximum?: number;
	exclusiveMinimum?: boolean;
	exclusiveMaximum?: boolean;
	multipleOf?: number;
} & CommonOpenAPIOptions;

export type OpenAPIBoolean = {
	type: 'boolean';
} & CommonOpenAPIOptions;

export type OpenAPIArray = {
	type: 'array';
	items: OpenAPITypes | OpenAPITypes[];
	maxItems?: number;
	minItems?: number;
	uniqueItems?: boolean;
} & CommonOpenAPIOptions;

export type OpenAPIObject = {
	type: 'object';
	properties?: {
		[key: string]: OpenAPITypes | OpenAPITypes[];
	};
	additionalProperties?: boolean;
	nullable?: boolean;
};

export type OpenAPISchemaType = {
	type: () => new () => any;
};

export type OpenAPITypes =
	| OpenAPIString
	| OpenAPIInteger
	| OpenAPINumber
	| OpenAPIBoolean
	| OpenAPIArray
	| OpenAPIObject
	| OpenAPISchemaType
	| { type: 'any' };

export const validateField = (
	type: OpenAPITypes | OpenAPITypes[],
	tsType: Function | undefined,
	recursed?: boolean
) => {
	const hasTypeMetadata = Boolean(tsType);

	if (!hasTypeMetadata && !recursed) {
		console.warn(
			`You don't have 'emitDecoratorMetadata' enabled. It is recommended to help catch desynchronization between schema and ts types.`
		);
	}

	if (tsType === Object) {
		// type is a union or schema
		if (Array.isArray(type)) {
			// is a union type
			type.forEach((type) => validateField(type, undefined, true));
		} else if (type.type === 'object') {
			Object.values(type.properties ?? {}).forEach((value) =>
				validateField(value, undefined, true)
			);
		} else {
			// is a schema type
			const isSchema = Reflection.getMetadata('megalo-schema', (type.type as Function)());
			if (!isSchema) throw new Error('Field type must be a class with @Schema annotation.');
		}
	} else if (tsType === Array) {
		// type is an array
		if (Array.isArray(type)) {
			throw new Error(
				'May not use array of types, which is for union (`|`) types, for an array type.'
			);
		} else {
			if (type.type === 'array') {
				validateField(type.items, undefined, true);
			} else {
				throw new Error(
					`Type annotation is array type, while provided type is '${type.type}'`
				);
			}
		}
	} else if (hasTypeMetadata) {
		// annotation is a primitive (number, string, boolean)
		if (Array.isArray(type)) {
			throw new Error('Only provide an array for type if you annotate with a union.');
		}

		if (tsType === Number && type.type !== 'number' && type.type !== 'integer')
			throw new Error(
				'Annotated property with number, but did not provide Field with type `number` or `integer`.'
			);

		if (tsType === String && type.type !== 'string')
			throw new Error(
				'Annotated property with string, but did not provide Field with a `string`.'
			);

		if (tsType === Boolean && type.type !== 'boolean')
			throw new Error(
				'Annotated property with boolean, but did not provide Field with a `boolean`.'
			);
	}
};

export const Field = (type: OpenAPITypes | OpenAPITypes[]) => {
	if (Array.isArray(type)) {
		type = type.map((opt) => ({ required: true, ...opt }));
	} else if (type.type !== 'any' && type.type !== 'object' && typeof type.type !== 'function') {
		// @ts-expect-error: I known im safe
		type = { required: true, ...type };
	}

	return (target: any, key: string) => {
		Reflection.defineMetadata('megalo-schema-field', true as any, target, key);
		Reflection.defineMetadata('field-options', type as any, target, key);
	};
};
