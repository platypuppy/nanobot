import { Client as DiscordClient, EmbedBuilder, TextChannel } from 'discord.js';
import { Logger, WarningLevel } from '../logger';

import {
	serverLog,
	comfyposting,
	comfypostingFeed,
} from '../../groche-channels.json';

import {
	TwitterApi,
	TwitterApiReadOnly,
	TweetUserTimelineV2Paginator,
	TweetV2HomeTimelineResult,
} from 'twitter-api-v2';

import { twitterBearerToken } from '../../tokens.json';
import {
	getDiscordEmbedsFromImageTweet,
	isUrlDomain,
	readCacheFileAsJson,
	Tweet,
	TweetMediaItem,
	twitterTweetsToTweets,
	writeCacheFile,
} from '../util';

let discordClient: DiscordClient;
let twitterClient: TwitterApiReadOnly;

const logger: Logger = new Logger('feeds/twitfollow', WarningLevel.Notice);

interface FollowSettings {
	lastPost: string;
	channelTarget: string;
	vettingChannel?: string;
}

let userCache: {
	[key: string]: FollowSettings;
} = {};

function updateCacheFile() {
	writeCacheFile('twitfollow.json', Buffer.from(JSON.stringify(userCache)));
}

function followUser(
	userId: string,
	lastPost: string,
	channelTarget: string,
	vettingChannel?: string,
) {
	if (userCache.hasOwnProperty(userId)) return;
	userCache[userId] = {
		lastPost: lastPost,
		channelTarget: channelTarget,
		vettingChannel: vettingChannel,
	};
	updateCacheFile();
}

export async function init_twitfollow(clientInstance: DiscordClient) {
	discordClient = clientInstance;
	twitterClient = new TwitterApi(twitterBearerToken).readOnly;

	// load followed users and latest-post info from cache
	let uCache = readCacheFileAsJson('twitfollow.json');

	if (uCache) {
		userCache = uCache;
	} else {
		logger.log(
			'no followed users found, this module will do nothing',
			WarningLevel.Warning,
		);
	}

	followUser('16298441', '0', '361329886356439051');

	logger.log('Initialized twitfollow');
}

function twitterTimelineTweetsToTweets(
	timeline: TweetUserTimelineV2Paginator,
): Tweet[] {
	let builtTweets: Tweet[] = [];
	timeline.tweets.forEach(tweet => {
		let newTweet = new Tweet();

		newTweet.tweetId = tweet.id;
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

		if (tweet.created_at) {
			newTweet.creationDate = new Date(tweet.created_at);
		}

		if (tweet.attachments) {
			tweet.attachments.media_keys?.forEach(key => {
				let media = timeline.includes.media.find(
					media => media.media_key === key,
				);
				if (media) {
					if (media.type === 'video') {
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
								const extraParamsLoc = curUrl.lastIndexOf('?');
								newTweet.embedVideos.push(
									extraParamsLoc === -1
										? curUrl
										: curUrl.substring(0, extraParamsLoc),
								);
							}
						}
					} else if (media.type === 'photo') {
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

		let userObj = timeline.includes.users.find(
			user => user.id === tweet.author_id,
		);
		if (userObj) {
			newTweet.author.profilePic = userObj.profile_image_url ?? '';
			newTweet.author.handle = userObj.username;
			newTweet.author.name = userObj.name;
		}

		newTweet.postUrl =
			'https://twitter.com/' +
			(newTweet.author.handle === '' ? 'twitter' : newTweet.author.handle) +
			'/status/' +
			tweet.id;

		builtTweets.push(newTweet);
	});

	return builtTweets;
}

async function grabPosts(
	userId: string,
	settings: FollowSettings,
): Promise<Tweet[]> {
	const rawData = await twitterClient.v2.userTimeline(userId, {
		exclude: ['replies', 'retweets'],
		expansions: ['attachments.media_keys', 'author_id'],
		'media.fields': ['media_key', 'type', 'url', 'variants'],
		'tweet.fields': ['attachments', 'author_id', 'created_at', 'id', 'text'],
		'user.fields': ['id', 'name', 'username', 'profile_image_url'],
		max_results: 5,
		since_id: settings.lastPost,
	});

	if (!rawData.data) {
		rawData.errors?.forEach(e => {
			logger.log(e.title, WarningLevel.Error);
			logger.log(e.detail, WarningLevel.Error);
		});
		logger.log('failed to resolve tweets', WarningLevel.Error);
		return [];
	}

	if (rawData.data.errors) {
		rawData.data.errors.forEach(e => {
			logger.log(e.title, WarningLevel.Error);
			logger.log(e.detail, WarningLevel.Error);
		});
		logger.log('failed to resolve tweets', WarningLevel.Error);
		return [];
	}

	return twitterTimelineTweetsToTweets(rawData);
}

async function submitPost(tweet: Tweet, settings: FollowSettings) {
	let candidateChannel: TextChannel = discordClient.channels.resolve(
		settings.channelTarget,
	) as TextChannel;

	if (tweet.embedVideos.length > 0) {
		// video tweet
		candidateChannel.send(
			tweet.postUrl.replace('twitter.com', 'vxtwitter.com'),
		);
	} else if (tweet.embedImages.length > 0) {
		// image tweet
		candidateChannel.send({ embeds: getDiscordEmbedsFromImageTweet(tweet) });
	} else {
		candidateChannel.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(tweet.textContent === '' ? null : tweet.textContent)
					.setAuthor({
						name: tweet.author.name + '(@' + tweet.author.handle + ')',
						iconURL: tweet.author.profilePic,
					})
					.setFooter({
						text: 'Twitter',
						iconURL: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
					})
					.setTimestamp(tweet.creationDate),
			],
		});
	}
}

function submitCandidate(tweet: Tweet, settings: FollowSettings) {
	if (!settings.vettingChannel) {
		submitPost(tweet, settings);
	} else {
		submitPost(tweet, settings);
	}
}

export async function check_twitfollow() {
	let updateCache: boolean = false;
	for (const user in userCache) {
		if (Object.prototype.hasOwnProperty.call(userCache, user)) {
			const element = userCache[user];
			const tweets = await grabPosts(user, element);
			let maxId = element.lastPost;
			tweets.forEach(tweet => {
				if (tweet.tweetId > maxId) {
					maxId = tweet.tweetId;
				}
				submitCandidate(tweet, element);
			});

			if (maxId !== element.lastPost) {
				userCache[user].lastPost = maxId;
				updateCache = true;
			}
		}
	}

	if (updateCache) {
		updateCacheFile();
	}
}
