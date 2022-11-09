import { Client, Message } from 'discord.js';
import { registerMessageListener } from '..';
import { Logger, WarningLevel } from './logger';
import { doesMatch, emoteNameToId, getEmote } from './util';
const { serverLog } = require('../groche-channels.json');
import {
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
	emoteAwangry,
	emoteShit,
	emoteMcfx2,
	emoteCamaro,
	emoteBanana,
	emoteGarfdab,
	emoteHeykas,
	emoteHuh,
	emoteShijimaDead,
} from '../groche-emotes.json';

const devMode = false;

let client: Client;

let logger: Logger = new Logger('reactor', WarningLevel.Warning);

export async function reactor_init(clientInstance: Client) {
	client = clientInstance;

	registerMessageListener(reactor_onMessageSend);
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
		logger.log(
			'reacting to message with ' + emoji + ' because it contains ' + word,
		);
		reactWithEmoji(msg, emoji);
		return true;
	}
	return false;
}

function asciiBuzzword(
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
		msg.react(emoji);
		return true;
	}
	return false;
}

const buzzwordList = [
	(msg: Message) => emojiBuzzword(msg, 'comfy', emoteYomiSmile),
	(msg: Message) => emojiBuzzword(msg, 'clearly', emoteClearly),
	(msg: Message) => asciiBuzzword(msg, 'healthcare', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'healthy', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'burger', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'expensive', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'inflation', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'corruption', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'invasion', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'freedom', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'independence', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'privatized', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'gun', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'firework', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'america', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'war', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'middle east', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'taliban', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, '9/11', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'military', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'immigration', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'visa', '🇺🇸'),
	(msg: Message) => asciiBuzzword(msg, 'immigrant', '🇺🇸'),
	(msg: Message) => emojiBuzzword(msg, 'cursed', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'seth mode', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'sethmode', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'sethmoding', emoteSethCP),
	(msg: Message) => emojiBuzzword(msg, 'repost', emoteDownload),
	(msg: Message) => emojiBuzzword(msg, 'mommy', emoteJii),
	(msg: Message) => emojiBuzzword(msg, 'daddy', emoteJii),
	(msg: Message) => emojiBuzzword(msg, 'come on', emoteClearly),
	(msg: Message) => emojiBuzzword(msg, 'hello', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'grr', emoteAwangry),
	(msg: Message) => emojiBuzzword(msg, 'glitch', emoteShit),
	(msg: Message) => emojiBuzzword(msg, 'fucked up', emoteShit),
	(msg: Message) => emojiBuzzword(msg, 'missingno', emoteShit),
	(msg: Message) => emojiBuzzword(msg, 'mcfx2', emoteMcfx2),
	(msg: Message) => emojiBuzzword(msg, 'minecraft effects', emoteMcfx2),
	(msg: Message) => emojiBuzzword(msg, 'camaro', emoteCamaro),
	(msg: Message) => emojiBuzzword(msg, 'monkey', emoteBanana),
	(msg: Message) => emojiBuzzword(msg, 'banana', emoteBanana),
	(msg: Message) => emojiBuzzword(msg, 'ape', emoteBanana),
	(msg: Message) => emojiBuzzword(msg, 'gorilla', emoteBanana),
	(msg: Message) => emojiBuzzword(msg, 'kong', emoteBanana),
	(msg: Message) => emojiBuzzword(msg, 'garfield', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'lasagna', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'lasaga', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'jon', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'monday', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'cat', emoteGarfdab),
	(msg: Message) => emojiBuzzword(msg, 'confused', emoteHuh),
	(msg: Message) => emojiBuzzword(msg, 'asdf', emoteHuh),
	(msg: Message) => emojiBuzzword(msg, 'qwerty', emoteHuh),
	(msg: Message) => emojiBuzzword(msg, 'weird', emoteHuh),
	(msg: Message) => emojiBuzzword(msg, 'strange', emoteHuh),
	(msg: Message) => emojiBuzzword(msg, 'dead', emoteShijimaDead),
	(msg: Message) => emojiBuzzword(msg, 'unfortunate', emoteShijimaDead),
	(msg: Message) => emojiBuzzword(msg, 'wait', emoteHeykas),
	(msg: Message) => emojiBuzzword(msg, 'morning', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'ohayou', emoteMajimeHi),
	(msg: Message) => emojiBuzzword(msg, 'hmm', emoteCurioser),
	(msg: Message) => emojiBuzzword(msg, 'no idea', emoteHmmm),
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
		if (!msg.mentions.has(client.user) && Math.random() > 0.15) {
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
