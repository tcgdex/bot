import TCGdex, { SetResume } from '@tcgdex/sdk'
import ApplicationCommand, { ApplicationCommandOptionType, Inputs } from '../Components/ApplicationCommand'
import Message from '../Components/Message'
import ActionRow from '../Components/MessageComponent/ActionRow'
import Select from '../Components/MessageComponent/Select'
import CardEmbed from '../Embeds/CardEmbed'

export default class Find extends ApplicationCommand {
	public definition = {
		name: 'find',
		description: 'Find a card by it\'s name',
		options: [{
			name: 'name',
			description: 'Card name',
			required: true,
			type: ApplicationCommandOptionType.STRING
		}, {
			name: 'serie',
			description: 'Filter with a defined serie',
			required: false,
			type: ApplicationCommandOptionType.STRING
		}, {
			name: 'set',
			description: 'Filter with a defined set',
			required: false,
			type: ApplicationCommandOptionType.STRING
		}],
	}

	public async all({ args }: Inputs) {
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

		let s = new Select('findbyid')
			.placeholder('Select the card you search')

		const message = new Message()
			.text('Select the correct card')

		for (let i = 0; i < filteredCards.length; i++) {
			const iterator = filteredCards[i]
			if (s.option().length === 25) {
				if (message.text().endsWith('card')) {
					message.text(message.text() + '\n_lot of cards were found with this name, maybe an other research will give better results_')
					s.placeholder('Select the card you search part 1')
				}
				message.addRow(new ActionRow(s))
				s = new Select(`${i}/findbyid`)
					.placeholder(`Select the card you search part ${message.row().length + 1}`)
			}
			s.addOption(`${iterator.name} - ${sets.find((se) => iterator.id.replace(`-${iterator.localId}`, '').includes(se.id))?.name}`.substr(0, 25), iterator.id)
		}

		return message
			.addRow(new ActionRow(s))
	}
}
