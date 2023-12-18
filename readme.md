# ytVidManager

### A Discord bot to help manage and prioritize youtube video subscriptions 

### Features
- subscribe to youtube channels
- manually add videos
- auto add videos from subscriptions
- add tags to video posting
- remove tags from video posting
- keep track of video progress

### How to host the bot: 
1) Install `docker` and `docker-compose`
2) Create a docker volume with the name of `ytVidManagerStatic`
3) Copy the `settings.example.mjs` file into the docker volume named and rename the file to `settings.mjs`
4) Create the bot account
    1) Go to https://discord.com/developers/applications
    2) Create a new application 
    3) Go to the bot page
    4) Toggle off public bot
    5) Copy the bot token into the `settings.mjs` file
    6) Invite the bot `https://discord.com/oauth2/authorize?client_id=<BOT_ID>&permissions=26624&scope=bot%20applications.commands `
5) Clone the bot
    1) Run `git clone https://github.com/numselli/ytVidManager`
    2) Run `cd ytVidManager`
    3) Then start the bot using `docker-compose up -d`
6) (optional) Change the `cronSchedule` in the `settings.mjs` file the default is every 2h

### How to use the bot
1) Create or use a private server (do not use this bot in a public server)
2) Create roles for your video tags (long, short, listenable, visual)
3) Invite the bot
4) Add the Youtube channels you want to receive uploads for
    1) Open the channel page on Youtube
    2) Click on the channel's description under the channel name and subscriber count.
    3) Scroll to the bottom and click on the `Share` button
    4) Click on `Copy channel ID`
5) Run the `/channel add` command and paste in the channel ID that you just copied.
6) Repeat steps 4 and 5 for all the channels you are subscribed to.