export default {
	name: "addSelectedTag",
	logic: async(interaction, sharder) => {
		const messageID = interaction.data.customID.split("_")[1]

		const vidMessage = await sharder.rest.channels.getMessage(interaction.message.messageReference.channelID, messageID)

		const splitMessageContent = vidMessage.content.split("\n")

		if (splitMessageContent[1].includes("Tags")){
			splitMessageContent[1]+=` <@&${interaction.data.values.raw[0]}>`
		} else {
			splitMessageContent.splice(1, 0, `# Tags: <@&${interaction.data.values.raw[0]}>`);
		}

		sharder.rest.channels.editMessage(interaction.message.messageReference.channelID, messageID, {
			flags: 64,
			content: splitMessageContent.join("\n")
		})

		sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
                content: "Tag added"
			}
		}).catch(()=>{});
	}
};