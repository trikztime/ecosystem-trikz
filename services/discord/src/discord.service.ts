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
import inMemoryAvatarService from "utils/in-memory-avatar-service";

import { formatSeconds } from "./utils/format-seconds";

const logger = new Logger();

@Injectable()
export class DiscordService {
  private encryptionKey: string;
  private client: Client;
  private commands: Collection<string, SlashCommand> | null;
  private channelQueues: Map<string, EventQueue<void>>;

  constructor(
    @Inject(configService.config?.gatewaySocket.serviceToken) private gatewaySocketServiceClient: ClientProxy,
  ) {
    if (!configService.config?.tempDataEncryptionKey) {
      throw new Error("Encryption Key is not set");
    }

    this.encryptionKey = configService.config.tempDataEncryptionKey;

    this.channelQueues = new Map();

    this.client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
    this.client.login(configService.config?.discord.botToken);

    this.client.on("ready", (client) => logger.log(`Logged in as ${client.user.tag}`));
    this.client.on("messageCreate", this.handleMessageCreate.bind(this));
    this.client.on("interactionCreate", this.handleInteractionCreate.bind(this));

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
    const { authId, name, message } = eventData;

    if (!authId) return;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await inMemoryAvatarService.getAvatar(authId);

    // disable pings from webhooks
    const escapedMessage = message.replace("@everyone", "@everyonе").replace("@here", "@herе");
    const username = `[${serverId}] ${name}`;
    await this.sendWebhook(webhookUrl, { username, content: escapedMessage, avatarURL });
  }

  async sendPlayerConnectMessageWebhook(payload: DiscordSendPlayerConnectMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId, name } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await inMemoryAvatarService.getAvatar(authId);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;

    const embed = new EmbedBuilder()
      .setColor("#72ff59")
      .setAuthor({ name: `[${serverId}] ${name} - Connected to server`, iconURL: avatarURL, url: profileURL });

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  async sendPlayerDisconnectMessageWebhook(payload: DiscordSendPlayerDisconnectMessagePayload) {
    const { discordData, eventData } = payload;
    const { url, serverId } = discordData;
    const { authId, name, reason } = eventData;

    const webhookUrl = decryptString(url, this.encryptionKey);
    const avatarURL = await inMemoryAvatarService.getAvatar(authId);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;

    const embed = new EmbedBuilder()
      .setColor("#ff5959")
      .setAuthor({ name: `[${serverId}] ${name} - Disconnected from server`, iconURL: avatarURL, url: profileURL })
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
    const { map, track, style, name1, name2, time, oldWR } = eventData;

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
    } catch (err) {
      //
    }
  }

  private handleMessageCreate(message: Message) {
    if (message.author.bot || message.webhookId || message.channel.type === ChannelType.DM) {
      return;
    }

    const { content, author, channelId, member } = message;

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
          name: author.username,
          message: content,
          prefix: "[Discord]",
          nameColor,
        },
      },
    );

    // this.sendGameChatMessageWebhook(
    //   url,
    //   authId,
    //   "Username",
    //   "Heyyyy",
    // );

    // this.sendPlayerConnectMessageWebhook(url, authId, "Username");

    // this.sendPlayerDisconnectMessageWebhook(url, authId, "Username", "Disconnected by user");

    // this.sendMapChangeMessageWebhook(url, "trikz_cyrus");

    // this.sendRecordNotificationWebhook({
    //   mapName: "trikz_cyrus",
    //   playerName1: "Player1",
    //   playerName2: "Player2",
    //   serverId: "Main",
    //   oldWR: 145.1234535235,
    //   time: 130.235235235235,
    //   track: 1,
    //   style: 0,
    //   url,
    // });

    // this.sendAnticheatNotificationWebhook({
    //   authId,
    //   mapName: "trikz_cyrus",
    //   message: "message",
    //   playerName: "playername",
    //   serverId: "Main",
    //   style: 0,
    //   track: 0,
    //   url,
    // });
  }

  private async handleInteractionCreate(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands?.get(interaction.commandName);

    // const { channelId } = interaction;

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
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandExport = await import(filePath);

      const data = commandExport.data as SlashCommandBuilder | null;
      const execute = commandExport.execute as SlashCommandExecute | null;

      if (!data || !execute) return;

      const command: SlashCommand = {
        data,
        execute,
      };

      this.commands?.set(command.data.name, command);
    }

    const token = configService.config?.discord.botToken;
    const appId = configService.config?.discord.botApplicationId;
    const guildId = configService.config?.discord.guildId;

    if (token && appId && guildId && this.commands) {
      deployCommands(token, appId, guildId, this.commands);
    }
  }
}
