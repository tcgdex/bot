import TCGdex, { SetResume } from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'
import { getTCGdexLang, t } from '../Utils'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'
import texts from '../texts'

export default class FindCard implements Command {
	public name = {
		en: 'findcard',
		fr: 'trouvercarte'
	}
	public description = {
		en: 'Find a card by it\'s name',
		fr: 'trouve une carte avec son nom'
	}
	public options: Array<CommandOptions> = [{
		name: {
			en: 'name',
			fr: 'nom'
		},
		description: {
			en: 'Card\'s name',
			fr: 'le nom de la carte'
		},
		required: true,
		type: CommandOptionType.STRING
	}, {
		name: 'serie',
		description: {
			en: 'Filter with a defined serie',
			fr: 'Filtrer dans une série spécifique'
		},
		required: false,
		type: CommandOptionType.STRING
	}, {
		name: 'set',
		description: {
			en: 'Filter with a defined set',
			fr: 'Filtrer avec un set spécifique'
		},
		required: false,
		type: CommandOptionType.STRING
	}]

	// eslint-disable-next-line complexity
	public async execute({ args, lang }: Context) {
		const tcgdex = new TCGdex(getTCGdexLang(lang))
		let serie: string
		let set: SetResume

		if (args[1]) {
			const s = await tcgdex.fetch('series', args[1])
			if (!s) {
				return t(texts.serieNotFound)
			}
			serie = s.id
		}
		const sets = await tcgdex.fetch('sets')
		const cards = await tcgdex.fetchCards()
		if (!sets || !cards) {
			return t(texts.findcard.setCardsNotFound, lang)
		}
		if (args[2]) {
			const tmp = sets.find((s) => s.name === args[2] || s.id === args[2])
			if (!tmp) {
				return t(texts.setNotFound, lang)
			}
			set = tmp
		}

		const filteredCards = cards.filter((r) => {
			if (
				serie && !r.id.includes(serie) ||
				set && !r.id.includes(set.id)
			) {
				return false
			}

			return r.name.toLowerCase().includes(args[0].toLowerCase())
		})
		if (filteredCards.length === 1) {
			const res = await tcgdex.fetchCard(filteredCards[0].id)

			if (!res) {
				return t(texts.cardNotFound, lang)
			}

			// Send Message
			return new Message()
				.embed(CardEmbed(res))
		} else if (filteredCards.length === 0) {
			return t(texts.cardNotFound, lang)
		}

		const s = new Select()
			.callback('findcardbyid')
			.placeholder(t(texts.findcard.selectCardSearch, lang))

		const message = new Message()
			.text(t(texts.findcard.selectCard, lang))

		for (const iterator of filteredCards) {
			s.addOption(`${iterator.localId} - ${iterator.name} - ${sets.find((se) => iterator.id.replace(`-${iterator.localId}`, '').includes(se.id))?.name}`, iterator.id)
		}

		return message
			.addRow(new ActionRow(s))
	}
}
