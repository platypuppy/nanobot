const { serverLog } = require('../groche-channels.json');
import { Logger, WarningLevel } from './logger';
import { Client, Message } from 'discord.js';
import { check_xkcd, init_xkcd } from './feeds/xkcd';
import * as cron from 'cron';
import { check_normie, init_normie } from './feeds/normie';

const devMode = false;

let client: Client;

let logger: Logger = new Logger('daily', WarningLevel.Warning);

export function daily_init(clientInstance: Client) {
	client = clientInstance;

	// set up scheduling
	// https://crontab.guru/#*_*_*_*_*
	// useful resource for writing cron tags

	let xkcd = new cron.CronJob('05 12 * * *', () => {
		logger.log('running XKCD job', WarningLevel.Notice);
		check_xkcd();
	});

	let normie = new cron.CronJob('30 8,10,18 * * *', () => {
		logger.log('running normie job', WarningLevel.Notice);
		check_normie();
	});

	xkcd.start();
	normie.start();

	init_xkcd(client);
	init_normie(client);
}
