import TCGdex from '@tcgdex/sdk'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'
import { Command } from '../interfaces'

const cmd: Command = {
	definition: {
		name: 'findbyid',
		description: 'Find a card by it\'s global/local ID',
		options: [{
			name: 'id',
			description: 'Card ID (Local ID if set is defined)',
			required: true,
			type: 'STRING'
		}, {
			name: 'set',
			description: 'The set used to use the local ID instead of the global ID',
			required: false,
			type: 'STRING'
		}],
	},
	async all({ client, args }) {
		const tcgdex = new TCGdex('en')
		const res = await tcgdex.fetchCard(args.shift() ?? '', args.join(' '))

		if (!res) {
			return 'Card not found!'
		}
		return new Message()
			.embed(CardEmbed(res))
	}
}

export default cmd
