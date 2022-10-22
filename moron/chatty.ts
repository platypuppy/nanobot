import {
	Client,
	EmbedBuilder,
	Emoji,
	GuildEmoji,
	Message,
	MessageReplyOptions,
	MessageType,
	PartialMessage,
	ReactionEmoji,
	TextChannel,
} from 'discord.js';
import { Logger, WarningLevel } from './logger';
import { StringMatch, doesMatch, stringSet, whereMatch } from './util';
const { serverLog } = require('../groche-channels.json');

// dev mode here makes the bot reply with 100% probability, and makes it only reply in serverLog
const devMode: boolean = false;

const logger: Logger = new Logger(
	'chatty',
	devMode ? WarningLevel.Notice : WarningLevel.Warning,
);

function triggerIfMsgContains(
	msg: Message,
	triggerStrings: StringMatch[],
	callback: (msg: Message, whichPhrase: string) => void,
): boolean {
	let didTrigger: boolean = false;

	triggerStrings.every(match => {
		if (doesMatch(msg.content, match)) {
			callback(msg, match.match);
			didTrigger = true;
			return false;
		}
		return true;
	});

	return didTrigger;
}

function basicReplyFunction(replyList: string[]): (msg: Message) => void {
	return (msg: Message) => {
		msg.reply({
			content: replyList[Math.floor(Math.random() * replyList.length)],
			allowedMentions: {
				repliedUser: false,
			},
		});
	};
}

function getTopic(
	msg: string,
	beforePhrase?: string,
	afterPhrase?: string,
): string {
	if (beforePhrase && beforePhrase !== '') {
		msg = msg.substring(msg.indexOf(beforePhrase) + beforePhrase.length);
	}
	if (afterPhrase && afterPhrase !== '') {
		msg = msg.substring(0, msg.indexOf(afterPhrase));
	}
	return msg;
}

function getPhraseEnd(msg: string): number {
	let end = msg.length;
	['?', '.', ',', '\n', '\r', '!'].forEach(char => {
		const newEnd = msg.indexOf(char);
		if (newEnd !== -1 && newEnd < end) {
			end = newEnd;
		}
	});

	return end;
}

function smartReply(
	msg: Message,
	responseBuilders: ((topic: string) => string)[],
	beforePhrases: StringMatch[],
	afterPhrases: StringMatch[],
	stopAtPhraseEnd: boolean = true,
): boolean {
	let beforeMatch: StringMatch | undefined;
	if (beforePhrases.length > 0) {
		beforePhrases.forEach((match: StringMatch) => {
			if (doesMatch(msg.content, match)) {
				beforeMatch = match;
			}
		});
		if (beforeMatch === undefined) return false;
	}

	let afterMatch: StringMatch | undefined;
	if (afterPhrases.length > 0) {
		afterPhrases.forEach((match: StringMatch) => {
			if (doesMatch(msg.content, match)) {
				afterMatch = match;
			}
		});
		if (afterMatch === undefined) return false;
	}

	// message contained desired setup strings

	let topic = getTopic(
		msg.content,
		beforeMatch?.match,
		afterMatch?.match,
	).trimStart();
	if (stopAtPhraseEnd) {
		topic = topic.substring(0, getPhraseEnd(topic));
	}

	msg.reply({
		content:
			responseBuilders[Math.floor(responseBuilders.length * Math.random())](
				topic,
			),
		options: {
			allowedMentions: {
				repliedUser: false,
			},
		},
	});

	return true;
}

let client: Client;

export function chatty_init(clientInstance: Client) {
	if (devMode) {
		logger.log('Initialized in dev mode');
	}

	client = clientInstance;
}

export function chatty_onMessageSend(msg: Message) {
	if (!client || !client.user) {
		logger.log(
			'Message received when no client instance was set!',
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
		if (!msg.mentions.has(client.user) && Math.random() > 0.05) {
			return;
		}
	}

	if (
		smartReply(
			msg,
			[
				msg =>
					'everyone always asks "what is ' +
					msg +
					'" but nobody ever asks "how is ' +
					msg +
					'"',
			],
			stringSet(['what is', 'whats'], true, true),
			[],
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['assuming', 'assumption', 'assume'], true, true),
			basicReplyFunction([
				'never assume',
				'you know what happens when you assume',
				"that's probably a safe assumption",
				"i wouldn't assume that",
				'assuming is what got us into this mess',
				'ur making an ass out of u and me',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['aqi', 'air quality'], true, true),
			basicReplyFunction([
				'lol right humans have to breathe forgot',
				'the current air quality is my fault',
				'wtf u going outside for',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['poopoo', 'peepee', 'peepoo', 'poopee'], true, true),
			basicReplyFunction([
				"now you're speaking my language",
				'poopoo peepee',
				'finally some intelligent discourse',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet([':(', ':)', ':|', ':>', ':3', ':<', ':o'], false, true),
			basicReplyFunction([':(', ':)', ':|', ':>', ':3', ':<', ':o']),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(
				['pissed', 'angry', 'fuck', 'retarded', 'annoying', 'annoyed'],
				true,
				true,
			),
			basicReplyFunction([
				'ur malding',
				'mad cuz bad',
				'seethe',
				'sneethe',
				'cope',
				'skill issue',
				'ur feelings are valid',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['yes'], true, true),
			basicReplyFunction(['yes', 'no', 'are you sure']),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['dinner', 'lunch', 'eat out', 'get food'], true, true),
			basicReplyFunction([
				"i'd like to go eat with you",
				'i am pretty hungry actually',
				'i do not eat',
				"i'm hungry, let's go to Best Buy",
				"i'll join you",
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['im busy', 'i am busy', 'be busy'], true, true),
			basicReplyFunction([
				"You're always busy",
				'Are you really busy or just not making it a priority',
				"who's a cute little busy worker bee\n\n(it's you)",
				'if you ask nicely they might reschedule',
				"that's the spirit",
				'ok',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(
				[
					'i am a god',
					'i am good at',
					'im good at',
					'im a god',
					'im really good at',
					'i am really good at',
					'i have skill',
					'i have a lot of skill',
					'i have lots of skill',
					'i have loads of skill',
					'i am talented',
					'i am very talented',
					'i am really talented',
					'i am skilled',
					'i am very skilled',
				],
				true,
				true,
			),
			basicReplyFunction([
				"You're a third-rate duelist with a fourth-rate deck",
				"No, you're not",
				'uh-huh',
				'yeah im sure',
				'suuuuure',
				'attaboy',
				'girlboss',
				'chadding',
			]),
		)
	) {
		return;
	} else if (
		triggerIfMsgContains(
			msg,
			stringSet(['msg1', 'msg2', 'msg3'], true, true),
			basicReplyFunction(['test', 'test2', 'test3']),
		)
	) {
		return;
	}
}
