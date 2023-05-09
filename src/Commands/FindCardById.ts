import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Message from '../Components/Message'
import CardEmbed from '../Embeds/CardEmbed'
import { getTCGdexLang, t } from '../Utils'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'
import texts from '../texts'

export default class FindCardById implements Command {
	public name = {
		en: 'findcardbyid',
		fr: 'trouvercarteparid'
	}
	public description = {
		en: 'Find a card by it\'s global/local ID',
		fr: 'Trouve une card en utilisant son ID global/local'
	}
	public options: Array<CommandOptions> = [{
		name: 'id',
		description: {
			en: 'Card\'s ID (Local ID if set is defined)',
			fr: 'ID de la carte (id locale si le set est définis)'
		},
		required: true,
		type: CommandOptionType.STRING
	}, {
		name: 'set',
		description: {
			en: 'The set used to use the local ID instead of the global ID',
			fr: 'l\'identifiant du set a utiliser'
		},
		required: false,
		type: CommandOptionType.STRING
	}]

	public async execute({ args, lang }: Context) {
		const tcgdex = new TCGdex(getTCGdexLang(lang))
		const res = await tcgdex.fetchCard(args.shift() ?? '', args.join(' '))

		if (!res) {
			return t(texts.cardNotFound, lang)
		}
		return new Message()
			.addRow(new ActionRow(new Button().label(t(texts.findcardbyid.checkSet, lang)).callback(`findset ${res.set.id}`)))
			.embed(CardEmbed(res))
	}
}
