import { objectValues } from '@dzeio/object-util'
import Bot from '../Bot'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import Discord from '../Platforms/Discord'
import Telegram from '../Platforms/Telegram'
import { Command, CommandOptionType, CommandOptions, Context } from '../interfaces'

export default class Help implements Command {

	public name = 'help'
	public description = 'Display the commands linked to the bot'

	public async execute({ prefix, platform }: Context) {

		const buttons = [
			new Button().url('https://www.tcgdex.net').label('Website'),
			new Button().url('https://github.com/tcgdex/bot').label('Github'),
		]

		if (platform instanceof Discord) {
			buttons.push(
				new Button().url('https://discord.gg/HGnvEp3reF').label('Discord Server'),
				new Button().url('https://discord.com/api/oauth2/authorize?client_id=465978667022024704&permissions=274878171200&scope=bot%20applications.commands').label('Invite me !')
			)
		} else if (platform instanceof Telegram) {
			buttons.push(
				new Button().url('https://t.me/tcgdex').label('Telegram Group'),
				new Button().url('https://t.me/tcgdex_bot?startgroup=true').label('Add me to a group')
			)
		}

		const commands = await Bot.get().getCommands(platform)
		const embed = new Embed()
		embed.title('TCGdex BOT')
		embed.description('Browse the Pokemon Trading Card game cards using the TCGdex BOT\n\nCommands:')
		for (const command of objectValues(commands)) {
			const { name, value } = this.formatCommand(command, prefix)
			embed.addField(
				name,
				value
			)
		}

		return new Message()
			.embed(embed)
			.addRow(
				new ActionRow().components(buttons)
			)
	}

	private formatCommand(command: Command, commandPrefix: string, prefix?: string): {name: string, value: string} {
		const options = command.options?.map((opt) => `[${opt.name}]`).join(' ')
		const optionsDescriptions = command.options?.map((opt) => this.formatOption(opt, commandPrefix, prefix))
		const name = `${prefix ?? ''}\`${commandPrefix === '/' ? commandPrefix : `${commandPrefix} `}${command.name}${options ? ' ' + options : ''}\``
		const value = `${prefix ?? ''}*${command.description ?? ''}*\n${optionsDescriptions?.join('\n') ?? ''}`
		return { name, value }
	}

	private formatOption(option: CommandOptions, commandPrefix: string, prefix?: string) {
		let base = `${prefix} **${option.name}** ${option.required ? '' : '(Optionnal)'}\n*${option.description}*`
		if (option.type === CommandOptionType.COMMAND_GROUP) {
			for (const subOpt of option.commands) {
				const sub = this.formatCommand(subOpt, commandPrefix, `${prefix} ${option.name} >`)
				base += `${sub.name}: ${sub.value}`
			}
		}
		return base
	}
}
