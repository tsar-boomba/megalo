import { Reflection } from './deps.ts';
import {
	OpenAPIArray,
	OpenAPIBoolean,
	OpenAPIInteger,
	OpenAPINumber,
	OpenAPIObject,
	OpenAPIString,
	OpenAPITypes,
	validateField,
} from './Field.ts';

export type SchemaOptions = {
	/**
	 * Allow additional properties, not defined explicitly
	 *
	 * For accurate types add `[key: string]: any` to your class
	 */
	additionalProperties?: boolean;
};

export type TypeDefinition =
	| Omit<OpenAPIString, 'required'>
	| Omit<OpenAPIInteger, 'required'>
	| Omit<OpenAPINumber, 'required'>
	| Omit<OpenAPIBoolean, 'required'>
	| (Omit<OpenAPIArray, 'required' | 'items'> & { items: TypeDefinition | TypeDefinition[] })
	| (Omit<OpenAPIObject, 'required' | 'properties'> & {
			properties: Record<string, TypeDefinition> | undefined;
			required?: string[];
	  })
	| { $ref: string; nullable?: boolean }
	| { oneOf: TypeDefinition[] }
	| { type: '{}' };

export type SchemaDefinition = {
	type: 'object';
	required: string[] | undefined;
	properties: Record<string, TypeDefinition>;
	additionalProperties?: boolean;
};

const refs: Record<string, string> = {};
export const schemas: Record<string, SchemaDefinition> = {};

const optionToTypeDefinition = (key: string, option: OpenAPITypes): TypeDefinition => {
	if (option.type === 'string') {
		return {
			type: option.type,
			format: option.format,
			maxLength: option.maxLength,
			minLength: option.minLength,
			pattern: option.pattern,
			enum: option.enum,
			nullable: option.nullable,
			readOnly: option.readOnly,
			writeOnly: option.writeOnly,
			description: option.description,
			deprecated: option.deprecated,
			example: option.example,
			externalDocs: option.externalDocs,
		};
	} else if (option.type === 'number') {
		return {
			type: option.type,
			format: option.format,
			minimum: option.minimum,
			maximum: option.maximum,
			exclusiveMinimum: option.exclusiveMinimum,
			exclusiveMaximum: option.exclusiveMaximum,
			multipleOf: option.multipleOf,
			nullable: option.nullable,
			readOnly: option.readOnly,
			writeOnly: option.writeOnly,
			description: option.description,
			deprecated: option.deprecated,
			example: option.example,
			externalDocs: option.externalDocs,
		};
	} else if (option.type === 'integer') {
		return {
			type: option.type,
			format: option.format,
			minimum: option.minimum,
			maximum: option.maximum,
			exclusiveMinimum: option.exclusiveMinimum,
			exclusiveMaximum: option.exclusiveMaximum,
			multipleOf: option.multipleOf,
			nullable: option.nullable,
			readOnly: option.readOnly,
			writeOnly: option.writeOnly,
			description: option.description,
			deprecated: option.deprecated,
			example: option.example,
			externalDocs: option.externalDocs,
		};
	} else if (option.type === 'boolean') {
		return {
			type: option.type,
			nullable: option.nullable,
			readOnly: option.readOnly,
			writeOnly: option.writeOnly,
			description: option.description,
			deprecated: option.deprecated,
			example: option.example,
			externalDocs: option.externalDocs,
		};
	} else if (option.type === 'array') {
		return {
			type: option.type,
			items: Array.isArray(option.items)
				? // is a union type
				  { oneOf: option.items.map((opt) => optionToTypeDefinition(key, opt)) }
				: optionToTypeDefinition(key, option.items),
			minItems: option.minItems,
			maxItems: option.maxItems,
			uniqueItems: option.uniqueItems,
			nullable: option.nullable,
			readOnly: option.readOnly,
			writeOnly: option.writeOnly,
			description: option.description,
			deprecated: option.deprecated,
			example: option.example,
			externalDocs: option.externalDocs,
		};
	} else if (option.type === 'object') {
		const requiredProps: string[] = [];
		const properties = option.properties
			? // turn openapi types into typedef object
			  Object.entries(option.properties).reduce<Record<string, TypeDefinition>>(
					(acc, [key, options]) => {
						if (
							!Array.isArray(options) &&
							options.type !== 'object' &&
							options.type !== 'any' &&
							typeof options.type !== 'function' &&
							// @ts-expect-error: Im safe
							options.required
						)
							requiredProps.push(key);

						return {
							...acc,
							[key]: Array.isArray(options)
								? { oneOf: options.map((opt) => optionToTypeDefinition(key, opt)) }
								: optionToTypeDefinition(key, options),
						};
					},
					{}
			  )
			: undefined;

		return {
			type: option.type,
			properties,
			required: requiredProps.length > 0 ? requiredProps : undefined,
			additionalProperties: option.additionalProperties,
			nullable: option.nullable,
		};
	} else if (option.type === 'any') {
		return { type: '{}' };
	} else if (typeof option.type === 'function') {
		const ref = refs[option.type().name];
		if (!ref)
			throw new Error(
				`Schema ${option.type} has not been evaluated yet, make sure you don't have a circular dependency.`
			);
		return { $ref: ref };
	} else {
		throw new Error(
			`Type ${option.type} is invalid, must be one of 'string', 'number', 'integer', 'boolean', 'array', or a schema constructor.`
		);
	}
};

export const Schema = (options: SchemaOptions = {}) => {
	return (target: new () => {}) => {
		Reflection.defineMetadata('megalo-schema', true as any, target);
		const metadataTarget = new target();
		const props = Object.keys(metadataTarget);

		const schemaProps: Record<string, TypeDefinition> = {};
		const requiredProps: string[] = [];

		refs[target.name] = `#/components/schemas/${target.name}`;
		props.forEach((key) => {
			const isSchemaField = Reflection.getMetadata(
				'megalo-schema-field',
				metadataTarget,
				key
			) as any as boolean;
			if (!isSchemaField) return;

			const options = Reflection.getMetadata('field-options', metadataTarget, key) as any as
				| OpenAPITypes
				| OpenAPITypes[];

			const tsType = Reflection.getMetadata('design:type', metadataTarget, key);
			validateField(options, tsType);

			const typeDef = Array.isArray(options)
				? { oneOf: options.map((opt) => optionToTypeDefinition(key, opt)) }
				: optionToTypeDefinition(key, options);

			if (
				!Array.isArray(options) &&
				options.type !== 'any' &&
				options.type !== 'object' &&
				typeof options.type !== 'function' &&
				// @ts-expect-error: Im safe
				options.required
			)
				requiredProps.push(key);

			schemaProps[key] = typeDef;
		});

		const schemaDefinition = {
			type: 'object',
			required: requiredProps.length > 0 ? requiredProps : undefined,
			properties: schemaProps,
			additionalProperties: options.additionalProperties,
		} as const;

		Reflection.defineMetadata('schema-definition', schemaDefinition, target);

		schemas[target.name] = schemaDefinition;
	};
};

export const getSchemaDefinition = (schema: new () => {}): SchemaDefinition | undefined =>
	Reflection.getMetadata('schema-definition', schema);

export const refOf = (schema: new () => {}): { $ref: string } => {
	if (!Reflection.getMetadata('megalo-schema', schema)) throw new Error('Field type must be a class with @Schema annotation.');
	return { $ref: `#/components/schemas/${schema.name}` };
};
