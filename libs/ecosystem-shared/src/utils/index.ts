import { ICommonResponse, ResponseResult } from "../types";

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export const createResponse = <T>(result: ResponseResult, data: T): ICommonResponse<T> => {
  return {
    result,
    data,
  };
};
