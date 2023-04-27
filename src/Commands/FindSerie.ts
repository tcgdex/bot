import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import SerieEmbed from '../Embeds/SerieEmbed'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'

export default class FindSerie implements Command {
	public name = 'findserie'
	public description = 'Find and display a serie informations'
	public options: Array<CommandOptions> = [{
		name: 'name',
		description: 'Serie\'s name/ID',
		required: true,
		type: CommandOptionType.STRING
	}]

	public async execute({ args }: Context) {
		const tcgdex = new TCGdex('en')
		const name = args.join(' ')
		const tmp = await tcgdex.fetch('series')
		const series = tmp?.filter((s) => s.name.toLowerCase().includes(name.toLowerCase()) || s.id.includes(name.toLowerCase()))

		if (!series || series.length === 0) {
			return new Message('Serie not found! :(')
		}

		if (series.length > 1) {
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
