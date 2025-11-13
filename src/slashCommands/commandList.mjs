import channel from './commands/channel.mjs'
import videos from './commands/videos.mjs';
import post from './commands/videos.mjs';

export const commandList = [
	channel,
	videos,
	post
];

export const clientCommands = new Map(
	commandList.map((command) => {
		return [command.name, command]
	})
);