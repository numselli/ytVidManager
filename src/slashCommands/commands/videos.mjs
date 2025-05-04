import urlExtract from '../../utils/urlExtract.mjs'
import parseYtUrl from '../../utils/parseYtUrl.mjs'
import genYtUrl from '../../utils/genYtUrl.mjs'
import postToDiscord from "../../utils/post.mjs"

const allowedYtDomains = ["youtu.be", "www.youtube.com", "youtube.com", "m.youtube.com"]

export default {
    name: "videos",
    commandLogic: async (interaction, client) => {
        switch (interaction.data.options.raw[0].name){
            case "add":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value)

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
        
                postToDiscord(interaction.channelID, client, {vid, t, userID:interaction.user.id})
        
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `added`
                    }
                }).catch(() => {});
            }
            break;
            case "remove":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value)
                if (!allowedYtDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a youtube domain`
                    }
                }).catch(() => {});
        
                const {vid} = parseYtUrl(urlObject)
                if (vid === '') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `Unable to parse video id`
                    }
                }).catch(() => {});

                const vidList = client.db.prepare('SELECT owner, messageid from videos WHERE disocrdchannel = @disocrdchannel AND videoid = @videoid').all({
                    disocrdchannel: interaction.channelID,
                    videoid: vid
                })
                if (vidList.length === 0) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "Video not on the watch list."
                    }
                }).catch(() => {});

                if (vidList[0].owner !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "You are not allowed to remove this video. You must be the person who added the video to the list."
                    }
                }).catch(() => {});


                client.db.prepare('DELETE FROM videos WHERE messageid = @messageid').run({
                    messageid: vidList[0].messageid
                })
        
                client.rest.channels.deleteMessage(interaction.channelID, vidList[0].messageid).catch(() => {});

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `Removed video`
    
                    }
                }).catch(() => {});
            }
            break;
            case "list": {
                const vidList = client.db.prepare('SELECT * from videos WHERE disocrdchannel = @disocrdchannel').all({
                    disocrdchannel: interaction.channelID
                })

                const messageContent = `# (${vidList.length}) Youtube videos:\n` + vidList.map(video=>`- [name](<${genYtUrl(video.videoid, video.position)}>)`).join('\n')
                const messageParts = messageContent.match(/[\s\S]{1,2000}$/gm);

                if (messageParts.length === 1) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: messageContent
                    }
                }).catch(() => {});

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: messageParts[0]
                    }
                }).catch(() => {});

                parts.forEach((element, index) => {
                    if (index === 0) return;
                    client.rest.channels.createMessage(interaction.channelID, {
                        content: element
                    })
                });
            }
            break;
        }
    },
    description: "Veiw and edit videos on watch list",
    options: [
        {
            "name": "add",
            "description": "Adds a video to the list",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt video to add",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "remove",
            "description": "removes a youtube video",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt video to remove",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "list",
            "description": "Lists the videos on watch list",
            "type": 1
        }
    ]
}