const { serverLog } = require('../groche-channels.json');
import { Logger, WarningLevel } from './logger';
import { Client, Message } from 'discord.js';
import { check_xkcd, init_xkcd } from './feeds/xkcd';
import * as cron from 'cron';

const devMode = false;

let client: Client;

let logger: Logger = new Logger('daily', WarningLevel.Notice);

export function daily_init(clientInstance: Client) {
	client = clientInstance;

	// set up scheduling
	// https://crontab.guru/#*_*_*_*_*
	// useful resource for writing cron tags

	let dailySchedule = new cron.CronJob('00 12 * * 1,3,5', () => {
		logger.log('running daily job', WarningLevel.Notice);
		check_xkcd();
	});

	dailySchedule.start();

	init_xkcd(client);
}
