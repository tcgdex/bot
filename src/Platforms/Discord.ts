import Logger from '@dzeio/logger'
import { objectClone } from '@dzeio/object-util'
import {
	ActivityType,
	BaseMessageOptions,
	ButtonComponentData,
	CacheType,
	ChannelType,
	ComponentType,
	Client as DiscordClient,
	Message as DiscordMessage,
	GatewayIntentBits,
	Interaction,
	Locale,
	MessagePayload,
	Partials,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore f*ck
	REST,
	Routes,
} from 'discord.js'
import Bot from '../Bot'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Component from '../Components/Components/Component'
import Select, { SelectOptionStructure } from '../Components/Components/Select'
import Emoji from '../Components/Emoji'
import Message from '../Components/Message'
import { getLocalizedValue } from '../Utils'
import { CommandOptionType, CommandOptions, DiscordConfig, DiscordContext, Localized, Platform } from '../interfaces'

const logger = new Logger('Platforms/Discord')

export default class Discord implements Platform {
	public name = 'Discord'

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
			intents: this.config.intents?.map((it) => GatewayIntentBits[it as 'Guilds']) ?? [],
			partials: this.config.partials?.map((it) => Partials[it as 'Channel']) ?? []
		})

		this.client.on('ready', async () => {
			await this.refreshCommands()
			await this.updatePresence()

			logger.log(`Loaded, Logged in as ${this.client.user?.tag}`)
		})

		// update guild count
		this.client.on('guildCreate', this.updatePresence)
		this.client.on('guildDelete', this.updatePresence)

		// handle messages
		this.client.on('interactionCreate', this.onInteraction)
		this.client.on('messageCreate', this.onMessage)

		this.client.login(this.token)
	}

	private updatePresence = async () => {
		// Fetch guilds count and display it
		const size = await this.client.guilds.fetch()
		this.client.user?.setPresence({
			activities: [{name: `${size.size} servers | ${this.prefix} help`, type: ActivityType.Listening}]
		})
	}

	private async refreshCommands() {
		const commands = await Bot.get().getCommands(this)
		const rest = new REST({ version: '10' }).setToken(this.token)

		rest.put(Routes.applicationCommands(this.clientId), {
			body: commands.map((command) => {
				const defaultName = getLocalizedValue(command.name, this.config.defaultLang)
				const defaultDescription = getLocalizedValue(command.description, this.config.defaultLang)

				return {
					name: defaultName,
					name_localizations: typeof command.name === 'object' ? this.remapLocalized(command.name) : undefined,
					description: defaultDescription,
					description_localizations: typeof command.description === 'object' ? this.remapLocalized(command.description) : undefined,
					options: command.options?.map(this.formatOption).flat()
				}
			})
		})
	}

	private formatOption = (option: CommandOptions): any => {
		if (option.type === CommandOptionType.COMMANDS) {
			return option.commands.map((cmd) => ({
				type: 1,
				name: getLocalizedValue(cmd.name, this.config.defaultLang),
				name_localizations: typeof cmd.name === 'object' ? this.remapLocalized(cmd.name) : undefined,
				description_localizations: typeof cmd.description === 'object' ? this.remapLocalized(cmd.description) : undefined,
				description: getLocalizedValue(cmd.description, this.config.defaultLang),
				required: false,
				options: cmd.options?.map(this.formatOption)
			}))
		}

		return {
			type: this.typeToDiscordType(option.type),
			name: getLocalizedValue(option.name, this.config.defaultLang),
			name_localizations: typeof option.name === 'object' ? this.remapLocalized(option.name) : undefined,
			description_localizations: typeof option.description === 'object' ? this.remapLocalized(option.description) : undefined,
			description: getLocalizedValue(option.description, this.config.defaultLang),
			required: option.required,
			choices: option.choices,
			options: option.options?.map(this.formatOption)
		}
	}

	private typeToDiscordType(type: CommandOptionType): number {
		switch (type) {
			case CommandOptionType.STRING:
				return 3
			case CommandOptionType.INTEGER:
				return 4
			case CommandOptionType.USER:
				return 5
			case CommandOptionType.ROLE:
				return 6
			case CommandOptionType.MENTIONABLE:
				return 7
		}
		return -1
	}

	// eslint-disable-next-line complexity
	private onMessage = async (message: DiscordMessage<boolean>) => {
		// Ignore message by bots
		if (message.author.bot) {
			return
		}

		// Get the prefix
		const args = message.content.trim().split(/ +/)
		let prefix = args.shift()

		// handle messages sent in DM
		if (prefix && message.channel.type === ChannelType.DM && !prefix.includes(this.clientId)) {
			args.unshift(prefix)
			prefix = ''
		} else {
			// ignore message not started by the bot's name or PREFIX
			if (
				!prefix ||
				!this.client.user ||
				!(
					prefix.toLowerCase() === this.prefix.toLowerCase()
				) &&
				!(
					prefix === `<@!${this.clientId}>` ||
					prefix === `<@${this.clientId}>`
				)
			) {
				return
			}
		}


		// Replace ths client user id by the username so it's easier to read
		if (prefix === `<@!${this.clientId}>` || prefix === `<@${this.clientId}>`) {
			// TODO: get the server nickname instead of the global username
			prefix = `@${this.client.user?.username}`
		}

		// Get the command
		let command = args.shift()

		// ignore message if the command does not exist
		if (!command) {
			command = 'help'
		}

		logger.log(`processing command: ${command} ${args.join(' ')}`)

		// Handle command like a slash command
		message.author.fetch()
		try {
			const msg = await message.reply('<a:typing:861888874404773888> Sending Command...')
			try {
				// Process and edit the original message
				const response = await Bot.get().handleCommand(this.buildContext(prefix, command, args))
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

	// eslint-disable-next-line complexity
	private onInteraction = async (interaction: Interaction<CacheType>) => {
		const locale = this.getLocale(interaction.locale)
		// handle buttons and selects
		if (interaction.isMessageComponent()) {

			// Get args and command
			let args: Array<string> = []
			// manage indexes
			if (interaction.customId.includes('/')) {
				args = interaction.customId.split('/')[1].split(' ')
			} else {
				args = interaction.customId.split(' ')
			}

			if (interaction.isStringSelectMenu()) {
				args.push(...interaction.values ?? [])
			}

			const command = args.shift()

			if (!command) {
				return
			}

			logger.log(`processing command: ${command} ${args.join(' ')}`)
			// Get the original message
			try {

				// Process and edit the original message
				const response = await Bot.get().handleCommand(this.buildContext('/', command, args, locale))
				interaction.update(this.formatMessage(response))
				logger.log(`command processed: ${command} ${args.join(' ')}`)
			} catch (error) {
				interaction.update('an error occured')
				logger.error(`error processing commands: ${command} ${args.join(' ')}`, error)
			}
			return

		// Process commands
		} else if (interaction.isCommand()) {

			// Use definition options to fill the args
			const args = interaction.options.data.map((o) => o.value?.toString() ?? o.name)
			logger.log(`processing command: ${interaction.commandName} ${args.join(' ')}`)
			try {

				// Process and reply to the message
				const response = await Bot.get().handleCommand(this.buildContext('/', interaction.commandName, args, locale))
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

		let text = message.text()
		const components = message.row().map(this.processRow).flat(1)
		if (components.length > 5 && this.config.componentsLimit) {
			text += '\n'
			text += typeof this.config.componentsLimit === 'string' ? this.config.componentsLimit : getLocalizedValue(this.config.componentsLimit)
		}

		const payload: BaseMessageOptions = {
			content: text,
			embeds: message.embed().map((embed) => {
				const color = embed.color()
				const fields = embed.field()
				fields.forEach((field) => {
					field.name = Emoji.formatText(field.name, this.formatEmoji)
					field.value = Emoji.formatText(field.value, this.formatEmoji)
				})
				return {
					color: color,
					title: Emoji.formatText(embed.title(), this.formatEmoji),
					description: Emoji.formatText(embed.description(), this.formatEmoji),
					footer: embed.footer(),
					image: embed.image(),
					thumbnail: embed.thumbnail(),
					video: embed.video(),
					provider: embed.provider(),
					author: embed.author(),
					fields: fields
				}
			}),
			components: components.slice(0, 5) as any
		}
		return payload
	}

	private buildContext(prefix: string, command: string, args: Array<string>, locale?: keyof Localized): DiscordContext {
		return {
			prefix,
			command,
			args,
			platform: this,
			lang: locale
		}
	}

	private formatEmoji(emoji: Emoji) {
		return `<:${emoji.name?.toLowerCase()}:${emoji.id}>`
	}

	private remapLocalized(localization: Localized) {
		const clone: any = objectClone(localization)

		clone['en-GB'] = clone.en
		clone['en-US'] = clone.en
		delete clone.en
		clone['es-ES'] = clone.es
		delete clone.es
		clone['pt-BR'] = clone.pt
		delete clone.pt
		clone['sv-SE'] = clone.sv
		delete clone.sv
		clone['zh-CN'] = clone.zh
		clone['zh-TW'] = clone.zh
		delete clone.zh
		return clone
	}

	// eslint-disable-next-line complexity
	private getLocale(locale: Locale): keyof Localized {
		switch (locale) {
			case Locale.ChineseCN:
			case Locale.ChineseTW:
				return 'zh'
			case Locale.EnglishGB:
			case Locale.EnglishUS:
				return 'en'
			case Locale.SpanishES:
				return 'es'
			case Locale.PortugueseBR:
				return 'pt'
			case Locale.Swedish:
				return 'sv'
			default:
				return locale
		}
	}

	private processRow = (row: ActionRow, idx: number) => {
		console.log(row, idx, row.components())
		const components = row.components().map(this.processComponent(idx)).flat(1)
		const sub: Array<typeof components> = []
		for (let cIdx = 0; cIdx < components.length; cIdx += 5) {
			let tmp = components.slice(cIdx, cIdx + 5)
			if (tmp[0].type === ComponentType.StringSelect) {
				tmp = [tmp[0]]
				cIdx -= 4
			}
			console.log(tmp)
			// if (tmp.find((comp) => comp instanceof Select) && tmp.length > 1) {
			// 	logger.warn('Component can\'t be added because there is already another component in')
			// }
			sub.push(tmp)
		}
		return sub.map((it) => ({
			type: ComponentType.ActionRow,
			components: it
		}))
	}

	private processComponent = (rowIdx: number) => (component: Component, compIdx: number) => {
		if (component instanceof Button) {
			const cb = component.callback()
			const tmp: ButtonComponentData = {
				customId: cb ? rowIdx + '' + compIdx + '/' + cb : undefined,
				style: component.style() + 1,
				disabled: component.disabled(),
				label: component.label(),
				url: component.url(),
				type: ComponentType.Button
			}
			return tmp
		} else if (component instanceof Select) {
			const options: Array<Array<SelectOptionStructure>> = []
			const tmp = component.options()
			for (let optIdx = 0; optIdx < tmp.length; optIdx += 25) {
				options.push(tmp.slice(optIdx, optIdx + 25))
			}

			return options.map((opts, idx) => ({
				type: ComponentType.StringSelect,
				customId: idx + '' + rowIdx + '' + compIdx + '/' + component.callback(),
				maxValues: component.maxValue(),
				minValues: component.minValue(),
				placeholder: component.placeholder(),
				options: opts.map((opt) => ({
					default: opt.default,
					description: opt.description,
					// emoji: opt.
					label: opt.label,
					value: opt.value
				}))
			}))
		}
		throw new Error('wat')
	}
}
