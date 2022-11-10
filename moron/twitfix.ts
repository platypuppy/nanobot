import { Client as TwitterClient } from 'twitter-api-sdk';
import {
	APIEmbed,
	AttachmentBuilder,
	Client as DiscordClient,
	EmbedBuilder,
	Message,
	TextChannel,
} from 'discord.js';
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

export class User {
	name: string = 'unknown';
	handle: string = '';
	profilePic: string = '';
}

export class Tweet {
	author: User = new User();
	tweetId: string = '0';
	textContent: string = '';
	creationDate: Date = new Date();

	embedVideos: string[] = [];
	embedImages: string[] = [];

	postUrl: string = 'about:blank';
}

// manually specify official twitter api interface because the TS library doesn't have it for some reason
interface TweetMediaVariant {
	bit_rate?: number;
	content_type: string;
	url: string;
}

interface TweetMediaItem {
	//public_metrics: TweetPublicMetrics
	type: string;
	media_key: string;

	variants?: TweetMediaVariant[];
	alt_text?: string;
	width?: number;
	height?: number;
	duration_ms?: number;
	preview_image_url?: string;
	url?: string;
}

function isUrlDomain(text: string, domain: string): boolean {
	if (isUrl(text)) {
		const url = new URL(text);
		if (url.hostname == domain) return true;
		return false;
	}
	return false;
}

async function handleVideoEmbed(vidUrl: string, msgRespond: Message) {
	msgRespond.channel.send({
		embeds: [new EmbedBuilder().setImage(vidUrl).setTitle('test')],
	});
}

function getDiscordEmbedsFromImageTweet(tweet: Tweet) {
	let imgEmbeds: EmbedBuilder[] = [];
	tweet.embedImages.forEach(img => {
		imgEmbeds.push(
			new EmbedBuilder()
				.setDescription(tweet.textContent)
				.setAuthor({
					name: tweet.author.name + '(@' + tweet.author.handle + ')',
					iconURL: tweet.author.profilePic,
				})
				.setImage(img)
				.setURL(tweet.postUrl)
				.setTitle('View on Twitter')
				.setFooter({
					text: 'Twitter',
					iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
				})
				.setTimestamp(tweet.creationDate),
		);
	});

	return imgEmbeds;
}

async function handleTweets(
	msg: Message,
	postIds: string[],
	postURLs: string[],
) {
	const { data, includes, errors } = await twitterClient.tweets.findTweetsById({
		ids: postIds,
		'tweet.fields': ['attachments', 'author_id', 'created_at'],
		expansions: ['attachments.media_keys', 'author_id'],
		'media.fields': [
			'alt_text',
			'duration_ms',
			'url',
			'public_metrics',
			'variants',
			'type',
		],
		'user.fields': ['username', 'name', 'profile_image_url', 'verified'],
	});

	if (!data) {
		errors?.forEach(e => {
			logger.log(e.title, WarningLevel.Error);
			logger.log(e.detail, WarningLevel.Error);
		});
		logger.log('failed to resolve tweets', WarningLevel.Error);
		return;
	}

	let builtTweets: Tweet[] = [];

	data.forEach(tweet => {
		let newTweet = new Tweet();

		// post ID is straightforward
		newTweet.tweetId = tweet.id;

		// filter out possible t.co link in tweet text
		newTweet.textContent = tweet.text
			.split(' ')
			.map(word => (isUrlDomain(word, 't.co') ? '' : word))
			.filter(e => e.length > 0)
			.join(' ')
			.split('\n')
			.map(word => (isUrlDomain(word, 't.co') ? '' : word))
			.filter(e => e.length > 0)
			.join('\n')
			.trim();

		// set creation date if known
		if (tweet.created_at) {
			newTweet.creationDate = new Date(tweet.created_at);
		}

		//

		// add media embed URLs
		if (includes) {
			if (includes.media) {
				if (tweet.attachments) {
					// attempt to match attachments from includes to tweet
					tweet.attachments.media_keys?.forEach(key => {
						let media = includes.media?.find(
							media => media.media_key == key,
						) as TweetMediaItem;
						if (media) {
							if (media.type == 'video') {
								// find the video variant with the highest bitrate
								if (media.variants) {
									let curBitRate = 0;
									let curUrl = '';
									media.variants.forEach(variant => {
										if (variant.bit_rate) {
											if (variant.bit_rate > curBitRate) {
												curUrl = variant.url;
												curBitRate = variant.bit_rate;
											}
										}
									});

									if (curUrl !== '') {
										newTweet.embedVideos.push(curUrl);
									}
								}
							} else if (media.type == 'photo') {
								if (media.url) {
									newTweet.embedImages.push(media.url);
								}
							} else {
								logger.log(
									'unknown media type: ' + media.type,
									WarningLevel.Warning,
								);
							}
						}
					});
				}
			}
		}

		builtTweets.push(newTweet);
	});

	builtTweets.forEach(tweet => {
		logger.log('-----');
		logger.log('tweet: ');
		logger.log('postID: ' + tweet.tweetId);
		logger.log('message: ' + tweet.textContent);
		tweet.embedVideos.forEach(vid => logger.log(vid));
		tweet.embedImages.forEach(img => logger.log(img));

		tweet.embedVideos.forEach(vid => handleVideoEmbed(vid, msg));

		//let imgEmbeds = getDiscordEmbedsFromImageTweet(tweet);

		//if (imgEmbeds.length > 0) {
		// msg.channel.send({ embeds: imgEmbeds });
		//}
	});
}

async function onMessageSend(msg: Message) {
	if (!discordClient) {
		logger.log('Discord client not initialized!', WarningLevel.Error);
		return;
	}
	if (!twitterClient) {
		logger.log('Twitter client not initialized!', WarningLevel.Error);
		return;
	}

	// determine if message contains twitter link
	// first split message into words (URLs can't have spaces or newlines)
	let words = msg.content.split('\n').join(' ').split(' ');

	let discoveredTweets: string[] = [];

	words.forEach(word => {
		// check whether word is a valid URL
		if (isUrl(word)) {
			let parsedUrl = new URL(word);
			// if it and it's from twitter.com, handle it
			if (parsedUrl.hostname === 'twitter.com') {
				discoveredTweets.push(parsedUrl.pathname);
			}
		}
	});

	if (discoveredTweets.length > 0) {
		handleTweets(
			msg,
			[
				// remove duplicates
				...new Set(
					discoveredTweets.map(path => {
						// extract the post ID from the path
						return path.substring(path.lastIndexOf('/') + 1);
					}),
				),
			],
			[
				...new Set(
					discoveredTweets.map(path => {
						return 'https://twitter.com/' + path;
					}),
				),
			],
		);
	}
}
