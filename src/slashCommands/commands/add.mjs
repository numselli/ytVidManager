import { postToDiscord } from "../../utils/utils.mjs"

export default {
    name: "add",
    commandLogic: async (interaction, client) => {
        if (!interaction.data.options.raw[0].value.includes("v=")) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
            type: 4,
            data: {
                flags: 64,
                content: `Video does not have a video id.`
            }
        }).catch(() => {});

        const vidID = interaction.data.options.raw[0].value.split("v=")[1].split("&")[0]
        
        postToDiscord(interaction.channelID, client, {
            author: "",
            videoID: vidID
        })

        client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
            type: 4,
            data: {
                flags: 64,
                content: `added: https://youtube.com/watch?v=${vidID}`
            }
        }).catch(() => {});
    },
    description: "Add a video to the list",
    options: [
        {
            "name": "id",
            "description": "The yt video you want add.",
            "type": 3,
            "required": true
        }
    ]
}