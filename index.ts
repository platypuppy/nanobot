import {
	ActivityType,
	CacheType,
	Client,
	GatewayIntentBits,
	Interaction,
	Message,
	MessageReaction,
	Partials,
} from 'discord.js';
import { token } from './tokens.json';
import { Logger, WarningLevel } from './moron/logger';
import { chatty_init } from './moron/chatty';
import { reactor_init } from './moron/reactor';
import { daily_init } from './moron/daily';
import { stars_init } from './moron/stars';
import { twitfix_init } from './moron/twitfix';

export const forceTraceMode: boolean = true;

let logger: Logger = new Logger('core', WarningLevel.Notice);
logger.log('Bot starting...');

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

///
/// init
///

type InitCallback = (client: Client) => Promise<void>;

let initCallbacks: InitCallback[] = [
	stars_init,
	reactor_init,
	chatty_init,
	daily_init,
	twitfix_init,
];

client.once('ready', async () => {
	// init modules
	await Promise.allSettled(initCallbacks.map(cb => cb(client)));
	// all done

	logger.log('Bot started');
});

///
/// commands
///

type InteractionCallback = (
	message: Interaction<CacheType>,
) => Promise<boolean>;

let interactionCallbacks: InteractionCallback[] = [];

// return true in your listener if you handled the command successfully
// this ensures multiple different systems don't end up responding to the same command
export function registerInteractionListener(listener: InteractionCallback) {
	interactionCallbacks.push(listener);
}

client.on('interactionCreate', async interaction => {
	interactionCallbacks.every(cb => !cb(interaction));
});

///
/// messages
///

type MessageCallback = (message: Message<boolean>) => Promise<void>;

let messageCallbacks: MessageCallback[] = [];

export function registerMessageListener(listener: MessageCallback) {
	messageCallbacks.push(listener);
}

client.on('messageCreate', async msg => {
	if (!client.user || msg.author.id == client.user.id) return;

	if (msg.partial) {
		msg = await msg.fetch();
	}

	messageCallbacks.forEach(cb => cb(msg));
});

///
/// reactions
///

type ReactionCallback = (reaction: MessageReaction) => Promise<void>;

let reactionCallbacks: ReactionCallback[] = [];

export function registerReactionListener(listener: ReactionCallback) {
	reactionCallbacks.push(listener);
}

client.on('messageReactionAdd', async react => {
	if (react.me) return;

	if (react.partial) {
		react = await react.fetch();
	}

	reactionCallbacks.forEach(cb => cb(react as MessageReaction));
});

// get everything started

client.login(token);
