import {Client, GatewayIntentBits, GuildMember} from "discord.js";

// Just the straight up bot token

let token:string = process.env.DISCORD_TOKEN?process.env.DISCORD_TOKEN:process.exit(1);
// The guild token where the bot will be doing the thing in

let acting_guild:string = process.env.DISCORD_GUILD_ID?process.env.DISCORD_GUILD_ID:process.exit(1);

// selection methodology which will make sure all conditions are met before selecting

// a list of member ids
let mem_ids = process.env.DISCORD_MEMBER_IDS;
// a pair of member ids which all selected will fall between
let mem_interval = process.env.DISCORD_SUS_INTERVAL;
// a time interval measured in seconds specifying how close 2 members join together in order to be selected
let mem_range = process.env.DISCORD_MEMBER_RANGE;
// the action to be taken if a member matches criteria
let _action = process.env.DISCORD_DETECT_ACTION;
let action:string;
//type check because typescript doesn't support what I need to annotate out the full type
if(_action && ("LIST KICK".split(" ").some(act=>act == _action) || _action.match("^BAN([0-9])$"))){
    action = _action;
}
else {
    action = "LIST";
}

// processing the selection methodology
let member_ids:string[] | null = mem_ids?mem_ids.split(" "):null;
let member_interval:number | null = mem_interval?Number.parseFloat(mem_interval):null;
let member_range:[string,string | null] | null;
if(mem_range){
    let tmp = mem_range
    .split(" ")
    .slice(0,2);
    switch(tmp.length){
	case 0:
	    member_range = null;
	    break;
	case 1:
	    member_range = [tmp[0],null];
	    break;
	case 2:
	    member_range = [tmp[0],tmp[1]];
	    break;
	default:
	    // if this doesn't always work the person who has to figure it out is not gonna have a good time
	    console.error("error this shouldn't have happened exiting");
	    process.exit(1);
    }
}

else {
    member_range = null;
}
// creation of a client
const client = new Client({intents:GatewayIntentBits.Guilds});

client.once('ready', async ()=>{
    let guild = await client.guilds.fetch(acting_guild);
    let members = await guild.members.fetch();
    //specifies the earliest point where we care about a number and the latest point
    let time_range: [number, number | null] | null = null;
    {
	let range = member_range?[await guild.members.fetch(member_range[0]),  member_range[1]?await guild.members.fetch(member_range[1]):null]:null;
	let tmp:[number | null, number | null] | null = range&&range[0]?[range[0]?.joinedTimestamp,range[1]?range[1]?.joinedTimestamp:null]:null;
	if(tmp){
	    //bitch
	    let x = tmp[0];
	    if(x) time_range = [x,tmp[1]];
	}
    }
    let mems:GuildMember[] = [];
    //putting all the guild members into a list for convenience
    members.forEach(val=>mems.push(val));
    mems.sort(MemberListSortKey);

    let act_on = mems
	//need to turn into a list sorted by most recent join to most early
	//this filter needs to go first because it relates to proximity between members
	.filter(JoinRangeFilter(mems))
	.filter(member=>member_ids?member_ids.some(id=>id==member.id):true)
	.filter(TimeRangeFilter(time_range));
    act_on.forEach(MemberAction(action))
});

client.login(token);
function MemberListSortKey(mem1:GuildMember, mem2:GuildMember){
    return Number(mem2.joinedTimestamp) - Number(mem1.joinedTimestamp);
}
function JoinRangeFilter(mems:GuildMember[]){
    return (member:GuildMember,index:number)=>{
	let sum = false;
	if(member.joinedTimestamp && mems[index-1]){
	    let x = mems[index-1].joinedTimestamp;
	    if(x) sum ||= Math.abs(member.joinedTimestamp-x) < Number(member_interval);
	}
	if(member.joinedTimestamp && mems[index+1]){
	    let x = mems[index+1].joinedTimestamp;
	    if(x) sum ||= Math.abs(member.joinedTimestamp-x) < Number(member_interval);
	}
	return sum;
    }
}
function TimeRangeFilter(time_range:[number, number | null] | null){
    return (member:GuildMember)=>time_range?
	    member.joinedTimestamp && time_range[0] < member.joinedTimestamp 
	    && time_range[1]?member.joinedTimestamp < time_range[1]:true:true
}
function MemberAction(action:string){
    return (member:GuildMember)=>{
	switch(action){
	    case "LIST":
		console.log(member.id);
	    break;
	    case "KICK":
		member.kick("part of mass kick by moderator/admin");
	    break;
	    default:
		let msgDelete: number = Number.parseInt(action.split("(")[1][0]);
		member.ban({deleteMessageDays:msgDelete,reason:"part of mass ban by moderator/admin"});
	    break;
	}
    }   
}
