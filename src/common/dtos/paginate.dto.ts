import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class PaginatedDto<TData> {
  success: boolean;
  data: TData;
  meta: IPaginationMeta;

  constructor(success: boolean, data: TData, meta: IPaginationMeta) {
    this.success = success;
    this.data = data;
    this.meta = meta;
  }
}
