import interactionsList from "../slashCommands/interactionsList.mjs";

const { channelID } = await import(
	process.env.NODE_ENV === "production" ? "/static/settings.mjs" : "../static/settings.mjs"
);

export default async (client, interaction) => {
	if (channelID !== interaction.channelID) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
		type: 4,
		data: {
			flags: 64,
			content: "Bot is in private beta"
		}
	}).catch(() => {});

	if (interaction.type === 3 || interaction.type === 5) return interactionsList.get(interaction.data.customID.split("_")[0]).logic(interaction, client);

	client.commands.get(interaction.data.name).commandFile.commandLogic(interaction, client);
};
