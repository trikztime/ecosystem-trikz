import { IEcosystemConfig, ServerConfig } from "./types";

const serverConfigPrefix = "SERVER_CONF";

class ConfigService {
  private _initialized = false;
  private _config: IEcosystemConfig | null = null;

  initialize() {
    if (this._initialized) return;

    this._config = this.parseEnvironment();

    this._initialized = true;
  }

  get config(): IEcosystemConfig | null {
    return this._config;
  }

  private parseEnvironment(): IEcosystemConfig {
    const env = process.env;
    const envKeys = Object.keys(env);

    const serverEnvs = envKeys.filter((key) => key.includes(serverConfigPrefix));
    const uniqueServerIndexes = new Set<number>();
    serverEnvs.forEach((env) => {
      // формат записи: SERVER_CONF_1_ID="main"
      const numberRegExp = new RegExp("[0-9]");
      const match = numberRegExp.exec(env);
      if (match) {
        const serverIndex = match[0];
        uniqueServerIndexes.add(Number(serverIndex));
      }
    });

    return {
      api: {
        databaseUrl: env.API_DATABASE_URL ?? "",
        serviceToken: env.API_SERVICE_TOKEN ?? "",
        servicePort: Number(env.API_SERVICE_PORT),
        serviceHost: env.API_SERVICE_HOST,
      },
      skillrank: {
        databaseUrl: env.SKILLRANK_DATABASE_URL ?? "",
        serviceToken: env.SKILLRANK_SERVICE_TOKEN ?? "",
        servicePort: Number(env.SKILLRANK_SERVICE_PORT),
        serviceHost: env.SKILLRANK_SERVICE_HOST,
      },
      servers: Array.from(uniqueServerIndexes.values()).map((serverIndex): ServerConfig => {
        return {
          id: env[`${serverConfigPrefix}_${serverIndex}_ID`] ?? "",
        };
      }),
    };
  }
}

export const configService = new ConfigService();
// инициализация при использовании модуля
configService.initialize();
