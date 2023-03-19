import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException } from "@nestjs/common";
import { IErrorResponse } from "@trikztime/ecosystem-shared/types";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const baseException = new InternalServerErrorException();

    const status = exception instanceof HttpException ? exception.getStatus() : baseException.getStatus();
    const message = exception instanceof HttpException ? exception.message : baseException.message;
    const name = exception instanceof HttpException ? exception.name : baseException.name;

    const errorResponse: IErrorResponse = {
      result: "error",
      data: {
        statusCode: status,
        message,
        name,
      },
    };

    response.status(status).json(errorResponse);
  }
}
