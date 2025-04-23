import urlExtract from '../../utils/urlExtract.mjs'

import postToDiscord from "../../utils/post.mjs"
import parseYtUrl from '../../utils/parseYtUrl.mjs'

const allowedYtDomains = ["youtu.be", "www.youtube.com", "youtube.com", "m.youtube.com"]

export default {
    name: "add",
    commandLogic: async (interaction, client) => {
        const urlObject = urlExtract(interaction.data.options.raw[0].value)

        if (!allowedYtDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                type: 4,
                data: {
                    flags: 64,
                    content: `URL is not a youtube domain`
                }
            }).catch(() => {});

        const {vid, t} = parseYtUrl(urlObject)
        
        if (vid === '') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
            type: 4,
            data: {
                flags: 64,
                content: `Unable to parse video id`
            }
        }).catch(() => {});

        postToDiscord(interaction.channelID, client, vid, t)

        client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
            type: 4,
            data: {
                flags: 64,
                content: `added`
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