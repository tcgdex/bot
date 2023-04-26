import fs from 'fs/promises'
import { posix as path } from 'path'
import Discord from './Clients/Discord'
import Telegram from './Clients/Telegram'
import { Command } from './interfaces'

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

	public async getCommands(): Promise<Record<string, Command>> {
		const files = await fs.readdir(path.join(__dirname, './Commands'))
			.then((file) => file.filter((it) => it.endsWith('.ts') || it.endsWith('.js')))
		const commands = await Promise.all(
			files.map(async (file) => new (await import(`./Commands/${file}`)).default())
		)
		const result: Record<string, Command> = {}
		for (const command of commands) {
			result[command.name] = command
		}
		return result
	}

	public async init() {
		// registers commands into the bot
		// get the commands files
		Bot.instance = this
		const ds = (await import('../discord.json')).default
		const botsToLoad: Array<Promise<void>> = []
		if (ds.enabled) {
			botsToLoad.push(new Discord(ds).init())
		}
		const tm = (await import('../telegram.json')).default
		if (tm.enabled) {
			botsToLoad.push(new Telegram().init())
		}
		await Promise.all(botsToLoad)
	}

	// public async handleCommand(client: Client, command: string , args: Array<string>): Promise<Message | string | null> {
	// 	const commands = await this.getCommands()
	// 	const args
	// 	const cmd = commands[command]
	// 	if (!cmd) {
	// 		return null
	// 	}
	// 	return cmd.execute()
	// }
}
