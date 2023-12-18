export default {
	name: "watching",
	logic: (interaction) => {
		interaction.createModal({
			components: [
				{
					type: 1,
					components: [
						{
							label: "TimeStamp",
							style:1,
							type: 4,
							customID: "sdaf"
						}
					]
				}
			],
			customID: "setTimeStamp",
			title: "Enter a time stamp in HH:MM:SS format"
		})
	}
};
