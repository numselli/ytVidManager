export default {
    name: "channel",
    commandLogic: (interaction, client) => {
        switch (interaction.data.options.raw[0].name){
            case "add":          
                client.db.prepare('INSERT INTO channels (channelid, disocrdchannel) VALUES (@channelid, @disocrdchannel)').run({
                    channelid: interaction.data.options.raw[0].options[0].value,
                    disocrdchannel: interaction.channelID
                })
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `added: https://www.youtube.com/channel/${interaction.data.options.raw[0].options[0].value}`
                    }
                }).catch(() => {});
            break;
            case "remove":
                client.db.prepare('DELETE FROM channels WHERE channelid = @channelid AND disocrdchannel = @disocrdchannel').run({
                    channelid: interaction.data.options.raw[0].options[0].value,
                    disocrdchannel: interaction.channelID
                })
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `removed: https://www.youtube.com/channel/${interaction.data.options.raw[0].options[0].value}`

                    }
                }).catch(() => {});
            break;
            case "list":
                const list = client.db.prepare('SELECT channelid, channelname FROM channels').all().map(channel=>`- [${channel.channelname}](<https://youtube.com/channel/${channel.channelid}>)`).join('\n')
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `# Youtube channels`
                    }
                }).catch(() => {});

                const parts = list.match(/[\s\S]{1,2000}$/gm);

                parts.forEach(element => {
                    client.rest.channels.createMessage(interaction.channelID, {
                        content: element
                    })
                });


                // const perChunk = 10
                // list.reduce((all,one,i) => {
                //     const ch = Math.floor(i/perChunk); 
                //     all[ch] = [].concat((all[ch]||[]),one); 
                //     return all
                // }, []).forEach(element => {
                //     client.rest.channels.createMessage(interaction.channelID, {
                //         content: element.join("\n")
                //     })
                // });
            
            break;
        }
    },
    description: "Veiw and edit yt channel subscriptions",
    options: [
        {
            "name": "add",
            "description": "Add a youtube channel to monitor",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt channel ID you want to subscribe to.",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "remove",
            "description": "removes a youtube channel to monitor",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt channel ID you want to unsubscribe from",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "list",
            "description": "Lists the monitored youtube channels",
            "type": 1
        }
    ]
}