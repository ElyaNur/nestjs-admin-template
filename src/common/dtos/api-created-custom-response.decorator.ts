import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseSchema } from '../schemas/response.schema';

export const ApiCreatedCustomResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseSchema, model),
    ApiCreatedResponse({
      description: 'Create success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSchema) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  );
};
