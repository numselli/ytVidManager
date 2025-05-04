import genPostMessage from '../../utils/genPostMessage.mjs'

export default {
	name: "setTimeStamp",
	logic: async(interaction, client) => {
		const seconds = interaction.data.components.raw[0].components[0].value.split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60, i), 0)-5
		
		const videoFromDB = client.db.prepare('SELECT * FROM videos WHERE messageid = @messageid').all({
			messageid: interaction.message.id
		})
		
		const discordMessage = genPostMessage(videoFromDB[0].videoid, seconds)

		client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
			type: 4,
			data: {
				flags: 64,
				content: "Timestamp updated"
			}
		}).catch(() => {});

		client.rest.channels.editMessage(interaction.channelID, interaction.message.id, discordMessage)
	}
};
