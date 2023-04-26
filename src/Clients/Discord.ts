import Logger from '@dzeio/logger'
import { objectValues } from '@dzeio/object-util'
import {
	ActivityType,
	BaseMessageOptions,
	ButtonComponentData,
	CacheType,
	ComponentType,
	Client as DiscordClient,
	Message as DiscordMessage,
	GatewayIntentBits,
	Interaction,
	MessageActionRowComponentData,
	MessagePayload,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore f*ck
	REST,
	Routes,
	StringSelectMenuComponentData
} from 'discord.js'
import Bot from '../Bot'
import Button from '../Components/Components/Button'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import { Client, CommandOptions, DiscordConfig, DiscordContext } from '../interfaces'

const logger = new Logger('Client/Discord')

export default class Discord implements Client {
	private client!: DiscordClient

	public constructor(
		private config: DiscordConfig
	) {}

	public get token(): string {
		const token = process.env.DISCORD_TOKEN
		if (!token) {
			throw new Error('Discord token not set')
		}
		return token
	}

	public get clientId(): string {
		const id = this.client.user?.id
		if (!id) {
			throw new Error('Could not get the user id')
		}
		return id
	}

	public get prefix(): string {
		return process.env.DISCORD_PREFIX ?? this.client.user?.username ?? 'Pouet'
	}

	public async init() {
		logger.log('Loading...')
		this.client = new DiscordClient({
			intents: this.config.intents?.map((it) => GatewayIntentBits[it as 'Guilds']) ?? []
		})

		this.client.on('ready', async () => {
			await this.refreshCommands()
			// Fetch guilds count and display it
			const size = await this.client.guilds.fetch()
			this.client.user?.setPresence({
				activities: [{name: `${size.size} servers | ${this.prefix} help`, type: ActivityType.Listening}]
			})


			logger.log(`Loaded, Logged in as ${this.client.user?.tag}`)
		})

		this.client.on('interactionCreate', this.onInteraction)

		this.client.on('messageCreate', this.onMessage)

		this.client.login(this.token)
	}

	private async refreshCommands() {
		const commands = await Bot.get().getCommands()
		const rest = new REST({ version: '10' }).setToken(this.token)

		rest.put(Routes.applicationCommands(this.clientId), {
			body: objectValues(commands).map((command) => ({
				name: command.name,
				description: command.description,
				options: command.options?.map(this.formatOption)
			}))
		})
	}

	private formatOption = (option: CommandOptions): any => ({
		type: option.type + 1,
		name: option.name,
		description: option.description,
		required: option.required,
		choices: option.choices,
		options: option.options?.map(this.formatOption)
	})

	private onMessage = async (message: DiscordMessage<boolean>) => {
		// Ignore message by bots
		if (message.author.bot) {
			return
		}

		// Get the prefix
		const args = message.content.trim().split(/ +/)
		let prefix = args.shift()

		// ignore message not started by the bot's name or PREFIX
		if (
			!prefix ||
			!this.client.user ||
			!(
				prefix.toLowerCase() === this.prefix.toLowerCase()
			) &&
			!(
				prefix === `<@!${this.client.user.id}>` ||
				prefix === `<@${this.client.user.id}>`
			)
		) {
			return
		}

		// Replace ths client user id by the username so it's easier to read
		if (prefix === `<@!${this.clientId}>` || prefix === `<@${this.clientId}>`) {
			// TODO: get the server nickname instead of the global username
			prefix = `@${this.client.user?.username}`
		}

		// Get the command
		const command = args.length > 0 ? args.shift()?.toLowerCase() : 'help'

		const commands = await Bot.get().getCommands()
		// ignore message if the command does not exist
		if (!command || !commands[command]) {
			return
		}

		// Handle command like a slash command
		try {
			const msg = await message.reply('<a:typing:861888874404773888> Sending Command...')
			try {
				// Process and edit the original message
				const response = await commands[command].execute(this.buildContext(prefix, command, args))
				await msg.edit(this.formatMessage(response))
				logger.log(`command processed: ${message.content}`)
			} catch (error) {
				logger.error(`error processing commands: ${message.content}`, error)
				await msg.edit('an error occured')
			}
		} catch (error) {
			logger.error(`error processing commands: ${message.content}`, error)
			logger.log('User do not have the permission to write in this channel')
			message.author.send('It seems I can\'t reply in the channel 😅, please contact an administrator or change my permissions to have `Send Messages`, `Read Message History` and `Use External Emojis`')
		}
	}

	private onInteraction = async (interaction: Interaction<CacheType>) => {
		const commands = await Bot.get().getCommands()

		// handle buttons and selects
		if (interaction.isMessageComponent()) {

			// Get args and command
			logger.log(`processing command: ${interaction.customId}`)
			let args: Array<string> = []
			if (interaction.customId.includes('/')) {
				args = interaction.customId.split('/')[1].split(' ')
			} else {
				args = interaction.customId.split(' ')
			}

			if (interaction.isSelectMenu()) {
				args.push(...interaction.values ?? [])
			}

			const command = args.shift()

			if (!command) {
				return
			}

			// Get the original message
			try {

				// Process and edit the original message
				const response = await commands[command].execute(this.buildContext('/', command, args))
				interaction.update(this.formatMessage(response))
				logger.log(`command processed: ${interaction.customId}`)
			} catch (error) {
				interaction.update('an error occured')
				logger.error(`error processing commands: ${interaction.customId}`, error)
			}
			return

		// Process commands
		} else if (interaction.isCommand()) {
			const cmd = commands[interaction.commandName]

			// Use definition options to fill the args
			const args = cmd.options?.map((o) => interaction.options.get(o.name)?.value?.toString()).filter((v) => typeof v !== 'undefined') as Array<string> ?? []
			logger.log(`processing command: ${interaction.commandName} ${args.join(' ')}`)
			try {

				// Process and reply to the message
				const response = await cmd.execute(this.buildContext('/', interaction.commandName, args))
				interaction.reply(this.formatMessage(response))
				logger.log(`command processed: ${interaction.commandName} ${args.join(' ')}`)
			} catch (error) {
				logger.error(`error processing commands: ${interaction.commandName} ${args.join(' ')}`, error)
				logger.error(error)
			}
			return
		}
	}

	private formatMessage(message: string | Message): string | MessagePayload | BaseMessageOptions {
		if (typeof message === 'string') {
			return message
		}
		const payload: BaseMessageOptions = {
			content: message.text(),
			embeds: message.embed().map((embed) => {
				const color = embed.color()
				return {
					color: color,
					title: embed.title(),
					description: embed.description(),
					footer: embed.footer(),
					image: embed.image(),
					thumbnail: embed.thumbnail(),
					video: embed.video(),
					provider: embed.provider(),
					author: embed.author(),
					fields: embed.field()
				}
			}),
			components: message.row().map((row) => ({
				type: ComponentType.ActionRow,
				components: row.components().map<MessageActionRowComponentData>((component) => {
					if (component instanceof Button) {
						const tmp: ButtonComponentData = {
							customId: component.customID(),
							style: component.type() as number,
							disabled: component.disabled(),
							label: component.label(),
							url: component.url(),
							type: ComponentType.Button
						}
						return tmp
					} else if (component instanceof Select) {
						const tmp: StringSelectMenuComponentData =  {
							type: ComponentType.StringSelect,
							customId: component.customID(),
							// maxValues: component.max_values,
							// minValues: component.min_value,
							placeholder: component.placeholder(),
							options: component.option().map((o) => ({
								default: o.default,
								description: o.description,
								// emoji: o.
								label: o.label,
								value: o.value
							}))
						}
						return tmp
					}
					throw new Error('wat')
				})
			}))
		}
		return payload
	}

	private buildContext(prefix: string, command: string, args: Array<string>): DiscordContext {
		return {
			prefix,
			command,
			args,
			client: this,

		}
	}
}
