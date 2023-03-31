import { configService } from "@trikztime/ecosystem-shared/config";
import {
  GATEWAY_SOCKET_EXECUTE_RCON_COMMAND_EVENT_CMD,
  GatewaySocketExecuteRconCommandEventPayload,
} from "@trikztime/ecosystem-shared/const";
import { GuildMemberRoleManager, SlashCommandBuilder } from "discord.js";
import { SlashCommandExecute } from "types";

export const data = new SlashCommandBuilder()
  .setName("rcon")
  .addStringOption((option) => option.setName("command").setDescription("command to execute").setRequired(true))
  .setDescription("Executes console command on connected server");

export const execute: SlashCommandExecute = async (interaction, utils) => {
  if (!interaction.isChatInputCommand()) return;

  const socketService = utils?.gatewaySocketServiceClient;

  const { channelId, options, member } = interaction;

  const command = options.getString("command");
  const rconRoleId = configService.config?.discord.rconRoleId;
  const userRoles = member?.roles;
  const hasRconRole =
    userRoles instanceof GuildMemberRoleManager && rconRoleId ? userRoles.cache.has(rconRoleId) : false;

  if (!hasRconRole) {
    await interaction.reply("You dont have permission to use this command");
    return;
  }

  if (!socketService || !command) {
    await interaction.reply("Missing required command properties");
    return;
  }

  await interaction.reply("Waiting for server response...");

  socketService.emit<void, GatewaySocketExecuteRconCommandEventPayload>(GATEWAY_SOCKET_EXECUTE_RCON_COMMAND_EVENT_CMD, {
    discordData: {
      channelId,
    },
    eventData: {
      channelId,
      request: command,
    },
  });
};
