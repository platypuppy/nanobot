const { serverLog } = require('../groche-channels.json');
import { Logger, WarningLevel } from './logger';
import { Client, Message } from 'discord.js';
import { check_xkcd, init_xkcd } from './feeds/xkcd';
import * as cron from 'cron';
import { check_normie, init_normie } from './feeds/normie';
import { check_smbc, init_smbc } from './feeds/smbc';

const devMode = false;

let client: Client;

let logger: Logger = new Logger('daily', WarningLevel.Warning);

interface Job {
	init: (clientInstance: Client) => void;
	schedule: string;
	callback: () => void;
	name: string;
	options: JobOptions;
}

class JobOptions {
	enabled: boolean = true;
	runOnStart: boolean = false;
}

function make_job(
	schedule: string,
	init: (clientInstance: Client) => void,
	callback: () => void,
	name: string,
	options?: JobOptions,
): Job {
	return {
		schedule: schedule,
		init: init,
		callback: callback,
		name: name,
		options: options ?? new JobOptions(),
	};
}

function run_job(job: Job) {
	try {
		logger.log('running job ' + job.name, WarningLevel.Notice);
		job.callback();
	} catch (err: any) {
		logger.log(
			'Caught exception running job ' + job.name + ': ' + (err as Error).name,
			WarningLevel.Error,
		);
		logger.log('Error details: ' + (err as Error).message, WarningLevel.Error);
		logger.log((err as Error).stack, WarningLevel.Error);
	}
}

// https://crontab.guru/#*_*_*_*_*
// useful resource for writing cron schedules
const jobs: Job[] = [
	make_job('25 11 * * *', init_xkcd, check_xkcd, 'XKCD'),
	make_job('40 7,9,18,23 * * *', init_normie, check_normie, 'normie'),
	make_job('35 14 * * *', init_smbc, check_smbc, 'SMBC'),
];

let activeJobs: cron.CronJob[] = [];

export async function daily_init(clientInstance: Client) {
	client = clientInstance;

	jobs.forEach(job => {
		logger.log('initializing ' + job.name);
		job.init(client);

		if (job.options.enabled) {
			activeJobs.push(
				new cron.CronJob(job.schedule, () => {
					run_job(job);
				}),
			);
		}

		if (job.options.runOnStart) {
			run_job(job);
		}
	});

	activeJobs.forEach(job => job.start());

	logger.log('finished starting with ' + activeJobs.length + ' active jobs');
}
