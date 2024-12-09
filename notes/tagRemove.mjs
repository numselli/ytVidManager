export default {
	name: "tagRemove",
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
								label: "remove a tag",
								type: 6,
								customID: `removeSelectedTag_${interaction.data.customID.split("_")[1]}`
							}
						]
					}
				]
			}
		}).catch(()=>{});
	}
};