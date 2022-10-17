import RssParser from 'rss-parser';
import { Logger, WarningLevel } from '../logger';
const { serverLog, grocheCentral } = require('../../groche-channels.json');
import HtmlParser from 'node-html-parser';
import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js';
import * as fs from 'fs';
import { Error } from '../util';
const { xkcdDBFolder, xkcdDBFile } = require('../../config/xkcd.json');
const xkcdCache: string = xkcdDBFolder + xkcdDBFile;

let rssParser: RssParser;
let logger: Logger = new Logger('feeds/xkcd', WarningLevel.Warning);

let client: Client;

export function init_xkcd(clientInstance: Client) {
	client = clientInstance;

	rssParser = new RssParser();
}

export async function check_xkcd() {
	if (!rssParser) {
		logger.log(
			'Tried to check for daily update when we were not initialized!',
			WarningLevel.Error,
		);
		return;
	}

	let feed = await rssParser.parseURL('https://xkcd.com/rss.xml');

	const todaysComic = feed.items[0];
	const listElements = HtmlParser.parse(
		todaysComic.content ?? '< />',
	).getElementsByTagName('img');

	if (listElements.length !== 1) {
		logger.log(
			'Number of elements matching img tag was ' +
				listElements.length +
				' but we expected one! Did the XKCD RSS syntax change?',
			WarningLevel.Error,
		);
		return;
	}

	const imgData = listElements[0];

	let imgUrl = imgData.getAttribute('src');
	let altText = imgData.getAttribute('alt');

	let pubDate = todaysComic.pubDate ? new Date(todaysComic.pubDate) : undefined;

	logger.log(todaysComic.title);
	logger.log(imgUrl);
	logger.log(altText);
	logger.log(todaysComic.guid);
	logger.log(pubDate ? pubDate.toString() : pubDate);

	// verify there's a comic to send
	if (!todaysComic.guid || !imgUrl) {
		logger.log(
			"No GUID and/or image URL for today's comic! It will be skipped!",
			WarningLevel.Error,
		);

		return;
	}

	// determine whether this comic was already sent

	let lastComic: string = '';

	try {
		lastComic = JSON.parse(fs.readFileSync(xkcdCache).toString()).lastComic;
	} catch (error: any) {
		//create new db file if it does not already exist
		if ((error as Error).code === 'ENOENT') {
			try {
				fs.writeFileSync(xkcdCache, JSON.stringify({ lastComic: '' }));
			} catch (error: any) {
				if ((error as Error).code === 'ENOENT') {
					fs.mkdirSync(xkcdDBFolder);
					fs.writeFileSync(xkcdCache, JSON.stringify({ lastComic: '' }));
				} else {
					logger.log(error, WarningLevel.Error);
				}
			}
		} else {
			logger.log(error, WarningLevel.Error);
		}
	}

	if (todaysComic.guid == lastComic) {
		return;
	}

	lastComic = todaysComic.guid;

	// write back to file

	try {
		fs.writeFileSync(xkcdCache, JSON.stringify({ lastComic: lastComic }));
	} catch (error: any) {
		logger.log(error, WarningLevel.Error);
		return;
	}

	// fix up any missing fields

	if (!altText) {
		logger.log("No alt text for today's comic!", WarningLevel.Warning);
		altText = '';
	}

	if (!pubDate) {
		logger.log(
			"No publish date for today's comic! Using today's date instead.",
			WarningLevel.Warning,
		);
		pubDate = new Date();
	}

	if (!todaysComic.title) {
		logger.log("No title for today's comic! ", WarningLevel.Warning);

		todaysComic.title = 'Untitled';
	}

	// send comic

	const channel = (await client.channels.fetch(
		grocheCentral,
	)) as TextBasedChannel;

	let explainUrl = todaysComic.guid.replace('xkcd', 'explainxkcd');

	let xkcdEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'xkcd',
			url: 'https://xkcd.com',
			iconURL: 'https://xkcd.com/s/0b7742.png',
		})
		.setFields([
			{
				name: todaysComic.title,
				value: '[Explain the joke](' + explainUrl + ')',
				inline: false,
			},
		])
		.setImage(imgUrl)
		.setTimestamp(pubDate)
		.setFooter({ text: altText });

	channel.send({ embeds: [xkcdEmbed] });
}
