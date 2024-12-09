export default {
	name: "manageTags",
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
                                type: 2,
                                label: "Add tags",
                                style: 1,
                                customID: `tagAdd_${interaction.message.id}`,
                            },
                            {
                                type: 2,
                                label: "Remove tags",
                                style: 1,
                                customID: `tagRemove_${interaction.message.id}`,
                            },
						]
					}
				]
			}
		}).catch(()=>{});
	}
};