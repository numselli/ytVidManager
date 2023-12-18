export default {
	name: "tagAdd",
	logic: (interaction, sharder) => {
		sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				components: [
					{
						type: 1,
						components: [
							{
								label: "add a tag",
								type: 6,
								customID: `addSelectedTag_${interaction.data.customID.split("_")[1]}`
							}
						]
					}
				]
			}
		})
		.catch(()=>{});
	}
};