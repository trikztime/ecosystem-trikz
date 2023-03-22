export type DatabaseConfig = {
  databaseUrl: string;
};

export type CommonMicroserviceConfig = {
  serviceToken: string;
  serviceHost?: string;
  servicePort: number;
};

export type ServerConfig = {
  id: string;
};

export interface IEcosystemConfig {
  api: CommonMicroserviceConfig & DatabaseConfig;
  skillrank: CommonMicroserviceConfig & DatabaseConfig;
  servers: ServerConfig[];
}
