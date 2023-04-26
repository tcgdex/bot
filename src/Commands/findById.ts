import TCGdex from '@tcgdex/sdk'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'
import { Command, CommandArguments, CommandOptionType } from '../interfaces'

export default class FindById implements Command {
	public name = 'findbyid'
	public description = 'Find a card by it\'s global/local ID'
	public options = [{
		name: 'id',
		description: 'Card ID (Local ID if set is defined)',
		required: true,
		type: CommandOptionType.STRING
	}, {
		name: 'set',
		description: 'The set used to use the local ID instead of the global ID',
		required: false,
		type: CommandOptionType.STRING
	}]

	public async execute({ args }: CommandArguments) {
		const tcgdex = new TCGdex('en')
		const res = await tcgdex.fetchCard(args.shift() ?? '', args.join(' '))

		if (!res) {
			return 'Card not found!'
		}
		return new Message()
			.embed(CardEmbed(res))
	}
}
