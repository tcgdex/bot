import ApplicationCommand, { Inputs } from '../Components/ApplicationCommand'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import { replaceTypesByEmojis } from '../Utils'

/**
 * This command is only available when using the non Dockerfile
 */
export default class Debug extends ApplicationCommand {
	public definition = {
		name: 'debug',
		description: 'Simple test frame',
		options: []
	}

	public async all({ commands, prefix }: Inputs) {

		const embed = new Embed()
		embed.title('TCGdex BOT')
		embed.description(replaceTypesByEmojis('Types\nColorlessFireDragonElectricMetalDarknessGrassPsychicLightningWaterFairyFighting'))

		return new Message(' ')
			.embed(embed)
	}
}
