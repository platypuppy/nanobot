import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js';
const { token } = require('./token.json');
const {
	grocheCentral,
	grocheBots,
	grocheGaming,
	comfyposting,
	worstImagesEver,
	music,
	originalContent,
} = require('./groche-channels.json');
import { stars_initialize, stars_onStarAdded } from './moron/stars';
import { chatty_init, chatty_onMessageSend } from './moron/chatty';
import { reactor_init, reactor_onMessageSend } from './moron/reactor';
import { Logger, WarningLevel } from './moron/logger';
import { daily_init } from './moron/daily';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	presence: {
		activities: [{ name: 'your mom', type: ActivityType.Competing }],
		status: 'dnd',
	},
	partials: [
		Partials.User,
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
	],
});

let logger: Logger = new Logger('core', WarningLevel.Notice);

client.once('ready', () => {
	// init modules

	reactor_init(client);
	chatty_init(client);
	daily_init(client);

	// all done

	logger.log('Bot started');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const { commandName } = interaction;
});

client.on('messageCreate', async msg => {
	if (!client.user || msg.author.id == client.user.id) return;

	if (msg.partial) {
		await msg.fetch();
	}

	chatty_onMessageSend(msg);
	reactor_onMessageSend(msg);
});

client.on('messageReactionAdd', async react => {
	if (react.me) return;

	if (react.partial) {
		await react.fetch();
	}

	stars_onStarAdded(client, react.emoji, react.message, react.count);
});

export let pinnedMessagesLoaded = stars_initialize();

client.login(token);
