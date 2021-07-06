import { ApplicationCommandData, Client, Intents, MessageOptions } from 'discord.js'
import { promises as fs } from 'fs'
import { config } from 'dotenv'
import { objectEqual } from '@dzeio/object-util'
import { posix as path } from 'path'
import ApplicationCommand, { Inputs } from './Components/ApplicationCommand'
import Message from './Components/Message'

console.log('Loading...')

// Fetch env
config()

const PREFIX = process.env.PREFIX ?? 'TCGdex'

const ERROR_MESSAGE = new Message('there was an error trying to execute that command!')

// Load client
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]})

// Commands by their names
const commands: Record<string, ApplicationCommand> = {}

// When client has loaded
client.on('ready', async () => {
	// Fetch commands
	const files = await fs.readdir(path.join(__dirname, './Commands')).then((f) => f.filter((v) => (v.endsWith('ts') || v.endsWith('js'))))

	if (!client.application || !client.user) {
		throw new Error('Client vars are not set')
	}

	// Fetch Discord loaded commands
	const existingCommands: Record<string, ApplicationCommandData> = {}
	await client.application.commands.fetch().then((cmds) => cmds.forEach((c) => {
		existingCommands[c.name] = c
	}))

	// Load commands
	for (const file of files) {
		const cmd: ApplicationCommand = new (await import(`./Commands/${file}`)).default()

		// Validate commands
		cmd.validate()

		// Add command to memory
		commands[cmd.definition.name] = cmd

		// fill options with what Discord autofill
		const discordJSDefinition = cmd.definitionToDiscordJS()
		const options = discordJSDefinition.options?.map((o) => ({choices: undefined, options: undefined, ...o})) ?? []

		// check if we need to update the command on Discord
		const needUpdate = existingCommands[cmd.definition.name] && !objectEqual({
			name: existingCommands[cmd.definition.name].name,
			description: existingCommands[cmd.definition.name].description,
			options: existingCommands[cmd.definition.name].options
		}, {...discordJSDefinition, options})

		// Add missing slash commands
		if (Object.keys(existingCommands).includes(cmd.definition.name) && needUpdate) {
			console.log('Command', cmd.definition.name, 'Need to be updated')
			await client.application.commands.set([discordJSDefinition])
		} else if (!Object.keys(existingCommands).includes(cmd.definition.name)) {
			console.log('Command', cmd.definition.name, 'Was not found, Adding to Discord')
			await client.application.commands.create(discordJSDefinition)
		}
	}

	// Fetch guilds count and display it
	const size = await client.guilds.fetch()
	client.user.setPresence({
		activities: [{name: `${size.size} servers | ${PREFIX} help`, type: "LISTENING"}]
	})

	console.log(`Loaded, Logged in as ${client.user.tag}`)
})

// Handle Slash commands
client.on('interaction', async (interaction) => {
	// prepare input
	const inputs: Partial<Inputs> = {
		commands,
		prefix: '/',
		client,
		guild: interaction.guild
	}

	// handle buttons and selects
	if (interaction.isMessageComponent()) {

		// Get args and command
		let args: Array<string> = []
		args = interaction.customID.split(' ')

		if (interaction.isSelectMenu()) {
			args.push(...(interaction.values ?? []))
		}

		const command = args.shift()
		inputs.args = args

		if (!command) {
			return
		}

		// Get the original message
		try {

			// Process and edit the original message
			const response = await commands[command].processCommand(inputs as Inputs, 'interaction')
			interaction.update(response.toDiscordJS())
		} catch (e) {
			interaction.update(ERROR_MESSAGE.toDiscordJS())
		}
		return

	// Process commands
	} else if (interaction.isCommand()) {
		const cmd = commands[interaction.commandName]

		// Use definition options to fill the args
		inputs.args = cmd.definition.options?.map((o) => interaction.options.get(o.name)?.value?.toString()).filter((v) => typeof v !== 'undefined') as Array<string> ?? []
		try {

			// Process and reply to the message
			const response = await cmd.processCommand(inputs as Inputs, 'interaction')
			interaction.reply(response.toDiscordJS())
		} catch (e) {
			console.error(e)
			interaction.reply(ERROR_MESSAGE.toDiscordJS())
		}
		return
	}


})

client.on('message', async (message) => {
	// Ignore message by bots
	if (message.author.bot) {
		return
	}

	// Get the prefix
	const args = message.content.trim().split(/ +/)
	const prefix = args.shift()

	// ignore message not started by the bot's name or PREFIX
	if (!prefix || !client.user || !(prefix.toLowerCase() === PREFIX.toLowerCase()) && !(prefix === `<@!${client.user.id}>`)) {
		return
	}

	// Get the command
	const command = args.length > 0 ? args.shift()?.toLowerCase() : 'help'

	// ignore message if the command does not exist
	if (!command || !commands[command]) return;

	const c = await message.channel.fetch()

	// Handle command like a slash command
	try {
		const msg = await message.reply('<a:typing:861888874404773888> Sending Command...')
		try {
			// Process and edit the original message
			const response = await commands[command].processCommand({
				commands,
				args,
				prefix,
				client,
				guild: message.guild
			}, 'message')
			await msg.edit(response.toDiscordJS())
		} catch (error) {
			console.error(error);
			await msg.edit(ERROR_MESSAGE.toDiscordJS());
		}
	} catch (e) {
		console.log(e)
		console.log('User do not have the permission to write in this channel')
		message.author.send('It seems I can\'t reply in the channel 😅, please contact an administrator or change my permissions to have `Send Messages`, `Read Message History` and `Use External Emojis`')
	}
});

// Load the bot :D
client.login(process.env.TOKEN)
