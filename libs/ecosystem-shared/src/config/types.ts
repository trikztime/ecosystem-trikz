export type ServerConfig = {
  id: string;
  discordChatChannelId?: string;
  discordChatWebhookUrl?: string;
};

export type CommonMicroserviceConfig = {
  serviceToken: string;
  serviceHost?: string;
  servicePort: number;
};

export type DatabaseServiceConfig = {
  databaseUrl: string;
};

export type DiscordServiceConfig = {
  botToken: string;
};

export interface IEcosystemConfig {
  steamApiKey: string;
  gateway: CommonMicroserviceConfig;
  api: CommonMicroserviceConfig & DatabaseServiceConfig;
  skillrank: CommonMicroserviceConfig & DatabaseServiceConfig;
  discord: CommonMicroserviceConfig & DiscordServiceConfig;
  servers: ServerConfig[];
}
