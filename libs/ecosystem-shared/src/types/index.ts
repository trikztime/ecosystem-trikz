export type ResponseResult = "ok" | "error";

export interface ICommonResponse<T> {
  result: ResponseResult;
  data: T;
}

export interface IErrorData {
  statusCode: number;
  message: string;
  name?: string;
}

export interface IErrorResponse extends ICommonResponse<IErrorData> {
  result: "error";
}
