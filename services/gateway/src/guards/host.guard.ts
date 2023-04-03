import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { configService } from "@trikztime/ecosystem-shared/config";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class HostGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const authorizedHosts = configService.config?.authorizedIps ?? [];
    const isAuthorized = authorizedHosts.length > 0 && authorizedHosts.includes(request.hostname);

    console.log("ips", configService.config?.authorizedIps);
    console.log("ip", request.ip);
    console.log("hostname", request.hostname);
    console.log("host", request.headers.host);
    console.log("x-real-ip", request.headers["x-real-ip"]);
    console.log("x-forwarded-for", request.headers["x-forwarded-for"]);
    console.log("test", request.headers.test);

    if (isAuthorized) {
      return true;
    }

    throw new ForbiddenException("Request forbidden");
  }
}
