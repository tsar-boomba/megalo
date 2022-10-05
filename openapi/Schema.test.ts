import { Field } from './Field.ts';
import { getSchemaDefinition, Schema } from './Schema.ts';
import { assertEquals } from 'https://deno.land/std@0.158.0/testing/asserts.ts';

Deno.test('String Field', () => {
	@Schema()
	class StringTest {
		@Field({ type: 'string', format: 'email', pattern: '^/url$' })
		str!: string;
	}

	const schemaDef = getSchemaDefinition(StringTest);

	assertEquals(schemaDef, {
		type: 'object',
		properties: {
			str: {
				type: 'string',
				format: 'email',
				pattern: '^/url$',
				enum: undefined,
				maxLength: undefined,
				minLength: undefined,
				nullable: undefined,
				readOnly: undefined,
				writeOnly: undefined,
				deprecated: undefined,
				description: undefined,
				example: undefined,
				externalDocs: undefined,
			},
		},
		additionalProperties: undefined,
		required: ['str'],
	});
});
