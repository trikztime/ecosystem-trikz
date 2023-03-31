import { ClientProxy } from "@nestjs/microservices";
import { Interaction, SlashCommandBuilder } from "discord.js";

export type SlashCommandUtils = {
  gatewaySocketServiceClient: ClientProxy;
};

export type SlashCommandExecute = (interaction: Interaction, utils?: SlashCommandUtils) => Promise<void>;

export type SlashCommand = {
  data: SlashCommandBuilder;
  execute: SlashCommandExecute;
};
