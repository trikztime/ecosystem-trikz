import { IServiceConfig } from "./../types";

enum ServiceConfigKeys {
  API = "api",
  SKILLRANK = "skillrank",
}

export const serviceConfig: Record<ServiceConfigKeys, IServiceConfig> = {
  api: {
    token: "api",
    port: 3010,
  },
  skillrank: {
    token: "skillrank",
    port: 3011,
  },
} as const;
