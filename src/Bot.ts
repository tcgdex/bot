import Logger from '@dzeio/logger'
import fs from 'fs/promises'
import { posix as path } from 'path'
import Message from './Components/Message'
import Discord from './Platforms/Discord'
import Telegram from './Platforms/Telegram'
import { Command, CommandOptionType, Context, Platform } from './interfaces'

const logger = new Logger('Bot')

export default class Bot {

	private static instance: Bot

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

	public async getCommands(client?: Platform): Promise<Record<string, Command>> {
		const files = await fs.readdir(path.join(__dirname, './Commands'))
			.then((file) => file.filter((it) => it.endsWith('.ts') || it.endsWith('.js')))
		const commands = await Promise.all(
			files.map<Promise<Command>>(async (file) => new (await import(`./Commands/${file}`)).default() as Command)
		)
		const result: Record<string, Command> = {}
		for (const command of commands) {
			if (!client || !command.availableOn || command.availableOn(client)) {
				result[command.name] = command
			}
		}
		return result
	}

	public async init() {
		// registers commands into the bot
		// get the commands files
		Bot.instance = this
		const ds = JSON.parse(await fs.readFile('../discord.json', 'utf-8'))
		const botsToLoad: Array<Promise<void>> = []
		if (ds.enabled) {
			botsToLoad.push(new Discord(ds).init())
		}
		const tm = JSON.parse(await fs.readFile('../telegram.json', 'utf-8'))
		if (tm.enabled) {
			botsToLoad.push(new Telegram().init())
		}
		await Promise.all(botsToLoad)
	}

	public async handleCommand(req: Context): Promise<Message | string> {
		const cmd = await this.findCommandToExecute(req.platform, req.command, req.args)
		if (typeof cmd === 'string') {
			return cmd
		}
		try {
			return await cmd.execute(req)
		} catch (error) {
			logger.error('Error detected:', error, req)
			return 'An error occured while running the command!'
		}
	}

	public async findCommandToExecute(client: Platform, command: string, args: Array<string>): Promise<Command | string> {
		const commands = await this.getCommands(client)
		let cmd = commands[command]
		if (!cmd) {
			return `Command not found (${command})`
		}
		if (!cmd.options) {
			return cmd
		}
		for (let idx = 0; idx < args.length; idx++) {
			if (!cmd.options) {
				return cmd
			}
			const option = cmd.options[idx]
			const arg = args[idx]
			if (option.type === CommandOptionType.COMMAND_GROUP) {
				const sub = option.commands.find((it) => it.name === arg)
				if (!sub) {
					return `SubCommand not found (${arg})`
				}
				cmd = sub
			}
			if (!arg && option.required) {
				return `Required field not filled (${arg})`
			}
		}
		return cmd
	}
}
