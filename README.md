# Discord frame yeet

A simple script that to make mass collection of discord user ids and/or banning easier. 

## Building

At time of writing you can do this via `tsc` or `npm run build`, you should probably run `npm install --save-dev` to fetch all the packages before that though.

## Running

At time of writing all important values to this program are taken via env variables because I'm lazy and didn't wanna install a lib to handle cli args. `DISCORD_TOKEN` should hold the discord bot token of the bot being used. `DISCORD_GUILD_ID` should hold the guild id of the guild the members are being listed, kicked or banned from. `DISCORD_MEMBER_IDS` should be a space separated list of discord user ids if you're selecting from a pre-made list. `DISCORD_SUS_INTERVAL` should specify an interval measured in seconds specifying how close 2 members need to join toegether to be selected for. `DISCORD_MEMBER_RANGE` should be a space separated pair of user ids, all users who joined the server between those 2 including those 2 members timewise will be selected. Note specifying multiple selectors will lead the program to select for users who match all selectors, if you would like to select for users who match any of a few selectors you'll need to run multiple times. `DISCORD_DETECT_ACTION` should be one of `LIST`, `KICK` or `BAN(n)` where n is a 1 digit decimal number specifying the number of days of that members's messages should be deleted. AT TIME OF WRITING THE KICK AND BAN FUNCTIONALITY IS COMMENTED OUT AS A SAFETY WHILE TESTING.
