import channel from './commands/channel.mjs'
import videos from './commands/videos.mjs';
import post from './commands/post.mjs';
import communities from './commands/communities.mjs'

export const commandList = [
	channel,
	videos,
	post,
	communities
];

export const clientCommands = new Map(
	commandList.map((command) => {
		return [command.name, command]
	})
);