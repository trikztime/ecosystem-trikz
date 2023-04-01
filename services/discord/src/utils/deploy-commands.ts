/* eslint-disable no-console */
import { REST, Routes } from "discord.js";
import { SlashCommand } from "types";

export const deployCommands = async (
  token: string,
  clientId: string,
  guildId: string,
  commands: SlashCommand[],
  scope: string,
) => {
  const rest = new REST({ version: "10" }).setToken(token);
  const commandsPayload = commands.map((command) => command.data.toJSON());

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsPayload })) as any;
    console.log(`Successfully reloaded ${data.length} ${scope} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
};
