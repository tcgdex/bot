import Logger from '@dzeio/logger'
import { objectClone, objectKeys, objectValues } from '@dzeio/object-util'
import fs from 'fs/promises'
import { posix as path } from 'path'
import Message from './Components/Message'
import Discord from './Platforms/Discord'
import Telegram from './Platforms/Telegram'
import { Command, CommandOptionType, Config, Context, DiscordConfig, Localized, Platform, TelegramConfig } from './interfaces'

const logger = new Logger('Bot')

export default class Bot {

	private static instance: Bot

	private config!: Config

	/**
	 * get the current bot instance
	 * @returns the Bot isntance
	 */
	public static get() {
		if (!this.instance) {
			throw new Error('Bot was not initialized')
		}
		return this.instance
	}

	public async getCommands(client?: Platform): Promise<Array<Command>> {
		const files = await fs.readdir(path.join(__dirname, './Commands'))
			.then((file) => file.filter((it) => it.endsWith('.ts') || it.endsWith('.js')))
		const commands = await Promise.all(
			files.map<Promise<Command>>(async (file) => new (await import(`./Commands/${file}`)).default() as Command)
		)
		const result: Array<Command> = []
		for (const command of commands) {
			if (!client || !command.availableOn || command.availableOn(client)) {
				result.push(command)
			}
		}
		return result
	}

	public async init() {
		// registers commands into the bot
		// get the commands files
		Bot.instance = this
		this.config = JSON.parse(await fs.readFile('./config.json', 'utf-8'))
		const ds: Omit<DiscordConfig, keyof Config> = JSON.parse(await fs.readFile('./discord.json', 'utf-8'))
		const botsToLoad: Array<Promise<void>> = []
		if (ds.enabled) {
			botsToLoad.push(new Discord({...ds, ...this.config}).init())
		}
		const tm: Omit<TelegramConfig, keyof Config> = JSON.parse(await fs.readFile('./telegram.json', 'utf-8'))
		if (tm.enabled) {
			botsToLoad.push(new Telegram({...tm, ...this.config}).init())
		}
		await Promise.all(botsToLoad)
	}

	public async handleCommand(req: Context): Promise<Message | string> {
		const cmd = await this.findCommandToExecute(req)

		if (typeof cmd === 'string') {
			return cmd
		}
		try {
			return await cmd.execute({
				...req,
				args: objectClone(req.args)
			})
		} catch (error) {
			logger.error('Error detected:', error, req)
			return 'An error occured while running the command!'
		}
	}

	// eslint-disable-next-line complexity
	public async findCommandToExecute({ platform, command, args, lang }: Context): Promise<Command | string> {
		const commands = await this.getCommands(platform)
		// eslint-disable-next-line complexity
		let cmd = commands.find(this.findCommandWithName(command, lang))
		if (!cmd) {
			return `Command not found \`${command}\``
		}
		const options = cmd.options
		if (!options) {
			return cmd
		}
		for (let idx = 0; idx < options.length; idx++) {
			const option = options[idx]
			const arg = args[idx]
			if (option.type === CommandOptionType.COMMANDS && arg) {
				const sub = option.commands.find(this.findCommandWithName(arg, lang))
				if (!sub) {
					return `SubCommand not found \`${arg}\``
				}
				cmd = sub
			}

			if (!arg && option.required) {
				return `Required field not filled \`${option.name}\``
			}
		}
		return cmd
	}

	// eslint-disable-next-line complexity
	private findCommandWithName =
		(name: string, lang?: keyof Localized) =>
			(it: Command) =>
				typeof it.name === 'string' ?
					it.name === name :
					it.name[lang ?? this.config.defaultLang ?? objectKeys(it.name)[0]] === name ||
					it.name[this.config.defaultLang ?? objectKeys(it.name)[0]] === name ||
					objectValues(it.name).find((cmdName) => cmdName === name)
}
