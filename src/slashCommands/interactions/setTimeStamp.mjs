export default {
	name: "setTimeStamp",
	logic: async(interaction, sharder) => {
		const seconds = interaction.data.components[0].components[0].value.split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60, i), 0)-5
		
		if (interaction.message.components[0].components[0].url.includes("&t=")) interaction.message.components[0].components[0].url = `${interaction.message.components[0].components[0].url.split("&t=")[0]}&t=${seconds}`
		else interaction.message.components[0].components[0].url += `&t=${seconds}`

		sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "Timestamp updated"
			}
		}).catch(() => {});

		sharder.rest.channels.editMessage(interaction.channelID, interaction.message.id, {
			components: interaction.message.components
		})
	}
};
