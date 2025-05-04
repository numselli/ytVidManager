export default {
	name: "vidDelete",
	logic: (interaction, client) => {
		const args = interaction.data.customID.split("_")

		if (args.length === 2 && args[1] !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "You are not allowed to remove this video. You must be the person who added the video to the list."
			}
		}).catch(() => {});

		client.db.prepare('DELETE FROM videos WHERE messageid = @messageid').run({
			messageid: interaction.message.id
		})

		client.rest.channels.deleteMessage(interaction.channelID, interaction.message.id).catch(() => {});

		client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "Removed video"
			}
		}).catch(() => {});
	}
};
