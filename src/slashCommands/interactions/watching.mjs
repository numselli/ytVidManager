export default {
	name: "watching",
	logic: (interaction, client) => {
		const args = interaction.data.customID.split("_")

		if (args.length === 2 && args[1] !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "You are not allowed to remove this video. You must be the person who added the video to the list."
			}
		}).catch(() => {});

		interaction.createModal({
			components: [
				{
					type: 1,
					components: [
						{
							label: "TimeStamp",
							style:1,
							type: 4,
							customID: "sdaf"
						}
					]
				}
			],
			customID: "setTimeStamp",
			title: "Enter a time stamp in HH:MM:SS format"
		})
	}
};
