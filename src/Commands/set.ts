import TCGdex from '@tcgdex/sdk'
import ActionRow from '../Components/Components/ActionRow'
import Select from '../Components/Components/Select'
import Message from '../Components/Message'
import SetEmbed from '../Embeds/SetEmbed'
import { Command, CommandArguments, CommandOptionType } from '../interfaces'

export default class Set implements Command {
	public name = 'set'
	public description = 'Find and display a set informations'
	public options = [{
		name: 'name',
		description: 'Set name/ID',
		required: true,
		type: CommandOptionType.STRING
	}]

	public async execute({ args }: CommandArguments) {
		const tcgdex = new TCGdex('en')
		const name = args.join(' ')
		const tmp = await tcgdex.fetch('sets')
		const sets = tmp?.filter((s) => s.name.toLowerCase().includes(name.toLowerCase()) || s.id === name)

		if (!sets || sets.length === 0) {
			return new Message('Set not found! :(')
		}

		if (sets.length > 1) {
			const msg = new Message('Multiple sets were found with this name')
			let select = new Select('set')
				.placeholder('Select the set you want')
			for (const set of sets) {
				if (select.option().length >= 25) {
					msg.addRow(new ActionRow(select))
					select = new Select('set')
						.placeholder(`Select the set you want ${msg.row().length + 1}`)
				}
				select.addOption(set.name.substr(0, 25), set.id)
			}
			return msg.addRow(new ActionRow(select))
		}

		const set = await tcgdex.fetch('sets', sets[0].id)

		if (!set) {
			return new Message('Set not found! :(')
		}

		return new Message(' ').embed(SetEmbed(set))
	}
}
