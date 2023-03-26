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
  private bot: Client;

  constructor() {
    this.bot = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
    this.bot.login(configService.config?.discord.botToken);

    this.bot.on("ready", (client) => logger.log(`Logged in as ${client.user.tag}`));
    this.bot.on("messageCreate", this.handleMessageCreate.bind(this));
  }

  async sendGameChatMessageWebhook(payload: DiscordSendGameChatMessagePayload) {
    const { url, serverId, authId, name, message } = payload;

    const avatarURL = await inMemoryAvatarService.getAvatar(authId);

    // disable pings from webhooks
    const escapedMessage = message.replace("@everyone", "@everyonе").replace("@here", "@herе");
    const username = `[${serverId}] ${name}`;
    await this.sendWebhook(url, { username, content: escapedMessage, avatarURL });
  }

  async sendPlayerConnectMessageWebhook(payload: DiscordSendPlayerConnectMessagePayload) {
    const { url, serverId, authId, name } = payload;

    const avatarURL = await inMemoryAvatarService.getAvatar(authId);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;

    const embed = new EmbedBuilder()
      .setColor("#72ff59")
      .setAuthor({ name: `[${serverId}] ${name} - Connected to server`, iconURL: avatarURL, url: profileURL });

    await this.sendWebhook(url, { embeds: [embed] });
  }

  async sendPlayerDisconnectMessageWebhook(payload: DiscordSendPlayerDisconnectMessagePayload) {
    const { url, serverId, authId, name, reason } = payload;

    const avatarURL = await inMemoryAvatarService.getAvatar(authId);
    const profileURL = `https://steamcommunity.com/profiles/${authId}`;

    const embed = new EmbedBuilder()
      .setColor("#ff5959")
      .setAuthor({ name: `[${serverId}] ${name} - Connected to server`, iconURL: avatarURL, url: profileURL })
      .setDescription(reason);

    await this.sendWebhook(url, { embeds: [embed] });
  }

  async sendMapChangeMessageWebhook(payload: DiscordSendMapChangeMessagePayload) {
    const { url, serverId, mapName } = payload;

    const embed = new EmbedBuilder().setColor("#59ffee").setDescription(`[${serverId}] Map changed to **${mapName}**`);

    await this.sendWebhook(url, { embeds: [embed] });
  }

  async sendRecordNotificationWebhook(payload: DiscordSendRecordNotificationPayload) {
    const { url, serverId, mapName, track, style, playerName1, playerName2, time, oldWR } = payload;

    const players = track === TrackCodes.solobonus ? playerName1 : `${playerName1} & ${playerName2}`;
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
      `[${escapedPlayers}] finished${trackPart} <${mapName}> with time [${trimmedTime} (${trimmedDifference})]\n` +
      "```";

    await this.sendWebhook(url, message);
  }

  async sendAnticheatNotificationWebhook(payload: DiscordSendAnticheatNotificationPayload) {
    const { authId, playerName, mapName, track, style, url, message, serverId } = payload;

    const trackName = TrackCodeNames[track] ?? "Unknown";
    const styleName = StyleCodeNames[style] ?? "Unknown";

    const steamPrifile = `<https://steamcommunity.com/profiles/${authId}/>`;

    const logMessage = `[${playerName}](${steamPrifile}) - ${message} @ Server: ${serverId} | ${mapName} | Track: ${trackName} | Style: ${styleName}`;

    await this.sendWebhook(url, logMessage);
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
