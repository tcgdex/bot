import Message from '../Components/Message'
import Telegram from '../Platforms/Telegram'
import { Command, Context, Platform } from '../interfaces'

/**
 * Welcome message for the bot when it is first run in Telegram
 */
export default class Start implements Command {
	public name = 'start'
	public description = 'Welcome message from the bot :D'

	public async execute({ platform }: Context) {
		return new Message(`Welcome to the TCGdex BOT on ${platform.name}!\nYou can use the /help command to get the list of commands available`)
	}

	public availableOn(client: Platform): boolean {
		return client instanceof Telegram
	}
}
