import { Client } from "oceanic.js";
import Database from 'better-sqlite3';
import {schedule} from 'node-cron'

import {commandList, clientCommands} from "./slashCommands/commandList.mjs";
import interactionsList from "./slashCommands/interactionsList.mjs";

import postToDiscord from "./utils/post.mjs";
import fetchFromRSS from "./utils/rss.mjs";

const { token, cronSchedule, channelID } = await import(
	process.env.NODE_ENV === "production" ? "/static/settings.mjs" : "./static/settings.mjs"
);

const db = new Database(process.env.NODE_ENV === "production" ? "/static/database.db" : "./static/database.db");
const client = new Client({
	auth: token,
	collectionLimits: {
		messages: 0,
		members: 0,
		users: 0
	},
	gateway: {
		intents: ["GUILDS"],
		presence: {
			status: "dnd"
		}
	}	
})


client.db = db

client.on("error", console.log);
client.on("interactionCreate", (interaction)=>{
	if (channelID !== interaction.channelID) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {type: 4, data: {flags: 64, content: "Bot is in private beta"}}).catch(() => {});

	if (interaction.type === 3 || interaction.type === 5) return interactionsList.get(interaction.data.customID.split("_")[0]).logic(interaction, client);
	clientCommands.get(interaction.data.name).commandLogic(interaction, client);
})
client.once("ready", async() => {
	client.application.bulkEditGlobalCommands(commandList)

	try {
		db.prepare('CREATE TABLE IF NOT EXISTS channels (channelid TEXT NOT NULL PRIMARY KEY, disocrdchannel TEXT NOT NULL, lastvid TEXT, channelname TEXT) WITHOUT ROWID').run()
	} catch (error) {
		console.log("channels table faild to create")	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS videos (messageid TEXT NOT NULL PRIMARY KEY, videoid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, position REAL NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("videos table faild to create")	
	}
});


schedule(cronSchedule, () => {
	db.prepare('SELECT * FROM channels').all().forEach(async row => {
		const lastRSS = await fetchFromRSS(row.channelid)
	
		if (lastRSS.id === row.lastvid) return;
		db.prepare('UPDATE channels SET lastvid = @lastvid, channelname = @channelname WHERE channelid = @channelid').run({
			channelid: row.channelid,
			lastvid: lastRSS.id,
			channelname: lastRSS.title
		})
	
		postToDiscord(row.disocrdchannel, client, lastRSS.id)
	})
})


client.connect();
