export type DatabaseConfig = {
  databaseUrl: string;
};

export type CommonMicroserviceConfig = {
  microserviceToken: string;
  microserviceHost?: string;
  microservicePort: number;
};

export interface IEcosystemConfig {
  api: CommonMicroserviceConfig & DatabaseConfig;
  skillrank: CommonMicroserviceConfig & DatabaseConfig;
}
