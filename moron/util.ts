import * as fs from 'fs';
import * as settings from '../config/general.json';
import { Logger, WarningLevel } from './logger';

///
/// set up logger for util functions
///

const logger: Logger = new Logger('utils', WarningLevel.Warning);

///
/// error override interface so we can get an actual error code
///

import {
	Channel,
	Guild,
	GuildEmoji,
	TextBasedChannel,
	VoiceBasedChannel,
	VoiceChannel,
} from 'discord.js';

//i shouldn't have to do this
export declare interface Error {
	name: string;
	message: string;
	stack?: string;
	code?: number | string;
}

///
/// useful string-matching stuff, for message parsing
///

export class StringMatch {
	match: string = '';
	// ignores any character found in punctuationChars[] for comparison purposes
	ignorePunctuation: boolean = true;
	// converts both this string and whatever it's being compared to lower-case before comparison
	ignoreCapitalization: boolean = true;
}

// creates an array of stringmatches with the corresponding strings, all with the same stringmatch options
export function stringSet(
	matches: string[],
	ignorePunctuation: boolean,
	ignoreCapitalization: boolean,
): StringMatch[] {
	let results: StringMatch[] = [];
	matches.forEach(match => {
		results.push({
			match: match,
			ignorePunctuation: ignorePunctuation,
			ignoreCapitalization: ignoreCapitalization,
		});
	});

	return results;
}

const punctuationChars: string[] = [
	"'",
	'"',
	'.',
	',',
	'_',
	'-',
	'*',
	'&',
	'%',
	'$',
	'#',
	'@',
	'!',
	'`',
];
// not efficient but fast enough for our purposes
export function doesMatch(
	inputString: string,
	testString: StringMatch,
): boolean {
	let cmpString1: string = inputString;
	let cmpString2: string = testString.match;

	if (testString.ignoreCapitalization) {
		cmpString1 = cmpString1.toLowerCase();
		cmpString2 = cmpString2.toLowerCase();
	}

	if (testString.ignorePunctuation) {
		punctuationChars.forEach(char => {
			cmpString1.replace(char, '');
			cmpString2.replace(char, '');
		});
	}

	return cmpString1.includes(cmpString2);
}

///
/// emoji handling stuff
///

export async function getEmote(
	guild: Guild | null,
	emoteId: string,
): Promise<GuildEmoji | undefined> {
	if (!guild) return undefined;

	return await guild.emojis.fetch(emoteId);
}

// converts <:emote:1234567890> to 1234567890
export function emoteNameToId(emoji: string) {
	return emoji.substring(emoji.lastIndexOf(':') + 1, emoji.length - 1);
}

///
/// cache management simplified
///

function createCacheFile(filename: string) {
	try {
		fs.writeFileSync(settings.cacheDir + filename, '');
	} catch (error: any) {
		if ((error as Error).code === 'ENOENT') {
			fs.mkdirSync(settings.cacheDir);
			fs.writeFileSync(settings.cacheDir + filename, '');
		} else {
			logger.log(error, WarningLevel.Error);
		}
	}
}

export function writeCacheFile(filename: string, contents: Buffer) {
	try {
		fs.writeFileSync(settings.cacheDir + filename, contents);
	} catch (error: any) {
		if ((error as Error).code === 'ENOENT') {
			createCacheFile(filename);
			fs.writeFileSync(settings.cacheDir + filename, contents);
		}
	}
}

// reads the given filename from the configured cache directory
// (default ./db/)
// if the file does not exist, this will create an empty file with the given name and return an empty string
export function readCacheFile(filename: string): Buffer | undefined {
	try {
		return fs.readFileSync(settings.cacheDir + filename);
	} catch (error: any) {
		//create new db file if it does not already exist
		if ((error as Error).code === 'ENOENT') {
			createCacheFile(filename);
		} else {
			logger.log(error, WarningLevel.Error);
		}
		return undefined;
	}
}
