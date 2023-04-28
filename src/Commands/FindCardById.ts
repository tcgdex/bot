import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'

export default class FindCardById implements Command {
	public name = 'findcardbyid'
	public description = 'Find a card by it\'s global/local ID'
	public options: Array<CommandOptions> = [{
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

	public async execute({ args }: Context) {
		const tcgdex = new TCGdex('en')
		const res = await tcgdex.fetchCard(args.shift() ?? '', args.join(' '))

		if (!res) {
			return 'Card not found!'
		}
		return new Message()
			.addRow(new ActionRow(new Button().label('Check Set').callback(`findset ${res.set.id}`)))
			.embed(CardEmbed(res))
	}
}
