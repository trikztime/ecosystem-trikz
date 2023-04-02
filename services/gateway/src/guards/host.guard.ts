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

    console.log("ips", configService.config?.authorizedIps, "hostname:", request.hostname);

    if (isAuthorized) {
      return true;
    }

    throw new ForbiddenException("Request forbidden");
  }
}
