import Telegram from '../Platforms/Telegram'
import { Command, Context, Platform } from '../interfaces'

/**
 * Welcome message for the bot when it is first run in Telegram
 */
export default class Start implements Command {
	public name = 'start'
	public description = {
		en: 'Welcome message from the bot :D',
		fr: 'Message de bienvenue du bot :D'
	}

	public async execute({ platform, lang }: Context) {
		if (lang === 'fr') {
			return `Bienvenue du TCGdex BOT sur ${platform.name}!\nTu peux utiliser la command /aide pour avoir une liste des commandes disponible`
		}
		return `Welcome to the TCGdex BOT on ${platform.name}!\nYou can use the /help command to get the list of commands available`
	}

	public availableOn(client: Platform): boolean {
		return client instanceof Telegram
	}
}
