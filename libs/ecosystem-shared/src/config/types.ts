export type ServerConfig = {
  id: string;
  discordChatChannelId?: string;
  discordChatWebhookUrl?: string;
  discordAnticheatChannelId?: string;
  discordAnticheatWebhookUrl?: string;
  discordRecordsChannelId?: string;
  discordRecordsWebhookUrl?: string;
  discordRconChannelId?: string;
  discordRconWebhookUrl?: string;
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
  botApplicationId: string;
  botToken: string;
  guildId: string;
  rconRoleId?: string;
};

export interface IEcosystemConfig {
  tempDataEncryptionKey?: string;
  steamApiKey: string;
  gatewaySocket: CommonMicroserviceConfig;
  api: CommonMicroserviceConfig & DatabaseServiceConfig;
  skillrank: CommonMicroserviceConfig & DatabaseServiceConfig;
  discord: CommonMicroserviceConfig & DiscordServiceConfig;
  servers: ServerConfig[];
}
