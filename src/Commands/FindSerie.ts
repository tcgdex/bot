import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import SerieEmbed from '../Embeds/SerieEmbed'
import { getTCGdexLang } from '../Utils'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'

export default class FindSerie implements Command {
	public name = {
		en: 'findserie',
		fr: 'trouverserie'
	}
	public description = {
		en: 'Find and display a serie informations',
		fr: 'Trouver et afficher les informatiosn d\'une série'
	}
	public options: Array<CommandOptions> = [{
		name: {
			en: 'name',
			fr: 'nom'
		},
		description: {
			en: 'Serie\'s name/ID',
			fr: 'le nom ou ID de la série'
		},
		required: true,
		type: CommandOptionType.STRING
	}]

	public async execute({ args, lang }: Context) {
		const tcgdex = new TCGdex(getTCGdexLang(lang))
		const name = args.join(' ')
		const tmp = await tcgdex.fetch('series')
		const series = tmp?.filter((s) => s.name.toLowerCase().includes(name.toLowerCase()) || s.id.includes(name.toLowerCase()))

		if (!series || series.length === 0) {
			return new Message('Serie not found! :(')
		}

		if (series.length > 1 && !series.find((it) => it.id === name)) {
			const msg = new Message('Multiple series were found with this name')
			let select = new Select('findserie')
				.placeholder('Select the serie you want')
			for (const set of series) {
				if (select.options().length >= 25) {
					msg.addRow(new ActionRow().components(select))
					select = new Select('findserie')
						.placeholder(`Select the serie you want ${msg.row().length + 1}`)
				}
				select.addOption(set.name.substr(0, 25), set.id)
			}
			return msg.addRow(new ActionRow(select))
		}

		const serie = await tcgdex.fetch('series', series[0].id)

		if (!serie) {
			return new Message('Serie not found! :(')
		}

		const msg = new Message(' ').embed(SerieEmbed(serie))
		const select = new Select('findset')
			.placeholder('Sets')
		for (const set of serie.sets) {
			select.addOption(`${set.id} - ${set.name}`, set.id)
		}

		return msg.addRow(new ActionRow(select))
	}
}
