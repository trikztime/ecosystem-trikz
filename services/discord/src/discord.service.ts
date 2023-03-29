import { Injectable, Logger } from "@nestjs/common";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  DiscordSendAnticheatNotificationPayload,
  DiscordSendGameChatMessagePayload,
  DiscordSendMapChangeMessagePayload,
  DiscordSendPlayerConnectMessagePayload,
  DiscordSendPlayerDisconnectMessagePayload,
  DiscordSendRecordNotificationPayload,
  StyleCodeNames,
  TrackCodeNames,
  TrackCodes,
  TrackNames,
} from "@trikztime/ecosystem-shared/const";
import { decryptString, EventQueue } from "@trikztime/ecosystem-shared/utils";
import {
  ChannelType,
  Client,
  EmbedBuilder,
  Message,
  MessagePayload,
  WebhookClient,
  WebhookMessageCreateOptions,
} from "discord.js";
import inMemoryAvatarService from "utils/in-memory-avatar-service";

import { formatSeconds } from "./utils/format-seconds";

const logger = new Logger();

@Injectable()
export class DiscordService {
  private encryptionKey: string;
  private bot: Client;
  private channelQueues: Map<string, EventQueue<void>>;

  constructor() {
    if (!configService.config?.tempDataEncryptionKey) {
      throw new Error("Encryption Key is not set");
    }

    this.encryptionKey = configService.config.tempDataEncryptionKey;

    this.channelQueues = new Map();

    this.bot = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
    this.bot.login(configService.config?.discord.botToken);

    this.bot.on("ready", (client) => logger.log(`Logged in as ${client.user.tag}`));
    this.bot.on("messageCreate", this.handleMessageCreate.bind(this));
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

    const { content, author, channelId } = message;
    console.log("message:", channelId, author.username, content);

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
}
