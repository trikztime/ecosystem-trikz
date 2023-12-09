import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  ChatMessageSourceCodes,
  DiscordSendAnticheatNotificationPayload,
  DiscordSendExecutedRconCommandPayload,
  DiscordSendGameChatMessagePayload,
  DiscordSendMapChangeMessagePayload,
  DiscordSendPlayerConnectMessagePayload,
  DiscordSendPlayerDisconnectMessagePayload,
  DiscordSendRecordNotificationPayload,
  GATEWAY_SOCKET_BROADCAST_DISCORD_CHAT_MESSAGE_EVENT_CMD,
  GatewaySocketBroadcastChatMessageEventPayload,
  StyleCodeNames,
  TrackCodeNames,
  TrackCodes,
  TrackNames,
} from "@trikztime/ecosystem-shared/const";
import { decryptString, EventQueue } from "@trikztime/ecosystem-shared/utils";
import { AvatarService } from "avatar.service";
import {
  ChannelType,
  Client,
  Collection,
  EmbedBuilder,
  Interaction,
  Message,
  MessagePayload,
  SlashCommandBuilder,
  WebhookClient,
  WebhookMessageCreateOptions,
} from "discord.js";
import fs from "fs";
import path from "path";
import { SlashCommand, SlashCommandExecute } from "types";
import { deployCommands } from "utils/deploy-commands";

import { formatSeconds } from "./utils/format-seconds";

const logger = new Logger();

@Injectable()
export class DiscordService {
  private encryptionKey: string;
  private client: Client;
  private privateClient: Client;
  private commands: Collection<string, SlashCommand> | null;
  private channelQueues: Map<string, EventQueue<void>>;

  constructor(
    @Inject(configService.config?.gatewaySocket.serviceToken) private gatewaySocketServiceClient: ClientProxy,
    private avatarService: AvatarService,
  ) {
    if (!configService.config?.tempDataEncryptionKey) {
      throw new Error("Encryption Key is not set");
    }

    this.encryptionKey = configService.config.tempDataEncryptionKey;

    this.channelQueues = new Map();

    // основной бот
    this.client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
    this.client.login(configService.config?.discord.botToken);

    this.client.on("ready", (client) => logger.log(`Logged in as ${client.user.tag}`));
    this.client.on("messageCreate", this.handleMessageCreate.bind(this));

    // бот для приватных команд
    this.privateClient = new Client({ intents: ["Guilds", "GuildMessages"] });
    this.privateClient.login(configService.config?.discord.privateBotToken);

    this.privateClient.on("ready", (client) => logger.log(`Logged in as ${client.user.tag}`));
    this.privateClient.on("interactionCreate", this.handleInteractionCreate.bind(this));

    this.commands = new Collection<string, SlashCommand>();
    this.registerCommands();
  }

  addChannelTaskToQueue(channelId: string, task: () => Promise<void>) {
    const queue = this.channelQueues.get(channelId) ?? new EventQueue();
    queue.addEvent(task, () => null);

    const hasQueue = Boolean(this.channelQueues.get(channelId));

    if (!hasQueue) {
      this.channelQueues.set(channelId, queue);
    }
  }

  async sendGameChatMessageWebhook(payload: DiscordSendGameChatMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId3, name, message } = eventData;

    if (!authId3) return;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await this.avatarService.getAvatar(authId3);

    // disable pings from webhooks
    const escapedMessage = message.replace("@everyone", "@everyonе").replace("@here", "@herе");
    const username = `[${serverId}] ${name}`;
    await this.sendWebhook(webhookUrl, { username, content: escapedMessage, avatarURL });
  }

  async sendPlayerConnectMessageWebhook(payload: DiscordSendPlayerConnectMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId, authId3, name } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await this.avatarService.getAvatar(authId3);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;
    const iconURL = avatarURL.length > 0 ? avatarURL : undefined;

    const embed = new EmbedBuilder().setColor("#72ff59").setAuthor({
      name: `[${serverId}] ${name} - Connected to server`,
      iconURL,
      url: profileURL,
    });

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  async sendPlayerDisconnectMessageWebhook(payload: DiscordSendPlayerDisconnectMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId, authId3, name, reason } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await this.avatarService.getAvatar(authId3);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;
    const iconURL = avatarURL.length > 0 ? avatarURL : undefined;

    const embed = new EmbedBuilder()
      .setColor("#ff5959")
      .setAuthor({ name: `[${serverId}] ${name} - Disconnected from server`, iconURL, url: profileURL })
      .setDescription(reason);

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  async sendMapChangeMessageWebhook(payload: DiscordSendMapChangeMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { name } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const embed = new EmbedBuilder().setColor("#59ffee").setDescription(`[${serverId}] Map changed to **${name}**`);

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  async sendRecordNotificationWebhook(payload: DiscordSendRecordNotificationPayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { position, map, track, style, name1, name2, time, oldWR } = eventData;

    if (position !== 1) return;

    const webhookUrl = decryptString(url, this.encryptionKey);

    const players = track === TrackCodes.solobonus ? name1 : `${name1} & ${name2}`;
    const escapedPlayers = players.replace("\n", "");

    const formattedTime = formatSeconds(time);
    const formattedDifference = oldWR === 0.0 ? "N/A" : formatSeconds(time - oldWR);

    const trimmedTime = formattedTime.slice(0, formattedTime.lastIndexOf(".") + 4);
    const trimmedDifference = formattedDifference.slice(0, formattedDifference.lastIndexOf(".") + 4);

    const trackPart = track === TrackCodes.solobonus ? ` <${TrackNames.solobonus}>` : "";
    const styleName = StyleCodeNames[style] ?? "Unknown";

    const message =
      "```\n" +
      `# Style: ${styleName}\n` +
      `# Server: ${serverId}\n` +
      `[${escapedPlayers}] finished${trackPart} <${map}> with time [${trimmedTime} (${trimmedDifference})]\n` +
      "```";

    await this.sendWebhook(webhookUrl, message);
  }

  async sendAnticheatNotificationWebhook(payload: DiscordSendAnticheatNotificationPayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId, name, map, track, message } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);

    const trackName = TrackCodeNames[track] ?? "Unknown";

    const steamPrifile = `<https://steamcommunity.com/profiles/${authId}/>`;

    const logMessage = `[${name}](${steamPrifile}) - ${message} @ Server: ${serverId} | ${map} | Track: ${trackName}`;

    await this.sendWebhook(webhookUrl, logMessage);
  }

  async sendExecutedRconCommandWebhook(payload: DiscordSendExecutedRconCommandPayload) {
    const { discordData, eventData } = payload;
    const { url } = discordData;
    const { request, response } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const message = `> ${request}\n${response}`;
    await this.sendWebhook(webhookUrl, message);
  }

  private async sendWebhook(url: string, options: string | MessagePayload | WebhookMessageCreateOptions) {
    try {
      const webhookClient = new WebhookClient({ url });
      await webhookClient.send(options);
    } catch (error) {
      logger.error("sendWebhook failed: ", error);
    }
  }

  private handleMessageCreate(message: Message) {
    if (message.author.bot || message.webhookId || message.channel.type === ChannelType.DM) {
      return;
    }

    const { content, author, channelId, member } = message;

    // использовать имя на сервера
    // если не настроено (null) использовать глобальное имя профиля
    // иначе использовать имя пользователя
    const name = member?.nickname ?? member?.user.globalName ?? author.username;
    const authorHighestRole = member?.roles.highest;
    const roleColor = authorHighestRole?.hexColor.toString().slice(1);
    const nameColor = authorHighestRole?.name === "@everyone" ? "ababab" : roleColor;

    this.gatewaySocketServiceClient.emit<void, GatewaySocketBroadcastChatMessageEventPayload>(
      GATEWAY_SOCKET_BROADCAST_DISCORD_CHAT_MESSAGE_EVENT_CMD,
      {
        discordData: {
          channelId,
        },
        eventData: {
          source: ChatMessageSourceCodes.discord,
          name,
          message: content,
          prefix: "Discord",
          nameColor,
        },
      },
    );
  }

  private async handleInteractionCreate(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands?.get(interaction.commandName);

    if (!command) {
      interaction.reply(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command?.execute(interaction, { gatewaySocketServiceClient: this.gatewaySocketServiceClient });
    } catch (error) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
      }
    }
  }

  private async registerCommands() {
    const privateCommands = await this.readCommandFiles("private-commands");

    privateCommands.forEach((command) => {
      this.commands?.set(command.data.name, command);
    });
    await this.deployPrivateCommands(privateCommands);
  }

  private async readCommandFiles(dirName: string) {
    const commandsPath = path.join(__dirname, dirName);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    const registeredCommands: SlashCommand[] = [];

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandExport = await import(filePath);

      const data = commandExport.data as SlashCommandBuilder | null;
      const execute = commandExport.execute as SlashCommandExecute | null;

      if (!data || !execute) continue;

      const command: SlashCommand = {
        data,
        execute,
      };

      registeredCommands.push(command);
    }

    return registeredCommands;
  }

  private async deployPrivateCommands(commands: SlashCommand[]) {
    const token = configService.config?.discord.privateBotToken;
    const appId = configService.config?.discord.privateBotApplicationId;
    const guildId = configService.config?.discord.guildId;

    if (token && appId && guildId) {
      deployCommands(token, appId, guildId, commands, "private");
    }
  }
}
