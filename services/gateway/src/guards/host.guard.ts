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
    const requestIp = request.ip.replace("::ffff:", "");
    const isAuthorized = authorizedHosts.length > 0 && authorizedHosts.includes(requestIp);

    console.log("ips", configService.config?.authorizedIps);
    console.log("ip", requestIp);
    console.log("hostname", request.hostname);
    console.log("host", request.headers.host);

    if (isAuthorized) {
      return true;
    }

    throw new ForbiddenException("Request forbidden");
  }
}
