import TCGdex from '@tcgdex/sdk'
import ApplicationCommand, { ApplicationCommandOptionType, Inputs } from '../Components/ApplicationCommand'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'

export default class FindById extends ApplicationCommand {
	public definition = {
		name: 'findbyid',
		description: 'Find a card by it\'s global/local ID',
		options: [{
			name: 'id',
			description: 'Card ID (Local ID if set is defined)',
			required: true,
			type: ApplicationCommandOptionType.STRING
		}, {
			name: 'set',
			description: 'The set used to use the local ID instead of the global ID',
			required: false,
			type: ApplicationCommandOptionType.STRING
		}],
	}

	public async all({ args }: Inputs) {
		const tcgdex = new TCGdex('en')
		const res = await tcgdex.fetchCard(args.shift() ?? '', args.join(' '))

		if (!res) {
			return 'Card not found!'
		}
		return new Message()
			.embed(CardEmbed(res))
	}
}
