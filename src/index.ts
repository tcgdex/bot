import { ApplicationCommand, Client, Guild, Intents, MessageOptions } from 'discord.js'
import MessageManager from './Components/MessageManager'
import { promises as fs } from 'fs'
import { Command, Inputs } from './interfaces'
import { config } from 'dotenv'
import { objectEqual } from '@dzeio/object-util'
import { posix as path} from 'path'
console.log('Loading...')

// Fetch env
config()

const PREFIX = process.env.PREFIX ?? 'TCGdex'

const ERROR_MESSAGE: MessageOptions = {content: 'there was an error trying to execute that command!', embeds: [], components: []}

// Load client
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]})

// Commands by their names
const commands: Record<string, Command> = {}

// When client has loaded
client.on('ready', async () => {
	// Fetch commands
	const files = await fs.readdir(path.join(__dirname, './Commands'))

	if (!client.application || !client.user) {
		throw new Error('Client vars are not set')
	}

	// Fetch Discord loaded commands
	const existingCommands: Record<string, ApplicationCommand> = {}
	await client.application.commands.fetch().then((cmds) => cmds.forEach((c) => {
		existingCommands[c.name] = c
	}))

	// Load commands
	for (const file of files) {
		const cmd: Command = (await import(`./Commands/${file}`)).default

		// Add command to memory
		commands[cmd.definition.name] = cmd

		// fill options with what Discord autofill
		const options = cmd.definition.options?.map((o) => ({choices: undefined, options: undefined, ...o})) ?? []

		// check if we need to update the command on Discord
		const needUpdate = existingCommands[cmd.definition.name] && !objectEqual({
			name: existingCommands[cmd.definition.name].name,
			description: existingCommands[cmd.definition.name].description,
			options: existingCommands[cmd.definition.name].options
		}, {...cmd.definition, options})

		// Add missing slash commands
		if (Object.keys(existingCommands).includes(cmd.definition.name) && needUpdate) {
			console.log('Command', cmd.definition.name, 'Need to be updated')
			await client.application.commands.set([cmd.definition])
		} else if (!Object.keys(existingCommands).includes(cmd.definition.name)) {
			console.log('Command', cmd.definition.name, 'Was not found, Adding to Discord')
			await client.application.commands.create(cmd.definition)
		}
	}

	// Fetch guilds count and display it
	const size = await client.guilds.fetch()
	client.user.setPresence({
		activities: [{name: `${size.size} servers | TCGdex help`, type: "LISTENING"}]
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

		// Defer to allow completion and edition
		await interaction.defer()

		// Get args and command
		let args: Array<string> = []
		args = interaction.customID.split(' ')

		if (interaction.isSelectMenu()) {
			args.push(...(interaction.values ?? []))
		}

		const command = args.shift()
		inputs.args = args

		if (!interaction.channel || !command) {
			return
		}

		// Get the original message
		const msg = await interaction.channel.messages.fetch(interaction.message.id)
		try {

			// Process and edit the original message
			const response = await MessageManager.processCommand(commands[command], inputs as Inputs, 'message')
			msg.edit(response.toDiscordJS())
		} catch (e) {
			msg.edit(ERROR_MESSAGE)
		}
		try {
			await interaction.deleteReply()
		} catch {}
		return

	// Process commands
	} else if (interaction.isCommand()) {
		const cmd = commands[interaction.commandName]

		// Use definition options to fill the args
		inputs.args = cmd.definition.options?.map((o) => interaction.options.get(o.name)?.value?.toString()).filter((v) => typeof v !== 'undefined') as Array<string> ?? []
		try {

			// Process and reply to the message
			const response = await MessageManager.processCommand(cmd, inputs as Inputs, 'message')
			interaction.reply(response.toDiscordJS())
		} catch (e) {
			console.error(e)
			interaction.reply(ERROR_MESSAGE)
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
	const command = args.shift()?.toLowerCase()

	// ignore message if the command does not exist
	if (!command || !commands[command]) return;

	// Handle command like a slash command
	const msg = await message.reply('TCGdex is thinking...')
	try {
		// Process and edit the original message
		const response = await MessageManager.processCommand(commands[command], {
			commands,
			args,
			prefix,
			client,
			guild: message.guild
		}, 'message')
		await msg.edit(response.toDiscordJS())
	} catch (error) {
		console.error(error);
		await msg.edit(ERROR_MESSAGE);
	}
});

// Load the bot :D
client.login(process.env.TOKEN)
