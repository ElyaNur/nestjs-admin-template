export class ResponseDto<TData> {
  success: boolean;
  data: TData[] | TData;

  constructor(success: boolean, data: TData) {
    this.success = success;
    this.data = data;
  }
}
