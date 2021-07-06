import ApplicationCommand, { Inputs } from '../Components/ApplicationCommand'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import ActionRow from '../Components/MessageComponent/ActionRow'
import Button, { ButtonStyle } from '../Components/MessageComponent/Button'

export default class Help extends ApplicationCommand {
	public definition = {
		name: 'help',
		description: 'Display the commands linked to the bot',
		options: []
	}

	public async all({ commands, prefix }: Inputs) {

		const embed = new Embed()
		embed.title('TCGdex BOT')
		embed.description('Browse the Pokemon Trading Card game cards using the TCGdex BOT\n\nCommands:')
		for (const commandName of Object.keys(commands)) {
			const command = commands[commandName]
			const options = command.definition.options?.map((o) => `[${o.name}]`).join(' ')
			const optionsDescriptions = command.definition.options?.map((opt) => `**${opt.name}** ${opt.required ? '' : '(Optionnal)'}\n*${opt.description}*`)
			embed.addField(
				`\`${prefix} ${command.definition.name}${options ? ' ' + options : ''}\``,
				`*${command.definition.description ?? ''}*\n${optionsDescriptions?.join('\n') ?? ''}`
			)
		}

		return new Message(' ')
			.embed(embed)
			.addRow(
				new ActionRow(
					new Button(ButtonStyle.Link, 'https://www.tcgdex.net').label('Website'),
					new Button(ButtonStyle.Link, 'https://github.com/tcgdex/discord').label('Github')
				)
			)
	}
}
