import { Injectable, Logger } from "@nestjs/common";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  DiscordSendAnticheatNotificationPayload,
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

  async sendGameChatMessageWebhook(url: string, playerAuthId: string, name: string, message: string) {
    const avatarURL = await inMemoryAvatarService.getAvatar(playerAuthId);

    // disable pings from webhooks
    const escapedMessage = message.replace("@everyone", "@everyonе").replace("@here", "@herе");
    await this.sendWebhook(url, { username: name, content: escapedMessage, avatarURL });
  }

  async sendPlayerConnectMessageWebhook(url: string, playerAuthId: string, name: string) {
    const avatarURL = await inMemoryAvatarService.getAvatar(playerAuthId);
    const profileURL = `https://steamcommunity.com/profiles/${playerAuthId}`;

    const embed = new EmbedBuilder()
      .setColor("#72ff59")
      .setAuthor({ name: `${name} - Connected to server`, iconURL: avatarURL, url: profileURL });

    await this.sendWebhook(url, { embeds: [embed] });
  }

  async sendPlayerDisconnectMessageWebhook(url: string, playerAuthId: string, name: string, reason: string) {
    const avatarURL = await inMemoryAvatarService.getAvatar(playerAuthId);
    const profileURL = `https://steamcommunity.com/profiles/${playerAuthId}`;

    const embed = new EmbedBuilder()
      .setColor("#ff5959")
      .setAuthor({ name: `${name} - Connected to server`, iconURL: avatarURL, url: profileURL })
      .setDescription(reason);

    await this.sendWebhook(url, { embeds: [embed] });
  }

  async sendMapChangeMessageWebhook(url: string, mapName: string) {
    const embed = new EmbedBuilder().setColor("#59ffee").setDescription(`Map changed to **${mapName}**`);

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

    const logMessage = `[${playerName}](${steamPrifile}) - ${message} (Map: ${mapName} | Track: ${trackName} | Style: ${styleName}) @ ${serverId}`;

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
