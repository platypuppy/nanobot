import { Client, TextChannel } from 'discord.js';
import { Logger, WarningLevel } from '../logger';
import * as request from 'request';
import * as channels from '../../groche-channels.json';

const logger: Logger = new Logger('feeds/normie', WarningLevel.Warning);

let client: Client;

export function init_normie(clientInstance: Client) {
	client = clientInstance;
}

const apiUrl: string = 'https://meme-api.herokuapp.com/gimme';

async function postReceived(jsonData: any) {
	logger.log(jsonData.url, WarningLevel.Notice);

	let chan = (await client.channels.fetch(
		channels.grocheCentral,
	)) as TextChannel;

	chan.send({
		embeds: [
			{
				image: { url: jsonData.url },
			},
		],
	});
}

export async function check_normie() {
	if (client === undefined) {
		logger.log('Normie was not initialized!', WarningLevel.Error);
	}

	request.get(
		{
			url: apiUrl,
			json: true,
			headers: { 'User-Agent': 'request' },
		},
		(err, res, data) => {
			if (err) {
				logger.log(err, WarningLevel.Error);
			} else if (res.statusCode !== 200) {
				logger.log(res.statusMessage, WarningLevel.Warning);
			} else {
				postReceived(data);
			}
		},
	);
}
