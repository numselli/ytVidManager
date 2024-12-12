import channel from './commands/channel.mjs'
import add from './commands/add.mjs'

export const commandList = [
	channel,
	add
];

export const clientCommands = new Map(
	commandList.map((command) => {
		return [command.name, command]
	})
);