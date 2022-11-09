import { Client as TwitterClient } from 'twitter-api-sdk';
import { Client as DiscordClient, Message, TextChannel } from 'discord.js';
import { twitterBearerToken } from '../tokens.json';
import { Logger, WarningLevel } from './logger';
import { registerMessageListener } from '..';
import isUrl from 'is-url';

let discordClient: DiscordClient;
let twitterClient: TwitterClient;

const logger: Logger = new Logger('twitfix', WarningLevel.Notice);

export async function twitfix_init(clientInstance: DiscordClient) {
	discordClient = clientInstance;
	twitterClient = new TwitterClient(twitterBearerToken);

	registerMessageListener(onMessageSend);

	logger.log('Initialized twitfix');
}

async function handleTweets(channel: TextChannel, postIds: string[]) {
	postIds.forEach(post => {
		logger.log(post);
	});
}

async function onMessageSend(msg: Message) {
	// determine if message contains twitter link
	// first split message into words (URLs can't have spaces or newlines)
	let words = msg.content.split('\n').join(' ').split(' ');

	let discoveredTweets: string[] = [];

	words.forEach(word => {
		// check whether word is a valid URL
		if (isUrl(word)) {
			let parsedUrl = new URL(word);
			// if it and it's from twitter.com, handle it
			if (parsedUrl.hostname == 'twitter.com') {
				discoveredTweets.push(parsedUrl.pathname);
			}
		}
	});

	if (discoveredTweets.length > 0) {
		handleTweets(msg.channel as TextChannel, [
			// remove duplicates
			...new Set(
				discoveredTweets.map(path => {
					// extract the post ID from the path
					return path.substring(path.lastIndexOf('/') + 1);
				}),
			),
		]);
	}
}
