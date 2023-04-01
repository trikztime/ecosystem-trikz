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
      authorizedIps: env.AUTHORIZED_IPS?.split(";") ?? [],
      // нужна строка размером 32 символа
      tempDataEncryptionKey: env.TEMP_DATA_ENCRYPTION_KEY,
      steamApiKey: env.STEAM_API_KEY ?? "",
      gatewaySocket: {
        serviceToken: env.GATEWAY_SOCKET_SERVICE_TOKEN ?? "",
        servicePort: Number(env.GATEWAY_SOCKET_SERVICE_PORT),
        serviceHost: env.GATEWAY_SOCKET_SERVICE_HOST,
      },
      api: {
        serviceToken: env.API_SERVICE_TOKEN ?? "",
        servicePort: Number(env.API_SERVICE_PORT),
        serviceHost: env.API_SERVICE_HOST,
        databaseUrl: env.API_DATABASE_URL ?? "",
      },
      skillrank: {
        serviceToken: env.SKILLRANK_SERVICE_TOKEN ?? "",
        servicePort: Number(env.SKILLRANK_SERVICE_PORT),
        serviceHost: env.SKILLRANK_SERVICE_HOST,
        databaseUrl: env.SKILLRANK_DATABASE_URL ?? "",
      },
      discord: {
        serviceToken: env.DISCORD_SERVICE_TOKEN ?? "",
        servicePort: Number(env.DISCORD_SERVICE_PORT),
        serviceHost: env.DISCORD_SERVICE_HOST,
        botApplicationId: env.DISCORD_SERVICE_BOT_APPLICATION_ID ?? "",
        botToken: env.DISCORD_SERVICE_BOT_TOKEN ?? "",
        privateBotApplicationId: env.DISCORD_SERVICE_PRIVATE_BOT_APPLICATION_ID ?? "",
        privateBotToken: env.DISCORD_SERVICE_PRIVATE_BOT_TOKEN ?? "",
        guildId: env.DISCORD_SERVICE_GUILD_ID ?? "",
        rconRoleId: env.DISCORD_SERVICE_RCON_ROLE_ID,
      },
      servers: Array.from(uniqueServerIndexes.values()).map((serverIndex): ServerConfig => {
        return {
          id: env[`${serverConfigPrefix}_${serverIndex}_ID`] ?? "",
          discordChatChannelId: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_CHAT_CHANNEL_ID`],
          discordChatWebhookUrl: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_CHAT_WEBHOOK_URL`],
          discordAnticheatChannelId: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_ANTICHEAT_CHANNEL_ID`],
          discordAnticheatWebhookUrl: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_ANTICHEAT_WEBHOOK_URL`],
          discordRecordsChannelId: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_RECORDS_CHANNEL_ID`],
          discordRecordsWebhookUrl: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_RECORDS_WEBHOOK_URL`],
          discordRconChannelId: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_RCON_CHANNEL_ID`],
          discordRconWebhookUrl: env[`${serverConfigPrefix}_${serverIndex}_DISCORD_RCON_WEBHOOK_URL`],
        };
      }),
    };
  }
}

export const configService = new ConfigService();
// инициализация при использовании модуля
configService.initialize();
