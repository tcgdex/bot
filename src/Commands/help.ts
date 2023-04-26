import { objectValues } from '@dzeio/object-util'
import Bot from '../Bot'
import ActionRow from '../Components/Components/ActionRow'
import Button, { ButtonStyle } from '../Components/Components/Button'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import { Command, CommandArguments } from '../interfaces'

export default class Help implements Command {

	public name = 'help'
	public description = 'Display the commands linked to the bot'

	public async execute({ prefix }: CommandArguments) {

		const commands = await Bot.get().getCommands()
		const embed = new Embed()
		embed.title('TCGdex BOT')
		embed.description('Browse the Pokemon Trading Card game cards using the TCGdex BOT\n\nCommands:')
		for (const command of objectValues(commands)) {
			const options = command.options?.map((opt) => `[${opt.name}]`).join(' ')
			const optionsDescriptions = command.options?.map((opt) => `**${opt.name}** ${opt.required ? '' : '(Optionnal)'}\n*${opt.description}*`)
			embed.addField(
				`\`${prefix} ${command.name}${options ? ' ' + options : ''}\``,
				`*${command.description ?? ''}*\n${optionsDescriptions?.join('\n') ?? ''}`
			)
		}

		return new Message(' ')
			.embed(embed)
			.addRow(
				new ActionRow(
					new Button(ButtonStyle.Link, 'https://www.tcgdex.net').label('Website'),
					new Button(ButtonStyle.Link, 'https://github.com/tcgdex/discord').label('Github'),
					new Button(ButtonStyle.Link, 'https://discord.gg/HGnvEp3reF').label('Discord Server'),
					new Button(ButtonStyle.Link, 'https://discord.com/api/oauth2/authorize?client_id=465978667022024704&permissions=329728&scope=bot%20applications.commands').label('Invite me !')
				)
			)
	}
}
