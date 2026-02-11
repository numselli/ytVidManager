import { Client } from "oceanic.js";
import Database from 'better-sqlite3';
import {schedule} from 'node-cron'

import {commandList, clientCommands} from "./slashCommands/commandList.mjs";
import interactionsList from "./slashCommands/interactionsList.mjs";

import rssParser from "./utils/rssParser.mjs";
import postToDiscord from "./utils/post.mjs";
import rdtPostToDiscord from './utils/rdtPost.mjs'
import ytAPI from "./utils/ytAPI.mjs";

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

	// create tables for YT
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS channelsubs (ytchannelid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, owner TEXT NOT NULL, PRIMARY KEY (ytchannelid, disocrdchannel)) WITHOUT ROWID').run()
	} catch (error) {
		console.log("channelsubs table faild to create")
		console.log(error)	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS ytchannels (channelid TEXT NOT NULL PRIMARY KEY, lastvid TEXT NOT NULL, channelname TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("ytchannels table faild to create")	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS videos (messageid TEXT NOT NULL PRIMARY KEY, videoid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, position REAL NOT NULL, owner TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("videos table faild to create")	
	}

	// create tables for rdt
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS communitiessubs (sub TEXT NOT NULL, disocrdchannel TEXT NOT NULL, owner TEXT NOT NULL, PRIMARY KEY (sub, disocrdchannel)) WITHOUT ROWID').run()
	} catch (error) {
		console.log("communities table faild to create")
		console.log(error)	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS subs (sub TEXT NOT NULL PRIMARY KEY, lastpost TEXT NOT NULL, subname TEXT NOT NULL, lastupdated TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("subs table faild to create")	
	}
	try {
		db.prepare('CREATE TABLE IF NOT EXISTS rdtposts (messageid TEXT NOT NULL PRIMARY KEY, pid TEXT NOT NULL, disocrdchannel TEXT NOT NULL, cid TEXT NOT NULL, owner TEXT NOT NULL) WITHOUT ROWID').run()
	} catch (error) {
		console.log("rdtposts table faild to create")	
	}
});

const processYt = (row, feed) => {
	const videosToAlert = feed.items.slice(0, feed.items.findIndex(a=>a.id===row.lastvid)).reverse();
	if (videosToAlert.length === 0) return;

	db.prepare('UPDATE ytchannels SET lastvid = @lastvid, channelname = @channelname WHERE channelid = @channelid').run({
		channelid: row.channelid,
		lastvid: videosToAlert[videosToAlert.length-1].id,
		channelname: feed.title
	})

	if (feed.items.find(a => a.id===row.lastvid)){
		const channelsToSend = db.prepare('SELECT disocrdchannel, owner FROM channelsubs WHERE ytchannelid = @ytchannelid').all({
			ytchannelid: row.channelid
		})
		channelsToSend.forEach(row => {
			videosToAlert.forEach(v=>{
				postToDiscord(row.disocrdchannel, client, {vid: v.id, userID: row.owner})
			})
		})
	}
}

schedule(cronSchedule, async () => {
	// yt
	const channelList = db.prepare('SELECT * FROM ytchannels').all()
	const erroredRss = await Promise.all(channelList.map(async row => {
		const rssFeed = await rssParser(`https://www.youtube.com/feeds/videos.xml?channel_id=${row.channelid}`);
		if (rssFeed.error) return {...row, error: true};
		processYt(row, rssFeed)
		return {error: false}
	}))
	erroredRss.filter(a=>a.error).forEach(row => {
		const feed = ytAPI(row.channelid)
		processYt(row, feed)
	});

	// rddt
	const communitiesList = db.prepare('SELECT * FROM subs').all()
	communitiesList.forEach(async row => {
		const rssFeed = await rssParser(`https://www.reddit.com/r/${row.sub}/new.rss`);

		const postsToAlert = rssFeed.entry.slice(0, rssFeed.entry.findIndex(a=>a.id===row.lastpost)).reverse();
		if (postsToAlert.length === 0) return;

		db.prepare('UPDATE subs SET lastpost = @lastpost, lastupdated = @updated WHERE sub = @sub').run({
			sub: row.sub,
			lastpost: postsToAlert[postsToAlert.length-1].id,
			updated: rssFeed.updated
		})

		if (rssFeed.entry.find(a => a.id===row.lastpost)){
			const channelsToSend = db.prepare('SELECT disocrdchannel, owner FROM communitiessubs WHERE sub = @sub').all({
				sub: row.sub
			})
			channelsToSend.forEach(rowCh => {
				postsToAlert.forEach(v=>{
					rdtPostToDiscord(rowCh.disocrdchannel, client, {pid: v.id, sub: row.sub, cid: '', userID: rowCh.owner})
				})
			})
		}
	})
})

client.connect();
