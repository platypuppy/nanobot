import {
	Client,
	EmbedBuilder,
	Emoji,
	GuildEmoji,
	Message,
	MessageReplyOptions,
	MessageType,
} from 'discord.js';
import { Logger, WarningLevel } from './logger';
import { doesMatch, emoteNameToId, getEmote } from './util';
const { serverLog } = require('../groche-channels.json');
const {
	emoteHmmm,
	emoteJii,
	emoteSethCP,
	emoteMajimeHi,
} = require('../groche-emotes.json');

const devMode = true;

let client: Client;

let logger: Logger = new Logger('reactor', WarningLevel.Warning);

export function reactor_init(clientInstance: Client) {
	client = clientInstance;
}

async function reactWithEmoji(msg: Message, emojiName: string) {
	const emoji = await getEmote(msg.guild, emoteNameToId(emoteHmmm));
	if (emoji) msg.react(emoji);
	else {
		logger.log('Unable to get emoji ' + emoteHmmm, WarningLevel.Error);
	}
}

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

	if (
		doesMatch(msg.content, {
			match: '?',
			ignorePunctuation: false,
			ignoreCapitalization: false,
		})
	) {
		reactWithEmoji(msg, emoteHmmm);
	}

	const reactOptions = [emoteHmmm, emoteJii, emoteSethCP, emoteMajimeHi];
}
