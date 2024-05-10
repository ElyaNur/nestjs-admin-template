import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseExceptionSchema } from '../schemas/response.schema';

export const ApiBadRequestCustom = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseExceptionSchema, model),
    ApiBadRequestResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseExceptionSchema) },
          {
            properties: {
              message: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
