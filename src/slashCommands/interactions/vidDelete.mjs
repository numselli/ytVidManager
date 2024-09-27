export default {
	name: "vidDelete",
	logic: (interaction, sharder) => {
		sharder.rest.channels.deleteMessage(interaction.channelID, interaction.message.id).catch(() => {});

		sharder.db.prepare('DELETE FROM videos WHERE messageid = @messageid').run({
			messageid: interaction.message.id
		})

		sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "Removed video"
			}
		}).catch(() => {});
	}
};
