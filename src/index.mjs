import { Client } from "oceanic.js";
import Database from 'better-sqlite3';
import {schedule} from 'node-cron'

import {commandList, clientCommands} from "./slashCommands/commandList.mjs";
import interactionsList from "./slashCommands/interactionsList.mjs";

import rssParser from "./utils/rssParser.mjs";
import postToDiscord from "./utils/post.mjs";

const { token, cronSchedule } = await import(
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
	if (interaction.type === 3 || interaction.type === 5) return interactionsList.get(interaction.data.customID.split("_")[0]).logic(interaction, client);
	clientCommands.get(interaction.data.name).commandLogic(interaction, client);
})
client.once("ready", async() => {
	client.application.bulkEditGlobalCommands(commandList)

	try {
		db.prepare('CREATE TABLE IF NOT EXISTS channelsubs (ytchannelid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, owner TEXT NOT NULL, PRIMARY KEY (ytchannelid, disocrdchannel)) WITHOUT ROWID').run()
	} catch (error) {
		console.log("channelsubs table faild to create")
		console.log(error)	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS ytchannels (channelid TEXT NOT NULL PRIMARY KEY, lastvid TEXT NOT NULL, channelname TEXT NOT NULL, expires TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("ytchannels table faild to create")	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS videos (messageid TEXT NOT NULL PRIMARY KEY, videoid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, position REAL NOT NULL, owner TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("videos table faild to create")	
	}
});

schedule(cronSchedule, () => {
	const channelList = db.prepare('SELECT * FROM ytchannels').all()
	const filteredList = channelList
	// const now = new Date().getTime()
	// const filteredList = channelList.filter(v => new Date(v.expires).getTime() <= now)
	filteredList.forEach(async row => {
		const rssFeed = await rssParser(`https://www.youtube.com/feeds/videos.xml?channel_id=${row.channelid}`);

		const videosToAlert = rssFeed.items.slice(0, rssFeed.items.findIndex(a=>a.id===row.lastvid)).reverse();
		if (videosToAlert.length === 0) return;

		db.prepare('UPDATE ytchannels SET lastvid = @lastvid, channelname = @channelname, expires = @expires WHERE channelid = @channelid').run({
			channelid: row.channelid,
			lastvid: videosToAlert[videosToAlert.length-1].id,
			channelname: rssFeed.title,
			expires: rssFeed.expires
		})

		if (rssFeed.items.find(a => a.id===row.lastvid)){
			const channelsToSend = db.prepare('SELECT disocrdchannel, owner FROM channelsubs WHERE ytchannelid = @ytchannelid').all({
				ytchannelid: row.channelid
			})
			channelsToSend.forEach(row => {
				videosToAlert.forEach(v=>{
					postToDiscord(row.disocrdchannel, client, {vid: v.id, userID: row.owner})
				})
			})
		}
	})
})

client.connect();
