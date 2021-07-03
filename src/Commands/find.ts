import TCGdex, { Set, SetResume } from '@tcgdex/sdk'
import Message from '../Components/Message'
import Select from '../Components/Select'
import CardEmbed from '../Embeds/CardEmbed'
import { Command } from '../interfaces'

const cmd: Command = {
	definition: {
		name: 'find',
		description: 'Find a card by it\'s name',
		options: [{
			name: 'name',
			description: 'Card name',
			required: true,
			type: 'STRING'
		}, {
			name: 'serie',
			description: 'Filter with a defined serie',
			required: false,
			type: 'STRING'
		}, {
			name: 'set',
			description: 'Filter with a defined set',
			required: false,
			type: 'STRING'
		}],
	},
	async all({ client, args }) {
		const tcgdex = new TCGdex('en')
		let serie: string
		let set: SetResume
		if (args[1]) {
			const s = await tcgdex.fetch('series', args[1])
			if (!s) {
				return 'Serie not found'
			}
			serie = s.id
		}
		const sets = await tcgdex.fetch('sets')
		const cards = await tcgdex.fetchCards()
		if (!sets || !cards) {
			return 'Could not fetch sets/cards'
		}
		if (args[2]) {
			const tmp = sets.find((s) => s.name === args[2] || s.id === args[2])
			if (!tmp) {
				return 'Set not found'
			}
			set = tmp
		}

		const filteredCards = cards.filter((r) => {
			if (
				(serie && !r.id.includes(serie)) ||
				(set && !r.id.includes(set.id))
			) {
				return false
			}

			return r.name.toLowerCase().includes(args[0].toLowerCase())
		})
		if (filteredCards.length === 1) {
			const res = await tcgdex.fetchCard(filteredCards[0].id)

			if (!res) {
				return 'Card not found :('
			}

			// Send Message
			return new Message()
				.embed(CardEmbed(res))
		} else if (filteredCards.length === 0) {
			return 'Card not found :('
		}

		const s = new Select()
			.customID('findbyid')

		for (const iterator of filteredCards) {
			s.option('add', `${sets.find((se) => iterator.id.replace(`-${iterator.localId}`, '').includes(se.id))?.name} - ${iterator.name}`.substr(0, 25), iterator.id)
		}

		return new Message()
			.text('Select the correct card ')
			.row('NEW', s)
	}
}

export default cmd
