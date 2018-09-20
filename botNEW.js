const Discord = require('discord.js');
const client = new Discord.Client();
//For authentication
const auth = require('./auth.json');
//For reading / writing files
const fs = require("fs");
//For fileshare reads encoding parameter
const encoding = "'encoding: 'utf-8'";

//Log to the console when we sign on
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//Use the auth token to sign the bot in
client.login( auth.token );

client.on('error', console.error);

//Test loop to spawn pokemon
client.on('message', function(message) {
    // Now, you can use the message variable inside
    if (message.content === "$loop") { 
        var interval = setInterval (function () {
            // use the message's channel (TextChannel) to send a new message
            message.channel.send("123")
            .catch(console.error); // add error handling here
        }, 1 * 1000); 
    }
});

//On joining the server
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'general');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}! Hop into the #introduce_yourself channel and let us know a little bit about you :)`);
  //Add the guest role
  member.addRole('453792775326924801').catch(console.error);
});

//Command list
client.on('message', discMessage => {
	
	//Special auto-react for the legendary potang praiser
	if( discMessage.author.id == '102455250086023168' ) {
		discMessage.react(discMessage.guild.emojis.get('461065804075630592'));
		discMessage.react(discMessage.guild.emojis.get('462618827046518804'));
	}
	
	//Special auto-react for those without blunt
	//if( discMessage.author.id == '106851714631512064' ) {
		//discMessage.react(discMessage.guild.emojis.get('464904566073458689'));
	//}
	
	// Spawn pokemon
    if (discMessage.content === "!spawn" && discMessage.channel.name == 'pokecord-commands') {
		/*
        var interval = setInterval (function () {
            // use the message's channel (TextChannel) to send a new message
            discMessage.channel.send( "Spawn baby spawn!" )
            .catch(console.error); // add error handling here
        }, 2000); 
		*/
		discMessage.channel.send( "GL for level 100 legendary!" );
    }
	
	//Gather the content of the message
	var msg = discMessage.content;
     if (msg.substring(0, 1) == '!') {
        var args = msg.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
		
		/*New commands can be added here
		* Each command then replies to the caller via the discMessage objects' reply function
		*/
        switch(cmd) {
			
			// !updateraidstatus
            case 'updateraidstatus':
				var argsLength = 17;
				var updateStr = msg.substring(argsLength, msg.toString().length+1);
				//write to the file for raid status
				var raidFile = fs.writeFile("./raidstatus.json", updateStr, "utf8");
 				discMessage.reply( 'Raid status updated!' );
            break;
			
			// !raidstatus
            case 'raidstatus':
				var raidFile = fs.readFileSync("./raidstatus.json", {"encoding": "utf-8"})
 				discMessage.reply( "Here's the latest raid status: " + raidFile );
            break;
			
			// !badbot
            case 'badbot':
 				var returnMsg = fs.readFileSync("./navy.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !guildwars
            case 'guildwars':
 				var returnMsg = fs.readFileSync("./guildwars.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !seals
            case 'seals':
  				var returnMsg = fs.readFileSync("./seals.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !medalcurve
            case 'medalcurve':
  				var returnMsg = fs.readFileSync("./medalcurve.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			 // !feelsBad
            case 'feelsBad':
 				var returnMsg = 'That does feel bad ' + discMessage.author.username + '\nhttps://media.giphy.com/media/zRjsGx92PB79K/giphy.gif';
				discMessage.reply ( returnMsg );
            break;
			
			// !getspeedrun @user
            case 'getspeedrun':
				//Get the userID mentioned
				var id = msg.replace(/[^0-9]/g, "");
				var returnMsg = '';
				
				if(id.length != 18) {
					returnMsg = "You must tag the user to get their speedrun using @USER and pressing tab or selecting their name";
				} else {				
					//Make sure the user has a file first
					if(fs.existsSync("./"+id+"speedrun.json", "utf8")) {
						//Get that users speedrun file
						var usersFile = JSON.parse(fs.readFileSync("./"+id+"speedrun.json", "utf8"));
						var fileArr = usersFile[id][0].split(',');
						var medals = fileArr[0];
						var stage = fileArr[1];
						var time = fileArr[2];
						var race = fileArr[3];
						
						returnMsg = "The last run I have for that user is as follows: \n\n**`Medals:`** " + medals + "\n**`Revive Stage:`** " + stage + "\n**`Time:`** " + time + "\n**`Race:`**"  + race;
					} else {
						returnMsg = "Sorry I don't have a speedrun for that user :(";
					}
				}
				
				discMessage.reply ( returnMsg );
				
            break;
			
			// !recordspeedrun
            case 'recordspeedrun':
			
			 // Get previous data to compare
			var userData;

			//Gather the run data the user submitted
			var spaceInd = msg.indexOf(' ');
			var runStr = msg.slice(spaceInd+1);
			var runStrArr = runStr.split(',');		
			var date = new Date();
			var data = '{"'+ discMessage.author.id +'" : ["'+runStr+ ','+discMessage.author.username+','+ date +'"]}';
			var messageReply = 'You recorded your first speedrun! Congrats!\nYou can view this run by typing the command **`!myspeedrun`**';

			if(fs.existsSync("./"+discMessage.author.id+"speedrun.json", "utf8")) {
			  userData = JSON.parse(fs.readFileSync("./"+discMessage.author.id+"speedrun.json", "utf8"))[discMessage.author.id][0].split(',');
			  var medals = userData[0];
			  var stage = userData[1];
			  var time = userData[2];
			  var race = userData[3];
			  var percentage = improvement(runStrArr[0], medals);
			  messageReply = 'Your run has been recorded - good job!\nYou improved your run by ' + percentage.toString() + '%!';
			  if (percentage > 1000) {
				messageReply += "\nThat's a huge improvement! Did you forget to record for a while?";
			  }
			  if (percentage < 0) {
				messageReply += "\nWait, that's not an improvement. Did you record your numbers wrong?";
			  }
			  messageReply +=  '\nYou can view this run by typing the command **`!myspeedrun`**';
			}
					
			//write to the file for the user
			var usersFile = fs.writeFile("./"+discMessage.author.id+"speedrun.json", data, "utf8", completeMessage());


			function completeMessage() {
				//send a return message confirming it's been written to
				discMessage.reply ( messageReply );
			}
				  
            break;
			
			// !myspeedrun
            case 'myspeedrun':
				
				var stringMsg = '';
				//Make sure the user has a file first
				if(fs.existsSync("./"+discMessage.author.id+"speedrun.json", "utf8")) {
					//Read back the users speed run
					var usersFile = JSON.parse(fs.readFileSync("./"+discMessage.author.id+"speedrun.json", "utf8"));
					var fileArr = usersFile[discMessage.author.id][0].split(',');
					var medals = fileArr[0];
					var stage = fileArr[1];
					var time = fileArr[2];
					var race = fileArr[3];
					//4 is the medal count without the letter - thought I'd need it at some point but never got round to using it
					var date = fileArr[5];
					
					stringMsg = "The last run I have for you is from: " + date +" . Here's the deets: \n\n**`Medals:`** " + medals + "\n**`Revive Stage:`** " + stage + "\n**`Time:`** " + time + "\n**`Race:`**"  + race;
					stringMsg += "\n\nIf you'd like to record a new speedrun use the command **`!recordspeedrun`** followed by A,B,C,D - where A is your medals per minute,";
					stringMsg += "B is the stage you revived at, C is the time you revived on and D is the race you were.";
					stringMsg += "\n\nE.g: **`!recordspeedrun 275c,11800,33m,elf`**\nIf you do not know values B,C,D just put 'Unknown'.";
					
				} else {
					stringMsg = "Sorry, I don't have a speedrun on file for you :(";
				}

				discMessage.reply ( stringMsg );
				
            break;
			
			// !thanks
            case 'thanks':
			var file = fs.readFileSync("./thankMsg.txt", {"encoding": "utf-8"})
			file++;
			var writeFile = fs.writeFile("./thankMsg.txt", file, "utf8");
			var thankMsg = "Aww shucks - i'm just doing my job " + discMessage.author.username + "!\nI've been thanked " + file + " times! I'm a good bot :D";

			discMessage.reply( thankMsg );
				
            break;
			
			// !buffmodes
			case 'buffmodes':
 				var returnMsg = fs.readFileSync("./buffmodes.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !raidnotes
			case 'raidnotes':
				var returnMsg = fs.readFileSync("./raidnotes.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !medaltracker
            case 'medaltracker':
				var returnMsg = fs.readFileSync("./medaltracker.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !guildraid
            case 'guildraid':
				var returnMsg = fs.readFileSync("./guildraid.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !tot
            case 'tot':
				var returnMsg = fs.readFileSync("./tot.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !moneyValue
            case 'moneyValue':
				var returnMsg = fs.readFileSync("./moneyValue.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !artifactBuilds
            case 'artifactBuilds':
				var returnMsg = fs.readFileSync("./artifactBuilds.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !totcheatsheet
            case 'totcheatsheet':
				var returnMsg = fs.readFileSync("./totcheatsheet.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !petguide
            case 'petguide':
				var returnMsg = fs.readFileSync("./petguide.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !petcombos
            case 'petcombos':
				var returnMsg = fs.readFileSync("./petcombos.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
			break;
			
			// !commands
            case 'commands':
				var returnMsg = fs.readFileSync("./commands.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
            break;
			
			// !lombardi
			case 'lombardi':
				var returnMsg = "Check out lombardi's guide here: https://docs.google.com/document/d/1U103V5dqAKgatgQl0JET5vMygcmwNGSRO7MgMlXJab8/edit";
				discMessage.reply ( returnMsg );
			break;
			
			// !youTheBest
			case 'youTheBest':
				var returnMsg =  '**`Shut up baby I know it`**';
				discMessage.reply ( returnMsg );
			break;
			
			// !towel
			case 'towel':
				var returnMsg = 'https://gph.is/2t36CCq';
				discMessage.reply ( returnMsg );
			break;
			
			// !save
			case 'save':
				var returnMsg = fs.readFileSync("./save.txt", {"encoding": "utf-8"}); 
				discMessage.reply ( returnMsg );
			break;
			
         }
     }
});

function splitNum(string) {
  for (var i = string.length - 1; i > 0; i--) {
    if (!isNaN(string[i - 1]) && isNaN(string[i]) && string[i - 1] !== ' ') {
      return {
        num: Number(string.substring(0, i)),
        letters: string.substring(i).split(' ')[0].toLowerCase(),
      }
    }
  }
  return {
    num: Number(string),
    letters: null,
  }
}

function letterToInt(input) {
    if (input === null) return 0;
    input = input.replace(/[^A-Za-z]/, '');
    output = 0;
    for (i = 0; i < input.length; i++) {
        output = output * 26 + parseInt(input.substr(i, 1), 26 + 10) - 9;
    }
    return output;
}

function letterDifference(first, second) {
  return letterToInt(first) - letterToInt(second);
}

function improvement(newRun, originalRun) {
  var originalValue = splitNum(originalRun);
  var newValue = splitNum(newRun);
  var difference = letterDifference(newValue.letters, originalValue.letters);
  if (difference > 0 || difference < 0) {
    return Math.round((((newValue.num * (Math.pow(10, difference * 3))) - originalValue.num) / originalValue.num) * 100);
  } else {
    return Math.round(((newValue.num - originalValue.num) / originalValue.num) * 100);
  }
}