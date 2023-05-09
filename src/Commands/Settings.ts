
import { Command, Localized } from '../interfaces'

/**
 * change settings for the bot
 *
 * - it should be able to change settings for a specific user
 * - it should be able to change settings for a specific server
 */
export default class Settings implements Command {

	public name = 'settings'
	public description: Localized = {
		en: 'Change the bot settings',
		fr: 'change les paramètres du BOT'
	}

	public async execute() {

		return 'wip'
	}

	public availableOn(): boolean {
		// currently only in dev mode
		return process.env.NODE_ENV !== 'production'
	}
}
