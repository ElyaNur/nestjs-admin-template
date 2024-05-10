import { ApiProperty } from '@nestjs/swagger';

export class ResponseExceptionSchema<TMessage> {
  @ApiProperty({ example: false })
  success: boolean;

  message: TMessage[];
}

export class ResponseSchema<TData> {
  @ApiProperty()
  success: boolean;

  data: TData;
}

export class UnauthorizedSchema {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;
}

export class NotFoundSchema {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Not Found' })
  message: string;
}

export class BadRequestSchema {
  @ApiProperty()
  item: string;

  @ApiProperty()
  property: string;

  @ApiProperty()
  value: string;
}

export class PaginateMeta {
  @ApiProperty({ example: 1 })
  totalItems: number;

  @ApiProperty({ example: 1 })
  itemCount: number;

  @ApiProperty({ example: 10 })
  itemsPerPage: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  currentPage: number;
}

export class PaginatedDto<TData> {
  @ApiProperty({ example: true })
  success: boolean;

  data: TData[];

  @ApiProperty()
  meta: PaginateMeta;
}

export class PageDTO {
  @ApiProperty({ default: 1 })
  page: number;
}

export class LimitDTO {
  @ApiProperty({ default: 10 })
  limit: number;
}
