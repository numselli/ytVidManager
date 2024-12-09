import { Client } from "oceanic.js";
import Database from 'better-sqlite3';
import {schedule} from 'node-cron'

import interactionCreate from "./events/interactionCreate.mjs";
import commandList from "./slashCommands/commandList.mjs";

import { postToDiscord } from "./utils/post.mjs";
import fetchFromRSS from "./utils/rss.mjs";

const { token, cronSchedule } = await import(
	process.env.NODE_ENV === "production" ? "/static/settings.mjs" : "./static/settings.mjs"
);

const db = new Database(process.env.NODE_ENV === "production" ? "/static/database.db" : "./static/database.db");
const client = new Client({
	auth: token,
	collectionLimits: {
		messages: 0,
		members: 0,
		users: 0,
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
client.on("interactionCreate", interactionCreate.bind(null, client))
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

	const discordCommands = await client.application.getGlobalCommands();

	client.commands = new Map(
		commandList.map((command) => {
			return [
				command.name,
				{
					commandFile: command,
					discordInfo: discordCommands.find((discordCommand) => {
						return discordCommand.name === command.name;
					}),
				},
			];
		}),
	);
});


schedule(cronSchedule, () => {
	db.prepare('SELECT * FROM channels').all().forEach(async row => {
		const lastRSS = await fetchFromRSS(row.channelid)
		const vidID = lastRSS.id.replace("yt:video:", "")
	
		if (vidID === row.lastvid) return;
		client.db.prepare('UPDATE channels SET lastvid = @lastvid, channelname = @channelname WHERE channelid = @channelid').run({
			channelid: row.channelid,
			lastvid: vidID,
			channelname: lastRSS.author
		})
	
		postToDiscord(row.disocrdchannel, client, vidID)
	})
})


client.connect();