import urlExtract from '../../utils/urlExtract.mjs'
import parseRDUrl from '../../utils/parseRDUrl.mjs'
import postToDiscord from '../../utils/rdtPost.mjs'

const allowedRdditDomains = ["reddit.com", "www.reddit.com"]

export default {
    name: "post",
    commandLogic: async (interaction, client) => {
        switch (interaction.data.options.raw[0].name){
            case "add":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value)

                if (!allowedRdditDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a reddit domain`
                    }
                }).catch(() => {});
        
                const {pid, cid, sub} = parseRDUrl(urlObject)
                if (pid === '' || sub === '') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `Unable to parse post id`
                    }
                }).catch(() => {});
        
                postToDiscord(interaction.channelID, client, {pid, cid, sub, userID:interaction.user.id})
        
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

                if (!allowedRdditDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a reddit domain`
                    }
                }).catch(() => {});

                const {pid, cid, sub} = parseRDUrl(urlObject)
                if (pid === '' || sub === '') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `Unable to parse post id`
                    }
                }).catch(() => {});

                const postList = client.db.prepare('SELECT owner, messageid from rdtposts WHERE disocrdchannel = @disocrdchannel AND pid = @pid').all({
                    disocrdchannel: interaction.channelID,
                    pid: pid
                })
                if (postList.length === 0) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "post not on the reading list."
                    }
                }).catch(() => {});

                if (postList[0].owner !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "You are not allowed to remove this post. You must be the person who added the post to the list."
                    }
                }).catch(() => {});


                client.db.prepare('DELETE FROM rdtposts WHERE messageid = @messageid').run({
                    messageid: postList[0].messageid
                })
        
                client.rest.channels.deleteMessage(interaction.channelID, postList[0].messageid).catch(() => {});

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `Removed video`
                    }
                }).catch(() => {});
            }
            break;
            case "list": {
                const postList = client.db.prepare('SELECT * from rdtposts WHERE disocrdchannel = @disocrdchannel').all({
                    disocrdchannel: interaction.channelID
                })

                const messageContent = `# (${postList.length}) Posts:\n` + postList.map(post=>`- [name](<${genUrl(post.pid)}>)`).join('\n')
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
    description: "Veiw and edit posts on reading list",
    options: [
        {
            "name": "add",
            "description": "Adds a post to the list",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The post to add",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "remove",
            "description": "removes a post",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The posts to remove",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "list",
            "description": "Lists the posts on reading list",
            "type": 1
        }
    ]
}