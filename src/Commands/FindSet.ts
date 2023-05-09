import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import SetEmbed from '../Embeds/SetEmbed'
import { getTCGdexLang } from '../Utils'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'

export default class FindSet implements Command {
	public name = {
		en: 'findset',
		fr: 'trouverset'
	}
	public description = {
		en: 'Find and display a set informations',
		fr: 'Trouver et afficher les informations du set'
	}
	public options: Array<CommandOptions> = [{
		name: {
			en: 'name',
			fr: 'nom'
		},
		description: {
			en: 'Set name/ID',
			fr: 'le nom/ID du set'
		},
		required: true,
		type: CommandOptionType.STRING
	}]

	public async execute({ args, lang }: Context) {
		const tcgdex = new TCGdex(getTCGdexLang(lang))
		const name = args.join(' ')
		const tmp = await tcgdex.fetch('sets')
		const sets = tmp?.filter((set) => set.name.toLowerCase().includes(name.toLowerCase()) || set.id === name)

		if (!sets || sets.length === 0) {
			return new Message('Set not found! :(')
		}

		if (sets.length > 1) {
			const msg = new Message('Multiple sets were found with this name')
			let select = new Select()
				.callback('findset')
				.placeholder('Select the set you want')
			for (const set of sets) {
				if (select.options().length >= 25) {
					msg.addRow(new ActionRow().components(select))
					select = new Select()
						.callback('findset')
						.placeholder(`Select the set you want ${msg.row().length + 1}`)
				}
				select.addOption(set.name.substr(0, 25), set.id)
			}
			return msg.addRow(new ActionRow().components(select))
		}

		const set = await tcgdex.fetch('sets', sets[0].id)

		if (!set) {
			return new Message('Set not found! :(')
		}

		const select = new Select('findcardbyid')
			.placeholder('get Details on a card')
		for (const card of set.cards) {
			select.addOption(`${card.localId} - ${card.name}`, card.id)
		}

		return new Message().embed(SetEmbed(set))
			.addRow(new ActionRow(new Button().label('Check Serie').callback(`findserie ${set.serie.id}`)))
			.addRow(new ActionRow(select))
	}
}
