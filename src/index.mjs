import { Client } from "oceanic.js";
import Database from 'better-sqlite3';
import {schedule} from 'node-cron'

import interactionCreate from "./events/interactionCreate.mjs";
import commandList from "./slashCommands/commandList.mjs";

import { postChannelYtVid } from "./utils/utils.mjs";

const { token, cronSchedule, guildID } = await import(
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
		intents: ["GUILDS", "GUILD_MESSAGES"],
		presence: {
			status: "dnd"
		}
	}	
})


client.db = db

client.on("error", console.log);
client.on("interactionCreate", interactionCreate.bind(null, client))
client.once("ready", async() => {
	client.guildID = guildID
	client.application.bulkEditGlobalCommands(commandList)

	try {
		db.prepare('CREATE TABLE IF NOT EXISTS channels (channelid TEXT NOT NULL PRIMARY KEY, disocrdchannel TEXT NOT NULL, lastvid TEXT, channelname TEXT) WITHOUT ROWID').run()
	} catch (error) {
		console.log("table faild to create")	
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
	db.prepare('SELECT * FROM channels').all().forEach(async row =>
		postChannelYtVid(row, client)
	)
})


client.connect();