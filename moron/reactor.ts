import { Client, Message } from 'discord.js';
import { Logger, WarningLevel } from './logger';
import { doesMatch, emoteNameToId, getEmote } from './util';
const { serverLog } = require('../groche-channels.json');
const {
	emoteHmmm,
	emoteJii,
	emoteSethCP,
	emoteMajimeHi,
	emoteYomiSmile,
	emoteClearly,
	emoteDownload,
	emoteMikuDab,
	emoteNukool,
	emoteSip,
	emoteKaren,
	emoteCurioser,
	emoteBonzi,
} = require('../groche-emotes.json');

const devMode = false;

let client: Client;

let logger: Logger = new Logger('reactor', WarningLevel.Warning);

export function reactor_init(clientInstance: Client) {
	client = clientInstance;
}

async function reactWithEmoji(msg: Message, emojiName: string) {
	const emoji = await getEmote(msg.guild, emoteNameToId(emojiName));
	if (emoji) msg.react(emoji);
	else {
		logger.log('Unable to get emoji ' + emojiName, WarningLevel.Error);
	}
}

function emojiBuzzword(
	msg: Message,
	word: string,
	emoji: string,
	ignoreSymb: boolean = true,
	ignoreCase: boolean = true,
): boolean {
	if (
		doesMatch(msg.content, {
			match: word,
			ignoreCapitalization: ignoreCase,
			ignorePunctuation: ignoreSymb,
		})
	) {
		reactWithEmoji(msg, emoji);
		return true;
	}
	return false;
}

const buzzwordList = [
	(msg: Message) => emojiBuzzword(msg, 'comfy', emoteYomiSmile),
	(msg: Message) => emojiBuzzword(msg, 'clearly', emoteClearly),
	(msg: Message) => emojiBuzzword(msg, 'cursed', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'repost', emoteDownload),
	(msg: Message) => emojiBuzzword(msg, 'mommy', emoteJii),
	(msg: Message) => emojiBuzzword(msg, 'daddy', emoteJii),
	(msg: Message) => emojiBuzzword(msg, 'come on', emoteClearly),
	(msg: Message) => emojiBuzzword(msg, 'hello', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'morning', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'ohayou', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'hm', emoteCurioser),
	(msg: Message) => emojiBuzzword(msg, 'thinking', emoteCurioser),
	(msg: Message) => emojiBuzzword(msg, 'sip', emoteSip),
	(msg: Message) => emojiBuzzword(msg, 'drink', emoteSip),
	(msg: Message) => emojiBuzzword(msg, 'epic', emoteNukool),
	(msg: Message) => emojiBuzzword(msg, 'pog', emoteNukool),
	(msg: Message) => emojiBuzzword(msg, 'download', emoteDownload),
	(msg: Message) => emojiBuzzword(msg, 'dab', emoteMikuDab),
	(msg: Message) => emojiBuzzword(msg, 'stare', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'karen', emoteKaren),
	(msg: Message) => emojiBuzzword(msg, 'happy', emoteYomiSmile),
	(msg: Message) => emojiBuzzword(msg, 'excited', emoteYomiSmile),
	(msg: Message) => emojiBuzzword(msg, 'sunny', emoteNukool),
	(msg: Message) => emojiBuzzword(msg, 'cloudy', emoteSip),
	(msg: Message) => emojiBuzzword(msg, 'overcast', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'snow', emoteMikuDab),
	(msg: Message) => emojiBuzzword(msg, 'buddy', emoteBonzi),
	(msg: Message) => emojiBuzzword(msg, 'pal', emoteBonzi),
	(msg: Message) => emojiBuzzword(msg, 'friend', emoteBonzi),
	(msg: Message) => emojiBuzzword(msg, 'amigo', emoteBonzi),
	(msg: Message) => emojiBuzzword(msg, 'confidant', emoteBonzi),
	(msg: Message) => emojiBuzzword(msg, 'miku', emoteMikuDab),
	(msg: Message) => emojiBuzzword(msg, '?', emoteHmmm, false),
];

export async function reactor_onMessageSend(msg: Message) {
	if (!client.user) {
		logger.log(
			'Tried to receive message when client was not initialized!',
			WarningLevel.Error,
		);
		return;
	}

	if (devMode) {
		if (msg.channelId !== serverLog) {
			return;
		}
	}

	if (!devMode) {
		if (!msg.mentions.has(client.user) && Math.random() > 0.25) {
			return;
		}
	}

	buzzwordList.every((fn: (m: Message) => boolean) => {
		if (fn(msg)) {
			return Math.random() > 0.5;
		}
		return true;
	});
}
