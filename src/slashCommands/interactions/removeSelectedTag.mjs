export default {
	name: "removeSelectedTag",
	logic: async(interaction, sharder) => {
		const messageID = interaction.data.customID.split("_")[1]

		const vidMessage = await sharder.rest.channels.getMessage(interaction.message.messageReference.channelID, messageID)

		const splitMessageContent = vidMessage.content.split("\n")
		if (!splitMessageContent[1].includes("Tags")) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
                content: "No tags to remove"
			}
		}).catch(()=>{});

		const splitTags = splitMessageContent[1].split(" ")
		const tagIndex = splitTags.findIndex((item)=>item===`<@&${interaction.data.values.raw[0]}>`)
		if (tagIndex === -1) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
                content: "tag not present"
			}
		}).catch(()=>{});

		splitTags.splice(tagIndex, 1)
		splitMessageContent[1]=splitTags.join(" ")

		if (splitMessageContent[1] === "# Tags:") splitMessageContent.splice(1, 1);

		sharder.rest.channels.editMessage(interaction.message.messageReference.channelID, messageID, {
			flags: 64,
			content: asdfsdfsadf.join("\n")
		})

		sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
                content: "Tag removed"
			}
		}).catch(()=>{});
	}
};