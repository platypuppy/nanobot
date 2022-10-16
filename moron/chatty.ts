import { Client, EmbedBuilder, Emoji, GuildEmoji, Message, MessageReplyOptions, MessageType, PartialMessage, ReactionEmoji, TextChannel } from 'discord.js';
import { StringMatch, doesMatch, stringSet } from './util';
const { serverLog } = require('../groche-channels.json');

// dev mode here makes the bot reply with 100% probability, and makes it only reply in serverLog
const devMode: boolean = false;

function triggerIfMsgContains(msg: Message, triggerStrings: StringMatch[], callback: (msg: Message, whichPhrase: string) => void): boolean
{
	let didTrigger: boolean = false;

	triggerStrings.every(match => {
		if (doesMatch(msg.content, match))
		{
			callback(msg, match.match);
			didTrigger = true;
			return false;
		}
		return true;
	});

	return didTrigger;
}


function basicReplyFunction(replyList: string[]): (msg: Message) => void
{
	return (msg: Message) => {
		msg.reply({
			content: replyList[Math.floor(Math.random() * replyList.length)],
			allowedMentions: {
				repliedUser: false
			}
		});
	}
}

let client: Client;

export function chatty_initialize(clientInstance: Client)
{
	client = clientInstance;
}

export function chatty_onMessageSend(msg: Message) {
	if (!client || !client.user)
	{
		console.log('[moron/chatty] [ERROR] Message received when no client instance was set!');
		return;
	}

	if (devMode)
	{
		if (msg.channelId !== serverLog)
		{
			return;
		}
	}

	if (!devMode)
	{
		if (!msg.mentions.has(client.user) && Math.random() > 0.05)
		{
			return;
		}
	}

	if(triggerIfMsgContains(msg, stringSet([
			'assuming',
			'assumption',
			'assume'
	], true, true), basicReplyFunction([
		'never assume',
		'you know what happens when you assume',
		'that\'s probably a safe assumption',
		'i wouldn\'t assume that',
		'assuming is what got us into this mess',
		'ur making an ass out of u and me'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'aqi',
		'air quality'
	], true, true), basicReplyFunction([
		'lol right humans have to breathe forgot',
		'the current air quality is my fault',
		'wtf u going outside for'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'poopoo',
		'peepee',
		'peepoo',
		'poopee'
	], true, true), basicReplyFunction([
		'now you\'re speaking my language',
		'poopoo peepee',
		'finally some intelligent discourse'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		':(',
		':)',
		':|',
		':>'
	], false, true), basicReplyFunction([
		':)',
		':(',
		':|'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'fuck off',
		'pissed',
		'angry',
		'fuck',
		'retarded',
		'annoying',
		'annoyed',
		'skill issue'
	], true, true), basicReplyFunction([
		'ur malding',
		'mad cuz bad',
		'seethe',
		'sneethe',
		'cope',
		'ur feelings are valid'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'yes',
	], true, true), basicReplyFunction([
		'yes',
		'no',
		'are you sure'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'dinner',
		'lunch',
		'eat out',
		'get food'
	], true, true), basicReplyFunction([
		'i\'d like to go eat with you',
		'i am pretty hungry actually',
		'i do not eat',
		'i\'m hungry, let\'s go to Best Buy',
		'i\'ll join you'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'msg1',
		'msg2',
		'msg3'
	], true, true), basicReplyFunction([
		'test',
		'test2',
		'test3'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'msg1',
		'msg2',
		'msg3'
	], true, true), basicReplyFunction([
		'test',
		'test2',
		'test3'
	]))) {
		return;
	}
	else if (triggerIfMsgContains(msg, stringSet([
		'msg1',
		'msg2',
		'msg3'
	], true, true), basicReplyFunction([
		'test',
		'test2',
		'test3'
	]))) {
		return;
	}
}