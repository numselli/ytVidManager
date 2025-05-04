import channel from './commands/channel.mjs'
import videos from './commands/videos.mjs';

export const commandList = [
	channel,
	videos
];

export const clientCommands = new Map(
	commandList.map((command) => {
		return [command.name, command]
	})
);