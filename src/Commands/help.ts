import Bot from '../Bot'
import ActionRow from '../Components/Components/ActionRow'
import Button from '../Components/Components/Button'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import Discord from '../Platforms/Discord'
import Telegram from '../Platforms/Telegram'
import { getLocalizedValue, t } from '../Utils'
import { Command, CommandOptionType, CommandOptions, Context, Localized } from '../interfaces'
import texts from '../texts'

export default class Help implements Command {

	public name: Localized = {
		en: 'help',
		fr: 'aide'
	}
	public description: Localized = {
		en: 'Display the commands linked to the bot',
		fr: 'Affiche les commandes du bot'
	}

	public async execute({ prefix, platform, lang }: Context) {

		const buttons = [
			new Button().url('https://www.tcgdex.net').label(t(texts.help.website)),
			new Button().url('https://github.com/tcgdex/bot').label('Github'),
		]

		if (platform instanceof Discord) {
			buttons.push(
				new Button().url('https://discord.gg/HGnvEp3reF').label(t(texts.help.discord)),
				new Button().url('https://discord.com/api/oauth2/authorize?client_id=465978667022024704&permissions=274878171200&scope=bot%20applications.commands').label(t(texts.help.invite))
			)
		} else if (platform instanceof Telegram) {
			buttons.push(
				new Button().url('https://t.me/tcgdex').label('Telegram Group'),
				new Button().url('https://t.me/tcgdex_bot?startgroup=true').label('Add me to a group')
			)
		}

		const commands = await Bot.get().getCommands(platform)
		const embed = new Embed()
		embed.title(t(texts.help.title))
		embed.description(t(texts.help.description, lang))
		for (const command of commands) {
			const { name, value } = this.formatCommand(command, prefix, undefined, lang)
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

	// eslint-disable-next-line complexity
	private formatCommand(command: Command, commandPrefix: string, prefix?: string, lang?: keyof Localized): {name: string, value: string} {
		const options = command.options?.map((opt) => `[${getLocalizedValue(opt.name, lang)}]`).join(' ')
		const optionsDescriptions = command.options?.map((opt) => this.formatOption(opt, prefix))
		const name = `${prefix ?? ''}\`${commandPrefix === '/' ? commandPrefix : `${commandPrefix} `}${getLocalizedValue(command.name, lang)}${options ? ' ' + options : ''}\``.trim()
		const value = `${prefix ?? ''}*${getLocalizedValue(command.description, lang) ?? ''}*\n${optionsDescriptions?.join('\n') ?? ''}`.trim()
		return { name, value }
	}

	private formatOption(option: CommandOptions, prefix?: string, lang?: keyof Localized) {
		if (option.type === CommandOptionType.COMMANDS) {
			let base = ''
			for (const subOpt of option.commands) {
				const sub = this.formatCommand(subOpt, '', `${prefix}`, lang)
				base += `${sub.name}: ${sub.value}`
			}
			return base
		}
		const base = `${prefix ?? ''} **${getLocalizedValue(option.name, lang)}** ${option.required ? '' : `(${t(texts.help.optionnal)})`}\n*${getLocalizedValue(option.description, lang)}*`

		return base
	}
}
